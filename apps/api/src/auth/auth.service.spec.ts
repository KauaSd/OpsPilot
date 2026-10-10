import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import {
  BadGatewayException,
  ConflictException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

interface FakeUser {
  id: string;
  nome: string;
  email: string;
  senhaHash: string | null;
  provider: string;
  googleId: string | null;
  createdAt: Date;
}

const configValues: Record<string, string> = {};

function googleTokenResponse(accessToken = "at-123") {
  return new Response(JSON.stringify({ access_token: accessToken }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function googleUserInfoResponse(overrides: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      sub: "g-sub-1",
      email: "ana.google@gmail.com",
      email_verified: true,
      name: "Ana Google",
      ...overrides,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

describe("AuthService", () => {
  let service: AuthService;
  const store = new Map<string, FakeUser>();

  const usersService = {
    findByEmail: jest.fn(async (email: string) => store.get(email) ?? null),
    findByGoogleId: jest.fn(async () => null),
    findById: jest.fn(
      async (id: string) => [...store.values()].find((u) => u.id === id) ?? null
    ),
    create: jest.fn(
      async (data: {
        nome: string;
        email: string;
        senhaHash: string | null;
        provider: string;
        googleId: string | null;
      }) => {
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

  const configService = {
    get: jest.fn((key: string) => configValues[key]),
  };

  beforeEach(async () => {
    store.clear();
    jest.clearAllMocks();
    for (const key of Object.keys(configValues)) {
      delete configValues[key];
    }
    global.fetch = jest.fn() as unknown as typeof fetch;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
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
    expect(stored!.provider).toBe("local");
    expect(stored!.senhaHash).not.toBe("segredo1");
    expect(await bcrypt.compare("segredo1", stored!.senhaHash!)).toBe(true);
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

  it("falha com ServiceUnavailableException quando o Google não está configurado", async () => {
    await expect(
      service.googleLogin({ code: "code-x", redirectUri: "https://web/cb" })
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("cria usuário automaticamente no primeiro login via Google", async () => {
    configValues.GOOGLE_CLIENT_ID = "client-id";
    configValues.GOOGLE_CLIENT_SECRET = "client-secret";
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(googleTokenResponse())
      .mockResolvedValueOnce(googleUserInfoResponse());

    const { token, user } = await service.googleLogin({
      code: "code-x",
      redirectUri: "https://web/api/auth/google/callback",
    });

    expect(token).toBe("signed.jwt.token");
    expect(user.email).toBe("ana.google@gmail.com");
    const created = store.get("ana.google@gmail.com");
    expect(created).toBeDefined();
    expect(created!.provider).toBe("google");
    expect(created!.googleId).toBe("g-sub-1");
    expect(created!.senhaHash).toBeNull();
  });

  it("reutiliza a conta Google existente no próximo login", async () => {
    configValues.GOOGLE_CLIENT_ID = "client-id";
    configValues.GOOGLE_CLIENT_SECRET = "client-secret";
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(googleTokenResponse())
      .mockResolvedValueOnce(googleUserInfoResponse());

    const first = await service.googleLogin({
      code: "code-x",
      redirectUri: "https://web/api/auth/google/callback",
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(googleTokenResponse())
      .mockResolvedValueOnce(googleUserInfoResponse());

    const second = await service.googleLogin({
      code: "code-x",
      redirectUri: "https://web/api/auth/google/callback",
    });

    expect(first.user.id).toBe(second.user.id);
    expect(store.size).toBe(1);
  });

  it("rejeita conta Google quando existe conta por senha com o mesmo e-mail", async () => {
    configValues.GOOGLE_CLIENT_ID = "client-id";
    configValues.GOOGLE_CLIENT_SECRET = "client-secret";
    await service.register({
      nome: "Ana",
      email: "ana.google@gmail.com",
      senha: "segredo1",
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(googleTokenResponse())
      .mockResolvedValueOnce(googleUserInfoResponse());

    await expect(
      service.googleLogin({
        code: "code-x",
        redirectUri: "https://web/api/auth/google/callback",
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejeita e-mail do Google não verificado", async () => {
    configValues.GOOGLE_CLIENT_ID = "client-id";
    configValues.GOOGLE_CLIENT_SECRET = "client-secret";
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(googleTokenResponse())
      .mockResolvedValueOnce(googleUserInfoResponse({ email_verified: false }));

    await expect(
      service.googleLogin({
        code: "code-x",
        redirectUri: "https://web/api/auth/google/callback",
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("propaga UnauthorizedException quando o Google rejeita o código", async () => {
    configValues.GOOGLE_CLIENT_ID = "client-id";
    configValues.GOOGLE_CLIENT_SECRET = "client-secret";
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 })
    );

    await expect(
      service.googleLogin({
        code: "code-x",
        redirectUri: "https://web/api/auth/google/callback",
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("falha com BadGatewayException quando o Google está fora do ar", async () => {
    configValues.GOOGLE_CLIENT_ID = "client-id";
    configValues.GOOGLE_CLIENT_SECRET = "client-secret";
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("net down"));

    await expect(
      service.googleLogin({
        code: "code-x",
        redirectUri: "https://web/api/auth/google/callback",
      })
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});