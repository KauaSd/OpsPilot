import { describe, expect, it } from "vitest";
import {
  CATEGORIA_LABEL,
  categoriaLabelToEnum,
  toFrontAnalysis,
} from "./analysis-adapter";

const backDto = {
  id: "a1",
  relato: "Cliente relata cobrança duplicada no cartão",
  tom: "formal",
  canal: "email",
  resultado: {
    resumo: "Cobrança duplicada identificada",
    categoria: "financeiro",
    prioridade: "alta",
    justificativaPrioridade: "Impacto financeiro direto ao cliente",
    sentimento: "negativo",
    riscos: [
      {
        titulo: "Risco de chargeback",
        descricao: "Cliente pode contestar a cobrança junto ao banco.",
        nivel: "alto",
        impacto: "Perda do valor contestado",
      },
    ],
    acoesRecomendadas: [
      {
        acao: "Estornar a cobrança duplicada",
        responsavelSugerido: "Financeiro",
        prazoSugerido: "24h",
      },
    ],
    informacoesFaltantes: ["ID da transação"],
    respostaSugerida: "Vamos estornar o valor.",
    confianca: 0.83,
    requerRevisaoHumana: true,
  },
  meta: { modelo: "llama", latenciaMs: 100, tokens: 10, versaoPrompt: "v1" },
  createdAt: "2026-01-02T10:00:00.000Z",
  userId: "u1",
};

describe("analysis-adapter", () => {
  it("mapeia o DTO canônico para o shape do front", () => {
    const front = toFrontAnalysis(backDto as never);

    expect(front.id).toBe("a1");
    expect(front.relato).toBe(backDto.relato);
    expect(front.tom).toBe("formal");
    expect(front.canal).toBe("email");
    expect(front.diagnostico).toBe(
      "Cobrança duplicada identificada\n\nImpacto financeiro direto ao cliente"
    );
    expect(front.prioridade).toBe("alta");
    expect(front.sentimento).toBe("negativo");
    expect(front.confianca).toBe(83);
    expect(front.requerRevisaoHumana).toBe(true);
    expect(front.riscosIdentificados).toEqual([
      {
        titulo: "Risco de chargeback",
        descricao: "Cliente pode contestar a cobrança junto ao banco.",
        nivel: "alto",
        impacto: "Perda do valor contestado",
      },
    ]);
    expect(front.informacoesFaltantes).toEqual(["ID da transação"]);
    expect(front.respostaSugerida).toBe("Vamos estornar o valor.");
    expect(front.dataCriacao).toBe("2026-01-02T10:00:00.000Z");
    expect(front.usuarioId).toBe("u1");
  });

  it("converte categoria enum para rótulo pt-BR", () => {
    const front = toFrontAnalysis(backDto as never);
    expect(front.categoria).toBe("Financeiro");
    expect(CATEGORIA_LABEL.suporte_tecnico).toBe("Suporte Técnico");
  });

  it("mapeia planoDeAcao com ordem, título e descrição", () => {
    const front = toFrontAnalysis(backDto as never);
    expect(front.planoDeAcao).toEqual([
      {
        ordem: 1,
        titulo: "Estornar a cobrança duplicada",
        descricao: "Estornar a cobrança duplicada",
        responsavelSugerido: "Financeiro",
        prazoSugerido: "24h",
      },
    ]);
  });

  it("prioridade crítica vira sentimento urgente", () => {
    const front = toFrontAnalysis({
      ...backDto,
      resultado: {
        ...backDto.resultado,
        prioridade: "critica",
        sentimento: "muito_negativo",
      },
    } as never);
    expect(front.sentimento).toBe("urgente");
  });

  it("sentimento muito_negativo sem prioridade crítica vira negativo", () => {
    const front = toFrontAnalysis({
      ...backDto,
      resultado: {
        ...backDto.resultado,
        prioridade: "media",
        sentimento: "muito_negativo",
      },
    } as never);
    expect(front.sentimento).toBe("negativo");
  });

  it("converte riscos legados (string) em objetos estruturados", () => {
    const front = toFrontAnalysis({
      ...backDto,
      resultado: { ...backDto.resultado, riscos: ["Perda de receita"] },
    } as never);
    expect(front.riscosIdentificados).toEqual([
      {
        titulo: "Perda de receita",
        descricao: "Perda de receita",
        nivel: "medio",
        impacto: "",
      },
    ]);
  });

  it("normaliza nível numérico e chaves desconhecidas de risco", () => {
    const front = toFrontAnalysis({
      ...backDto,
      resultado: {
        ...backDto.resultado,
        riscos: [{ titulo: "Churn", descricao: "Cliente vai sair", nivel: "5" }],
      },
    } as never);
    expect(front.riscosIdentificados[0]).toEqual({
      titulo: "Churn",
      descricao: "Cliente vai sair",
      nivel: "critico",
      impacto: "",
    });
  });

  it("categoria desconhecida passa direto", () => {
    const front = toFrontAnalysis({
      ...backDto,
      resultado: { ...backDto.resultado, categoria: "custom" },
    } as never);
    expect(front.categoria).toBe("custom");
  });

  describe("categoriaLabelToEnum", () => {
    it("converte rótulo para enum", () => {
      expect(categoriaLabelToEnum("Suporte Técnico")).toBe("suporte_tecnico");
      expect(categoriaLabelToEnum("Financeiro")).toBe("financeiro");
    });

    it("ignora 'todas' e desconhecidos", () => {
      expect(categoriaLabelToEnum("todas")).toBeUndefined();
      expect(categoriaLabelToEnum("inexistente")).toBeUndefined();
      expect(categoriaLabelToEnum(undefined)).toBeUndefined();
    });
  });
});
