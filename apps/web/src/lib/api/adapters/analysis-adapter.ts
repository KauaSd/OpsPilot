import type { AnalysisResult, Sentimento } from "../../schemas/analysis";

export interface BackAcaoRecomendada {
  acao: string;
  responsavelSugerido: string;
  prazoSugerido: string;
}

export interface BackAnalysisResult {
  resumo: string;
  categoria: string;
  prioridade: string;
  justificativaPrioridade: string;
  sentimento: string;
  riscos: string[];
  acoesRecomendadas: BackAcaoRecomendada[];
  informacoesFaltantes: string[];
  respostaSugerida: string;
  confianca: number;
  requerRevisaoHumana: boolean;
}

export interface BackAnalysisDto {
  id: string;
  relato: string;
  tom: string;
  canal: string;
  resultado: BackAnalysisResult;
  meta: unknown;
  createdAt: string;
  userId: string;
}

export interface BackPaginated {
  items: BackAnalysisDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CATEGORIA_LABEL: Record<string, string> = {
  financeiro: "Financeiro",
  suporte_tecnico: "Suporte Técnico",
  comercial: "Comercial",
  rh: "Recursos Humanos",
  juridico: "Jurídico",
  infraestrutura: "Infraestrutura",
  outros: "Outros",
};

export const CATEGORIA_ENUM: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORIA_LABEL).map(([enumValue, label]) => [label, enumValue])
);

export function categoriaLabelToEnum(label?: string): string | undefined {
  if (!label || label === "todas") {
    return undefined;
  }
  return CATEGORIA_ENUM[label];
}

function mapSentimento(
  prioridade: string,
  sentimento: string
): Sentimento {
  if (prioridade === "critica") {
    return "urgente";
  }
  if (sentimento === "muito_negativo") {
    return "negativo";
  }
  return sentimento as Sentimento;
}

export function toFrontAnalysis(dto: BackAnalysisDto): AnalysisResult {
  const r = dto.resultado;
  return {
    id: dto.id,
    relato: dto.relato,
    tom: dto.tom as AnalysisResult["tom"],
    canal: dto.canal as AnalysisResult["canal"],
    diagnostico: `${r.resumo}\n\n${r.justificativaPrioridade}`,
    categoria: CATEGORIA_LABEL[r.categoria] ?? r.categoria,
    prioridade: r.prioridade as AnalysisResult["prioridade"],
    sentimento: mapSentimento(r.prioridade, r.sentimento),
    confianca: Math.round(r.confianca * 100),
    requerRevisaoHumana: r.requerRevisaoHumana,
    planoDeAcao: r.acoesRecomendadas.map((a, i) => ({
      ordem: i + 1,
      titulo: a.acao,
      descricao: a.acao,
      responsavelSugerido: a.responsavelSugerido,
      prazoSugerido: a.prazoSugerido,
    })),
    informacoesFaltantes: r.informacoesFaltantes,
    riscosIdentificados: r.riscos,
    respostaSugerida: r.respostaSugerida,
    dataCriacao: dto.createdAt,
    usuarioId: dto.userId,
  };
}
