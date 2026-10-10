import { Module } from "@nestjs/common";
import { GroqClient } from "./groq.client";
import { PromptLoaderService } from "./prompt-loader.service";
import { TriageAgent } from "./triage.agent";

@Module({
  providers: [GroqClient, PromptLoaderService, TriageAgent],
  exports: [TriageAgent],
})
export class AiModule {}
