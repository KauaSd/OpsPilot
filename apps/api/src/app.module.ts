import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { configuration } from "./common/config/configuration";
import { validateEnv } from "./common/config/env.validation";
import { AiModule } from "./ai/ai.module";
import { AnalysesModule } from "./analyses/analyses.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      load: [configuration],
      envFilePath: [".env"],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        redact: {
          paths: ["req.headers.authorization", "req.headers.cookie"],
          remove: true,
        },
        transport:
          process.env.NODE_ENV === "development"
            ? {
                target: "pino-pretty",
                options: { singleLine: true, colorize: true },
              }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60_000, limit: 60 },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    AiModule,
    AnalysesModule,
    HealthModule,
  ],
})
export class AppModule {}
