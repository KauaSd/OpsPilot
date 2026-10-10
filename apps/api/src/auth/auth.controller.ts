import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CredentialsThrottlerGuard } from "../common/guards/credentials-throttler.guard";
import {
  AuthenticatedUser,
  CurrentUser,
} from "./current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  @UseGuards(CredentialsThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Cria uma conta e devolve um token JWT" })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  @HttpCode(200)
  @UseGuards(CredentialsThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Autentica e devolve um token JWT" })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post("google")
  @HttpCode(200)
  @UseGuards(CredentialsThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: "Troca o código de autorização do Google por um token JWT" })
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.auth.googleLogin(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retorna o usuário autenticado" })
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
