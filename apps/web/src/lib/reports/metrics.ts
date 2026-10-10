import type { AnalysisResult, Prioridade } from "@/lib/schemas/analysis";

export interface DashboardMetrics {
  total: number;
  porPrioridade: Record<Prioridade, number>;
  porCategoria: { categoria: string; count: number }[];
  confiancaMedia: number;
  requerRevisao: number;
  requerRevisaoPct: number;
}

export function computeDashboardMetrics(
  analyses: AnalysisResult[]
): DashboardMetrics {
  const total = analyses.length;

  const porPrioridade: Record<Prioridade, number> = {
    critica: 0,
    alta: 0,
    media: 0,
    baixa: 0,
  };

  const categoriaCounts = new Map<string, number>();
  let confiancaSoma = 0;
  let requerRevisao = 0;

  for (const a of analyses) {
    porPrioridade[a.prioridade] = (porPrioridade[a.prioridade] || 0) + 1;
    categoriaCounts.set(a.categoria, (categoriaCounts.get(a.categoria) || 0) + 1);
    confiancaSoma += a.confianca;
    if (a.requerRevisaoHumana) requerRevisao += 1;
  }

  const porCategoria = Array.from(categoriaCounts.entries())
    .map(([categoria, count]) => ({ categoria, count }))
    .sort((a, b) => b.count - a.count);

  const confiancaMedia = total
    ? Math.round((confiancaSoma / total) * 10) / 10
    : 0;

  const requerRevisaoPct = total
    ? Math.round((requerRevisao / total) * 1000) / 10
    : 0;

  return {
    total,
    porPrioridade,
    porCategoria,
    confiancaMedia,
    requerRevisao,
    requerRevisaoPct,
  };
}