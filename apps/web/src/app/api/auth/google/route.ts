import { NextRequest, NextResponse } from "next/server";
import { resolveApiBase } from "@/lib/api/backend-url";
import { clientKey, rateLimit } from "@/lib/api/rate-limit";

const SCOPE = "openid email profile";

function oauthUrl(origin: string, clientId: string, state: string): string {
  const qs = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: "code",
    scope: SCOPE,
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${qs.toString()}`;
}

function loginErrorRedirect(origin: string, message: string): NextResponse {
  const u = new URL(`${origin}/login`);
  u.searchParams.set("google", "error");
  u.searchParams.set("message", message);
  return NextResponse.redirect(u.toString());
}

export async function GET(request: NextRequest) {
  const limit = rateLimit(clientKey(request.headers, "google:start"), 20, 60_000);
  if (!limit.ok) {
    return loginErrorRedirect(
      request.nextUrl.origin,
      "Muitas tentativas de login com Google. Aguarde um instante."
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return loginErrorRedirect(
      request.nextUrl.origin,
      "Entrar com Google ainda não está configurado no servidor."
    );
  }

  const state = Array.from(
    crypto.getRandomValues(new Uint8Array(18)),
    (b) => b.toString(16).padStart(2, "0")
  ).join("");

  const res = NextResponse.redirect(oauthUrl(request.nextUrl.origin, clientId, state));
  res.cookies.set({
    name: "oauth_state",
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return res;
}