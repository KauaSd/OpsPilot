import { describe, it, expect } from "vitest";
import { createAnalysisSchema, tomEnum, canalEnum, prioridadeEnum } from "../analysis";

describe("Schema de Criação de Análise (Zod)", () => {
  it("valida relato válido com canal e tom permitidos", () => {
    const input = {
      relato: "Cliente relatou cobrança duplicada no cartão corporativo durante o fechamento contábil.",
      tom: "empatico",
      canal: "ticket",
    };
    const result = createAnalysisSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tom).toBe("empatico");
      expect(result.data.canal).toBe("ticket");
    }
  });

  it("rejeita relato com menos de 20 caracteres", () => {
    const input = {
      relato: "Erro no plano",
      tom: "neutro",
      canal: "email",
    };
    const result = createAnalysisSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejeita canal inválido 'voz'", () => {
    const result = canalEnum.safeParse("voz");
    expect(result.success).toBe(false);
  });

  it("rejeita tom inválido 'direto'", () => {
    const result = tomEnum.safeParse("direto");
    expect(result.success).toBe(false);
  });

  it("aceita os 5 canais oficiais: email, chat, ticket, reuniao, outro", () => {
    const canais = ["email", "chat", "ticket", "reuniao", "outro"];
    canais.forEach((c) => {
      expect(canalEnum.safeParse(c).success).toBe(true);
    });
  });

  it("aceita os 3 tons oficiais: formal, neutro, empatico", () => {
    const tons = ["formal", "neutro", "empatico"];
    tons.forEach((t) => {
      expect(tomEnum.safeParse(t).success).toBe(true);
    });
  });
});
