export interface RateLimitResult {
  ok: boolean;
  retryAfter: number;
  remaining: number;
}

interface Entry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Entry>();

/**
 * Extrai uma chave de rate limit a partir do IP do cliente.
 * Respeita `x-forwarded-for` (primeiro IP) e `x-real-ip`, injetados pelo proxy do Render/Vercel.
 */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0] : headers.get("x-real-ip"))?.trim() ||
    "unknown";
  return `${scope}:${ip}`;
}

/**
 * Rate limit em memória (janela fixa). Adequado para processo Node persistente
 * (Render Web Service). Em ambiente serverless é por instância.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      remaining: 0,
    };
  }
  entry.count += 1;
  return { ok: true, retryAfter: 0, remaining: limit - entry.count };
}

export function resetRateLimit(key?: string): void {
  if (key) {
    buckets.delete(key);
  } else {
    buckets.clear();
  }
}
