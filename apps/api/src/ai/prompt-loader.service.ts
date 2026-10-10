import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

@Injectable()
export class PromptLoaderService {
  private readonly logger = new Logger(PromptLoaderService.name);
  private readonly cache = new Map<string, string>();

  load(version: string): string {
    const cached = this.cache.get(version);
    if (cached !== undefined) {
      return cached;
    }

    const path = this.resolve(version);
    if (!existsSync(path)) {
      this.logger.error(`Prompt não encontrado: ${path}`);
      throw new InternalServerErrorException({
        code: "PROMPT_NOT_FOUND",
        message: "Configuração de prompt indisponível",
      });
    }

    const content = readFileSync(path, "utf8");
    this.cache.set(version, content);
    return content;
  }

  private resolve(version: string): string {
    const base =
      process.env.PROMPTS_DIR ??
      join(__dirname, "..", "..", "..", "..", "prompts");
    return join(base, "triage", version, "system.md");
  }
}
