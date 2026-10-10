import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Groq from "groq-sdk";

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export class GroqTimeoutError extends Error {}
export class GroqBusyError extends Error {}
export class GroqError extends Error {
  detail?: string;
  constructor(message: string, detail?: string) {
    super(message);
    this.name = "GroqError";
    this.detail = detail;
  }
}

export interface GroqCompleteInput {
  system: string;
  user: string;
  timeoutMs?: number;
}

export interface GroqCompleteResult {
  text: string;
  usage: { totalTokens: number };
  model: string;
}

interface ChatCreateResponse {
  choices: Array<{ message?: { content?: string | null } }>;
  usage?: { total_tokens?: number };
  model?: string;
}

@Injectable()
export class GroqClient {
  private readonly logger = new Logger(GroqClient.name);
  private readonly client: Groq;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.client = new Groq({ apiKey: config.get<string>("GROQ_API_KEY") ?? "" });
    this.model = config.get<string>("GROQ_MODEL") ?? DEFAULT_GROQ_MODEL;
    this.timeoutMs = Number(config.get("GROQ_TIMEOUT_MS") ?? 25000);
  }

  async complete(input: GroqCompleteInput): Promise<GroqCompleteResult> {
    const timeoutMs = input.timeoutMs ?? this.timeoutMs;
    try {
      return await this.once(input, timeoutMs);
    } catch (err) {
      if (err instanceof GroqBusyError || err instanceof GroqError) {
        await this.delay(500);
        return this.once(input, timeoutMs);
      }
      throw err;
    }
  }

  private async once(
    input: GroqCompleteInput,
    timeoutMs: number
  ): Promise<GroqCompleteResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = (await this.client.chat.completions.create(
        {
          model: this.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: input.system },
            { role: "user", content: input.user },
          ],
        },
        { signal: controller.signal }
      )) as unknown as ChatCreateResponse;

      return {
        text: res.choices[0]?.message?.content ?? "",
        usage: { totalTokens: res.usage?.total_tokens ?? 0 },
        model: res.model ?? this.model,
      };
    } catch (err) {
      if (controller.signal.aborted) {
        throw new GroqTimeoutError("Tempo esgotado ao consultar a IA");
      }
      throw this.normalize(err);
    } finally {
      clearTimeout(timer);
    }
  }

  private normalize(err: unknown): Error {
    const status = (err as { status?: number })?.status;
    const upstream =
      (err as { error?: { message?: string; code?: string } })?.error?.message ??
      (err as { message?: string })?.message ??
      "desconhecido";
    const detail = `status=${status ?? "?"}: ${upstream}`;
    if (status === 429) {
      return new GroqBusyError("A IA está sobrecarregada");
    }
    if (status !== undefined && status >= 500) {
      this.logger.warn(`Groq indisponível (${detail})`);
      return new GroqError("Falha temporária na IA", detail);
    }
    this.logger.warn(`Groq recusou a requisição (${detail})`);
    return new GroqError("Falha ao consultar a IA", detail);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
