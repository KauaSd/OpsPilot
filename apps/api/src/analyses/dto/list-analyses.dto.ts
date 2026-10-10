import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CATEGORIAS, PRIORIDADES } from "../../ai/schemas/analysis-result.schema";

const CATEGORIA_VALUES = [...CATEGORIAS] as string[];
const PRIORIDADE_VALUES = [...PRIORIDADES] as string[];

export class ListAnalysesDto {
  @ApiPropertyOptional({ description: "Busca em relato, resumo e categoria" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: CATEGORIA_VALUES })
  @IsOptional()
  @IsIn(CATEGORIA_VALUES, { message: "Categoria inválida" })
  categoria?: string;

  @ApiPropertyOptional({ enum: PRIORIDADE_VALUES })
  @IsOptional()
  @IsIn(PRIORIDADE_VALUES, { message: "Prioridade inválida" })
  prioridade?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
