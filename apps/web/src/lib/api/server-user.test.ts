import { afterEach, describe, expect, it, vi } from "vitest";
import { getUserFromToken } from "./server-user";

function mockUser(payload: Record<string, unknown> = {}) {
  return {
    id: "u1",
    nome: "Fulana de Tal",
    email: "fulana@empresa.com",
    cargo: "Analista",
    ...payload,
  };
}

describe("getUserFromToken", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna null sem token", async () => {
    expect(await getUserFromToken(undefined)).toBeNull();
    expect(await getUserFromToken("")).toBeNull();
  });

  it("decodifica o token de mock", async () => {
    const user = mockUser();
    const token = `mock_jwt_${Buffer.from(JSON.stringify(user)).toString("base64")}`;

    await expect(getUserFromToken(token)).resolves.toMatchObject({
      nome: "Fulana de Tal",
    });
  });

  it("busca o usuário na API com o token real", async () => {
    const user = mockUser();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getUserFromToken("jwt.real.token")).resolves.toMatchObject({
      nome: "Fulana de Tal",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toContain("/auth/me");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer jwt.real.token"
    );
  });

  it("retorna null quando a API responde erro", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 401 }))
    );
    await expect(getUserFromToken("jwt.expirado")).resolves.toBeNull();
  });

  it("retorna null quando a API está indisponível", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("net down")));
    await expect(getUserFromToken("jwt.qualquer")).resolves.toBeNull();
  });
});