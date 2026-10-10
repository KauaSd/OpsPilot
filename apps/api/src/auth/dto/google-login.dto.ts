import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GoogleLoginDto {
  @ApiProperty({ example: "4/0AX4Xf..." })
  @IsString()
  @IsNotEmpty({ message: "O código de autorização é obrigatório" })
  code!: string;

  @ApiProperty({ example: "https://opspilot-web.onrender.com/api/auth/google/callback" })
  @IsString()
  @IsNotEmpty({ message: "A redirect URI é obrigatória" })
  redirectUri!: string;
}