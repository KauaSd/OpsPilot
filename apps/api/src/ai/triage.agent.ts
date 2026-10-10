import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ZodError } from "zod";
import { hasInjection } from "./guardrails";
import {
  GroqBusyError,
  GroqClient,
  GroqCompleteResult,
  GroqError,
  GroqTimeoutError,
} from "./groq.client";
import { PromptLoaderService } from "./prompt-loader.service";
import {
  AnalysisResult,
  analysisResultSchema,
} from "./schemas/analysis-result.schema";

export interface TriageInput {
  relato: string;
  tom?: string;
  canal?: string;
  contextoAdicional?: string;
  urgenciaUsuario?: number;
}

export interface TriageMeta {
  modelo: string;
  latenciaMs: number;
  tokens: number;
  versaoPrompt: string;
}

export interface TriageOutput {
  resultado: AnalysisResult;
  meta: TriageMeta;
}

type Attempt =
  | { ok: true; value: AnalysisResult; tokens: number; model: string }
  | { ok: false; error: string; tokens: number; model: string };

@Injectable()
export class TriageAgent {
  private readonly logger = new Logger(TriageAgent.name);

  constructor(
    private readonly prompts: PromptLoaderService,
    private readonly groq: GroqClient,
    private readonly config: ConfigService
  ) {}

  async run(input: TriageInput): Promise<TriageOutput> {
    const versaoPrompt = this.config.get<string>("PROMPT_VERSION") ?? "v1";
    const system = this.prompts.load(versaoPrompt);
    const user = this.buildUserMessage(input);
    const startedAt = Date.now();

    let attempt = await this.attempt(system, user);
    if (!attempt.ok) {
      const repairUser = this.buildRepairMessage(user, attempt.error);
      attempt = await this.attempt(system, repairUser);
    }

    if (!attempt.ok) {
      this.logger.warn(
        `IA retornou saída inválida após reparo: ${attempt.error}`
      );
      throw new BadGatewayException({
        code: "AI_UPSTREAM_ERROR",
        message: `A IA retornou uma resposta inválida (${attempt.error})`,
      });
    }

    const resultado = this.withInjectionRisk(input.relato, attempt.value);

    return {
      resultado,
      meta: {
        modelo: attempt.model,
        latenciaMs: Date.now() - startedAt,
        tokens: attempt.tokens,
        versaoPrompt,
      },
    };
  }

  private async attempt(system: string, user: string): Promise<Attempt> {
    const res = await this.callGroq(system, user);
    try {
      const json = this.parseJson(res.text);
      const value = analysisResultSchema.parse(json);
      return {
        ok: true,
        value,
        tokens: res.usage.totalTokens,
        model: res.model,
      };
    } catch (err) {
      return {
        ok: false,
        error: this.describe(err),
        tokens: res.usage.totalTokens,
        model: res.model,
      };
    }
  }

  private parseJson(text: string): unknown {
    let t = text.trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      t = fence[1].trim();
    }
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) {
      t = t.slice(start, end + 1);
    }
    return JSON.parse(t) as unknown;
  }

  private async callGroq(
    system: string,
    user: string
  ): Promise<GroqCompleteResult> {
    try {
      return await this.groq.complete({ system, user });
    } catch (err) {
      if (err instanceof GroqTimeoutError) {
        throw new GatewayTimeoutException({
          code: "AI_TIMEOUT",
          message: "A IA demorou demais para responder",
        });
      }
      if (err instanceof GroqBusyError) {
        throw new ServiceUnavailableException({
          code: "AI_BUSY",
          message: "A IA está sobrecarregada. Tente novamente em instantes",
        });
      }
      if (err instanceof GroqError) {
        throw new BadGatewayException({
          code: "AI_UPSTREAM_ERROR",
          message: err.detail
            ? `Falha ao consultar a IA (${err.detail})`
            : "Falha ao consultar a IA",
        });
      }
      throw err;
    }
  }

  private buildUserMessage(input: TriageInput): string {
    const lines: string[] = [];
    if (input.canal) lines.push(`canal: ${input.canal}`);
    if (input.tom) lines.push(`tom: ${input.tom}`);
    if (input.urgenciaUsuario !== undefined) {
      lines.push(`urgenciaUsuario: ${input.urgenciaUsuario}`);
    }
    if (input.contextoAdicional) {
      lines.push(`contextoAdicional: ${input.contextoAdicional}`);
    }
    return `<solicitacao>\n${lines.join("\n")}\nrelato:\n${input.relato}\n</solicitacao>`;
  }

  private buildRepairMessage(user: string, error: string): string {
    return `${user}\n\nA resposta anterior foi inválida: ${error}. Responda APENAS com um objeto JSON válido, sem markdown e sem texto fora do JSON, contendo exatamente os campos exigidos.`;
  }

  private withInjectionRisk(
    relato: string,
    resultado: AnalysisResult
  ): AnalysisResult {
    if (!hasInjection(relato)) {
      return resultado;
    }
    const jaRegistrado = resultado.riscos.some((r) => /instru|injection/i.test(r));
    if (jaRegistrado) {
      return resultado;
    }
    return {
      ...resultado,
      riscos: [
        ...resultado.riscos,
        "Tentativa de instrução detectada no texto (possível prompt injection)",
      ],
    };
  }

  private describe(err: unknown): string {
    if (err instanceof ZodError) {
      return err.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ");
    }
    if (err instanceof SyntaxError) {
      return `JSON inválido: ${err.message}`;
    }
    return "saída inválida";
  }
}
