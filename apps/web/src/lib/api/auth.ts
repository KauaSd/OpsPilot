import { LoginInput, RegisterInput, AuthUser } from "../schemas/auth";

export const authApi = {
  async login(data: LoginInput): Promise<{ user: AuthUser; message?: string }> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.message || "Falha ao realizar login");
    }

    return body;
  },

  async register(data: RegisterInput): Promise<{ user: AuthUser; message?: string }> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.message || "Falha ao criar conta");
    }

    return body;
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },
};
