import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  AuthenticatedUser,
  CurrentUser,
} from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserThrottlerGuard } from "../common/guards/user-throttler.guard";
import { AnalysesService } from "./analyses.service";
import { CreateAnalysisDto } from "./dto/create-analysis.dto";
import { ListAnalysesDto } from "./dto/list-analyses.dto";

@ApiTags("analyses")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserThrottlerGuard)
@Controller("analyses")
export class AnalysesController {
  constructor(private readonly analyses: AnalysesService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: "Cria e analisa um relato" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAnalysisDto
  ) {
    return this.analyses.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "Lista as análises do usuário autenticado" })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAnalysesDto
  ) {
    return this.analyses.list(user.id, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtém uma análise do usuário autenticado" })
  get(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.analyses.get(user.id, id);
  }
}
