import { describe, expect, it, beforeEach } from "vitest";
import { clientKey, rateLimit, resetRateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimit());

  it("permite requisições até o limite", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("k", 3, 1000, 0).ok).toBe(true);
    }
  });

  it("bloqueia acima do limite e informa retryAfter", () => {
    rateLimit("k", 2, 1000, 0);
    rateLimit("k", 2, 1000, 0);
    const blocked = rateLimit("k", 2, 1000, 0);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("reseta após a janela", () => {
    rateLimit("k", 1, 1000, 0);
    expect(rateLimit("k", 1, 1000, 500).ok).toBe(false);
    expect(rateLimit("k", 1, 1000, 1001).ok).toBe(true);
  });

  it("isola chaves diferentes", () => {
    rateLimit("a", 1, 1000, 0);
    expect(rateLimit("b", 1, 1000, 0).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("usa o primeiro IP do x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientKey(h, "auth")).toBe("auth:1.2.3.4");
  });

  it("cai para x-real-ip e depois unknown", () => {
    expect(clientKey(new Headers({ "x-real-ip": "9.9.9.9" }), "auth")).toBe(
      "auth:9.9.9.9"
    );
    expect(clientKey(new Headers(), "auth")).toBe("auth:unknown");
  });
});
