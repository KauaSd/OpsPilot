import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  senha: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  senha: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
}
