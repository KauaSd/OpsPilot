import {
  BadGatewayException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";

export interface PublicUser {
  id: string;
  nome: string;
  email: string;
  createdAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  nome: string;
}

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException("Já existe uma conta com este e-mail");
    }

    const senhaHash = await bcrypt.hash(dto.senha, SALT_ROUNDS);
    const user = await this.users.create({
      nome: dto.nome.trim(),
      email,
      senhaHash,
      provider: "local",
      googleId: null,
    });

    return this.result(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user || !user.senhaHash) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const valid = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!valid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    return this.result(user);
  }

  async googleLogin(dto: GoogleLoginDto): Promise<AuthResult> {
    const profile = await this.fetchGoogleProfile(dto.code, dto.redirectUri);
    if (!profile.emailVerified) {
      throw new UnauthorizedException(
        "O e-mail da conta Google não está verificado"
      );
    }

    const email = profile.email.trim().toLowerCase();
    let user = await this.users.findByEmail(email);
    if (user && user.provider !== "google") {
      throw new ConflictException(
        "Já existe uma conta criada por senha com este e-mail. Use e-mail e senha para entrar."
      );
    }

    if (!user) {
      user = await this.users.create({
        nome: profile.nome,
        email,
        senhaHash: null,
        provider: "google",
        googleId: profile.sub,
      });
    }

    return this.result(user);
  }

  private async fetchGoogleProfile(
    code: string,
    redirectUri: string
  ): Promise<GoogleProfile> {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    const clientSecret = this.config.get<string>("GOOGLE_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        "Entrar com Google não está configurado no servidor"
      );
    }

    let oauthData: Record<string, unknown>;
    try {
      const oauthRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      oauthData = (await oauthRes.json()) as Record<string, unknown>;
      if (!oauthRes.ok) {
        throw new UnauthorizedException("Falha ao validar o código do Google");
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new BadGatewayException("Falha na comunicação com o Google");
    }

    const accessToken = oauthData.access_token as string | undefined;
    if (!accessToken) {
      throw new UnauthorizedException("Resposta inválida do Google");
    }

    let userInfo: Record<string, unknown>;
    try {
      const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      userInfo = (await infoRes.json()) as Record<string, unknown>;
      if (!infoRes.ok) {
        throw new UnauthorizedException(
          "Falha ao obter os dados do usuário no Google"
        );
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new BadGatewayException("Falha na comunicação com o Google");
    }

    const email = userInfo.email as string | undefined;
    if (!email) {
      throw new UnauthorizedException("A conta Google não expôs um e-mail");
    }

    return {
      sub: String(userInfo.sub ?? ""),
      email,
      emailVerified: userInfo.email_verified !== false,
      nome: (userInfo.name as string) || email.split("@")[0],
    };
  }

  private async result(user: {
    id: string;
    nome: string;
    email: string;
    createdAt: Date;
  }): Promise<AuthResult> {
    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { user: this.toPublic(user), token };
  }

  private toPublic(user: {
    id: string;
    nome: string;
    email: string;
    createdAt: Date;
  }): PublicUser {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
