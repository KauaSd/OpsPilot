import { z } from "zod";

/**
 * Schema de validação das variáveis de ambiente.
 * Falha rápido na inicialização se algo estiver faltando/errado.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),

  // Banco de dados (PostgreSQL / Neon)
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),

  // Auth
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET deve ter no mínimo 16 caracteres"),
  JWT_EXPIRES_IN: z.string().default("1d"),

  // Groq (LLM) — a chave vive apenas aqui
  GROQ_API_KEY: z.string().default(""),
  GROQ_MODEL: z.string().default("openai/gpt-oss-120b"),
  GROQ_TIMEOUT_MS: z.coerce.number().int().positive().default(25000),

  // Prompt / CORS
  PROMPT_VERSION: z.string().default("v1"),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new Error(`Configuração de ambiente inválida -> ${issues}`);
  }
  return parsed.data;
}
