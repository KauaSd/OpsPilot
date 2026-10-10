import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "Mariana Silva", minLength: 2 })
  @IsString()
  @MinLength(2, { message: "O nome deve ter no mínimo 2 caracteres" })
  @MaxLength(120)
  nome!: string;

  @ApiProperty({ example: "mariana@empresa.com" })
  @IsEmail({}, { message: "Informe um e-mail válido" })
  email!: string;

  @ApiProperty({ example: "senha-segura-1", minLength: 6 })
  @IsString()
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres" })
  @MaxLength(128)
  senha!: string;
}
