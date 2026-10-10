import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "mariana@empresa.com" })
  @IsEmail({}, { message: "Informe um e-mail válido" })
  email!: string;

  @ApiProperty({ example: "senha-segura-1" })
  @IsString()
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres" })
  senha!: string;
}
