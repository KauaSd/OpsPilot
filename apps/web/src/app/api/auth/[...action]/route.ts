import { NextRequest, NextResponse } from "next/server";
import { loginSchema, registerSchema, AuthUser } from "@/lib/schemas/auth";
import { MOCK_USERS } from "@/lib/api/mockData";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params;
  const endpoint = action?.[0];
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
  const apiUrl = process.env.API_URL || "http://localhost:3001";

  if (endpoint === "login") {
    try {
      const body = await request.json();
      const validation = loginSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { message: "Dados de login inválidos", errors: validation.error.flatten() },
          { status: 400 }
        );
      }

      if (useMocks) {
        // Mock authentication
        const { email } = validation.data;
        const user: AuthUser = {
          id: "usr_ops_01",
          nome: email.split("@")[0].toUpperCase() + " (Analista)",
          email,
          cargo: "Analista de Triagem",
        };
        const mockToken = `mock_jwt_${Buffer.from(JSON.stringify(user)).toString("base64")}`;

        const res = NextResponse.json({ user, message: "Login realizado com sucesso" });
        setAuthCookie(res, mockToken);
        return res;
      }

      // Real API proxy
      const apiRes = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const data = await apiRes.json();
      if (!apiRes.ok) {
        return NextResponse.json(data, { status: apiRes.status });
      }

      const res = NextResponse.json({ user: data.user, message: "Login realizado" });
      if (data.token) {
        setAuthCookie(res, data.token);
      }
      return res;
    } catch (err: any) {
      return NextResponse.json(
        { message: err.message || "Erro interno de autenticação" },
        { status: 500 }
      );
    }
  }

  if (endpoint === "register") {
    try {
      const body = await request.json();
      const validation = registerSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { message: "Dados cadastrais inválidos", errors: validation.error.flatten() },
          { status: 400 }
        );
      }

      if (useMocks) {
        const { nome, email } = validation.data;
        const user: AuthUser = {
          id: `usr_${Date.now().toString(36)}`,
          nome,
          email,
          cargo: "Novo Analista OpsPilot",
        };
        const mockToken = `mock_jwt_${Buffer.from(JSON.stringify(user)).toString("base64")}`;

        const res = NextResponse.json({ user, message: "Conta criada com sucesso" });
        setAuthCookie(res, mockToken);
        return res;
      }

      // Real API proxy
      const apiRes = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const data = await apiRes.json();
      if (!apiRes.ok) {
        return NextResponse.json(data, { status: apiRes.status });
      }

      const res = NextResponse.json({ user: data.user, message: "Conta criada" });
      if (data.token) {
        setAuthCookie(res, data.token);
      }
      return res;
    } catch (err: any) {
      return NextResponse.json(
        { message: err.message || "Erro interno ao cadastrar" },
        { status: 500 }
      );
    }
  }

  if (endpoint === "logout") {
    const res = NextResponse.json({ message: "Sessão encerrada com sucesso" });
    clearAuthCookie(res);
    return res;
  }

  return NextResponse.json({ message: "Ação não encontrada" }, { status: 404 });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params;
  const endpoint = action?.[0];
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (endpoint === "me") {
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    if (token.startsWith("mock_jwt_")) {
      try {
        const jsonStr = Buffer.from(token.replace("mock_jwt_", ""), "base64").toString("utf-8");
        const user = JSON.parse(jsonStr);
        return NextResponse.json({ user });
      } catch {
        return NextResponse.json({ user: MOCK_USERS[0] });
      }
    }

    // Call real API
    const apiUrl = process.env.API_URL || "http://localhost:3001";
    try {
      const apiRes = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!apiRes.ok) {
        return NextResponse.json({ user: null }, { status: 401 });
      }
      const data = await apiRes.json();
      return NextResponse.json({ user: data.user });
    } catch {
      return NextResponse.json({ user: null }, { status: 401 });
    }
  }

  return NextResponse.json({ message: "Ação não encontrada" }, { status: 404 });
}
