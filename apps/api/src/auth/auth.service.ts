import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

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

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService
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
    });

    return this.result(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const valid = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!valid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    return this.result(user);
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
