import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum Canal {
  EMAIL = "email",
  CHAT = "chat",
  TICKET = "ticket",
  REUNIAO = "reuniao",
  OUTRO = "outro",
}

export enum Tom {
  FORMAL = "formal",
  NEUTRO = "neutro",
  EMPATICO = "empatico",
}

export class CreateAnalysisDto {
  @ApiProperty({ minLength: 20, maxLength: 8000 })
  @IsString()
  @MinLength(20, { message: "O relato deve ter no mínimo 20 caracteres" })
  @MaxLength(8000, { message: "O relato deve ter no máximo 8000 caracteres" })
  relato!: string;

  @ApiPropertyOptional({ enum: Tom })
  @IsOptional()
  @IsEnum(Tom, { message: "Tom inválido" })
  tom?: Tom;

  @ApiPropertyOptional({ enum: Canal })
  @IsOptional()
  @IsEnum(Canal, { message: "Canal inválido" })
  canal?: Canal;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  contextoAdicional?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Urgência deve ser um número de 1 a 5" })
  @Min(1)
  @Max(5)
  urgenciaUsuario?: number;
}
