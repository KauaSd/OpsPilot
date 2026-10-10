import { Test } from "@nestjs/testing";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

interface FakeUser {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  createdAt: Date;
}

describe("AuthService", () => {
  let service: AuthService;
  const store = new Map<string, FakeUser>();

  const usersService = {
    findByEmail: jest.fn(async (email: string) => store.get(email) ?? null),
    findById: jest.fn(
      async (id: string) => [...store.values()].find((u) => u.id === id) ?? null
    ),
    create: jest.fn(
      async (data: { nome: string; email: string; senhaHash: string }) => {
        const user: FakeUser = {
          id: `u${store.size + 1}`,
          createdAt: new Date(),
          ...data,
        };
        store.set(data.email, user);
        return user;
      }
    ),
  };

  const jwtService = {
    signAsync: jest.fn(async () => "signed.jwt.token"),
  };

  beforeEach(async () => {
    store.clear();
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it("registra usuário, faz hash da senha e devolve token", async () => {
    const { user, token } = await service.register({
      nome: "Ana",
      email: "ana@x.com",
      senha: "segredo1",
    });

    expect(token).toBe("signed.jwt.token");
    expect(user.email).toBe("ana@x.com");
    expect((user as unknown as Record<string, unknown>).senhaHash).toBeUndefined();

    const stored = store.get("ana@x.com");
    expect(stored).toBeDefined();
    expect(stored!.senhaHash).not.toBe("segredo1");
    expect(await bcrypt.compare("segredo1", stored!.senhaHash)).toBe(true);
  });

  it("rejeita email duplicado com ConflictException", async () => {
    await service.register({ nome: "Ana", email: "ana@x.com", senha: "segredo1" });
    await expect(
      service.register({ nome: "Outra", email: "ana@x.com", senha: "segredo2" })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejeita login com senha errada com UnauthorizedException", async () => {
    await service.register({ nome: "Ana", email: "ana@x.com", senha: "segredo1" });
    await expect(
      service.login({ email: "ana@x.com", senha: "errada" })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejeita login de usuário inexistente", async () => {
    await expect(
      service.login({ email: "naoexiste@x.com", senha: "segredo1" })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("faz login com credenciais válidas", async () => {
    await service.register({ nome: "Ana", email: "ana@x.com", senha: "segredo1" });
    const { token, user } = await service.login({
      email: "ana@x.com",
      senha: "segredo1",
    });
    expect(token).toBe("signed.jwt.token");
    expect(user.id).toBe("u1");
  });
});
