import { NextRequest, NextResponse } from "next/server";
import { resolveApiBase } from "@/lib/api/backend-url";
import { clientKey, rateLimit } from "@/lib/api/rate-limit";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const STATE_COOKIE = "oauth_state";

function errorRedirect(origin: string, message: string): NextResponse {
  const u = new URL(`${origin}/login`);
  u.searchParams.set("google", "error");
  u.searchParams.set("message", message);
  return NextResponse.redirect(u.toString());
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const savedState = request.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !savedState || state !== savedState) {
    const res = errorRedirect(origin, "Falha na validação do login com Google. Tente novamente.");
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  const limit = rateLimit(clientKey(request.headers, "google:callback"), 20, 60_000);
  if (!limit.ok) {
    return errorRedirect(origin, "Muitas tentativas. Aguarde um instante e tente novamente.");
  }

  const apiUrl = resolveApiBase(process.env.API_URL);
  const redirectUri = `${origin}/api/auth/google/callback`;

  let data: { user?: { id: string }; token?: string; message?: string };
  try {
    const apiRes = await fetch(`${apiUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri }),
    });
    data = (await apiRes.json()) as typeof data;

    if (!apiRes.ok || !data.token) {
      const res = errorRedirect(
        origin,
        data?.message || "Não foi possível entrar com o Google."
      );
      res.cookies.delete(STATE_COOKIE);
      return res;
    }
  } catch {
    const res = errorRedirect(origin, "Falha na comunicação com o servidor. Tente novamente.");
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  const res = NextResponse.redirect(`${origin}/analises/nova?google=success`);
  res.cookies.set({
    name: COOKIE_NAME,
    value: data.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  res.cookies.delete(STATE_COOKIE);
  return res;
}