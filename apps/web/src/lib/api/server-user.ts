import { AuthUser } from "@/lib/schemas/auth";
import { resolveApiBase } from "./backend-url";

export const AUTH_COOKIE_NAME = "auth_token";

function decodeMockToken(token: string): AuthUser | null {
  try {
    const json = Buffer.from(token.slice("mock_jwt_".length), "base64").toString(
      "utf-8"
    );
    return JSON.parse(json) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Resolve o usuário a partir do token de sessão (cookie `auth_token`).
 * Tokens de mock são decodificados localmente; tokens reais consultam a API.
 * Nunca lança: qualquer falha resulta em `null` (fallback de UI).
 */
export async function getUserFromToken(
  token: string | undefined
): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  if (token.startsWith("mock_jwt_")) {
    return decodeMockToken(token);
  }

  try {
    const apiUrl = resolveApiBase(process.env.API_URL);
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { user?: AuthUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}

/** Lê o cookie de sessão (Server Component) e resolve o usuário autenticado. */
export async function getServerUser(): Promise<AuthUser | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return getUserFromToken(store.get(AUTH_COOKIE_NAME)?.value);
}