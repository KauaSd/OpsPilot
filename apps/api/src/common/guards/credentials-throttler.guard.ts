import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

/**
 * Rate limit por e-mail para endpoints de credenciais (login/register).
 * Necessário porque a API fica atrás do BFF: todos os requests chegam do mesmo IP,
 * então limites por IP bloqueariam todos os usuários juntos. Aqui rastreamos por
 * e-mail do corpo (normalizado), com fallback para IP.
 */
@Injectable()
export class CredentialsThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const email = (req.body as { email?: unknown } | undefined)?.email;
    if (typeof email === "string" && email.trim().length > 0) {
      return `email:${email.trim().toLowerCase()}`;
    }
    return `ip:${(req.ip as string | undefined) ?? "unknown"}`;
  }
}
