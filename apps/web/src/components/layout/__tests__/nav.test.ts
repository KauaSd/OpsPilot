import { describe, it, expect } from "vitest";
import { NAV_ITEMS } from "../nav";

describe("NAV_ITEMS", () => {
  it("expõe os 4 itens do mockup com hrefs corretos", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual([
      "/analises/nova",
      "/historico",
      "/relatorios",
      "/configuracoes",
    ]);
  });

  it("marca resultado de análise como Histórico", () => {
    expect(NAV_ITEMS[1].match("/analises/anl_123")).toBe(true);
    expect(NAV_ITEMS[1].match("/analises/nova")).toBe(false);
  });
});
