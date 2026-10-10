import { Env } from "./env.validation";

export interface AppConfig {
  nodeEnv: Env["NODE_ENV"];
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  groqApiKey: string;
  groqModel: string;
  groqTimeoutMs: number;
  promptVersion: string;
  webOrigin: string;
}

export function configuration(): { app: AppConfig } {
  const env = process.env as unknown as Env;
  return {
    app: {
      nodeEnv: (env.NODE_ENV as AppConfig["nodeEnv"]) ?? "development",
      port: Number(env.PORT ?? 3001),
      databaseUrl: env.DATABASE_URL,
      jwtSecret: env.JWT_SECRET,
      jwtExpiresIn: env.JWT_EXPIRES_IN ?? "1d",
      groqApiKey: env.GROQ_API_KEY ?? "",
      groqModel: env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      groqTimeoutMs: Number(env.GROQ_TIMEOUT_MS ?? 25000),
      promptVersion: env.PROMPT_VERSION ?? "v1",
      webOrigin: env.WEB_ORIGIN ?? "http://localhost:3000",
    },
  };
}
