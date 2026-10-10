import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { UserThrottlerGuard } from "../common/guards/user-throttler.guard";
import { AnalysesController } from "./analyses.controller";
import { AnalysesService } from "./analyses.service";

@Module({
  imports: [AiModule],
  controllers: [AnalysesController],
  providers: [AnalysesService, UserThrottlerGuard],
})
export class AnalysesModule {}
