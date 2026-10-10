import { describe, it, expect } from "vitest";
import { computeDashboardMetrics } from "../metrics";
import type { AnalysisResult } from "@/lib/schemas/analysis";

const base = (o: Partial<AnalysisResult>): AnalysisResult => ({
  id: "x",
  relato: "",
  tom: "neutro",
  canal: "ticket",
  diagnostico: "",
  categoria: "Cat",
  prioridade: "media",
  sentimento: "neutro",
  confianca: 90,
  requerRevisaoHumana: false,
  planoDeAcao: [],
  informacoesFaltantes: [],
  riscosIdentificados: [],
  respostaSugerida: "",
  dataCriacao: "",
  usuarioId: "u",
  ...o,
});

describe("computeDashboardMetrics", () => {
  it("array vazio retorna zeros", () => {
    const m = computeDashboardMetrics([]);
    expect(m.total).toBe(0);
    expect(m.confiancaMedia).toBe(0);
    expect(m.requerRevisaoPct).toBe(0);
  });

  it("conta prioridades, categorias e revisão", () => {
    const m = computeDashboardMetrics([
      base({ prioridade: "critica", categoria: "A", confianca: 80, requerRevisaoHumana: true }),
      base({ prioridade: "critica", categoria: "A", confianca: 100 }),
      base({ prioridade: "baixa", categoria: "B", confianca: 90 }),
    ]);
    expect(m.total).toBe(3);
    expect(m.porPrioridade.critica).toBe(2);
    expect(m.porCategoria[0]).toEqual({ categoria: "A", count: 2 });
    expect(m.confiancaMedia).toBe(90);
    expect(m.requerRevisaoPct).toBeCloseTo(33.3, 1);
  });
});