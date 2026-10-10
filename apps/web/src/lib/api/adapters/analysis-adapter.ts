import type {
  AnalysisResult,
  NivelRisco,
  RiscoIdentificado,
  Sentimento,
} from "../../schemas/analysis";

export interface BackAcaoRecomendada {
  acao: string;
  responsavelSugerido: string;
  prazoSugerido: string;
}

export interface BackRisco {
  titulo?: string;
  descricao?: string;
  nivel?: string;
  impacto?: string;
}

export interface BackAnalysisResult {
  resumo: string;
  categoria: string;
  prioridade: string;
  justificativaPrioridade: string;
  sentimento: string;
  // Formato estruturado atual; aceita também o legado (lista de strings).
  riscos: Array<BackRisco | string>;
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

const NIVEIS_RISCO: NivelRisco[] = ["baixo", "medio", "alto", "critico"];

function mapNivelRisco(raw?: string): NivelRisco {
  const v = (raw ?? "").toLowerCase().trim();
  if ((NIVEIS_RISCO as string[]).includes(v)) {
    return v as NivelRisco;
  }
  if (["critico", "crítico", "critical", "muito alto", "muito_alto"].includes(v)) {
    return "critico";
  }
  if (["alto", "high", "relevante"].includes(v)) {
    return "alto";
  }
  if (["medio", "médio", "medium", "moderado"].includes(v)) {
    return "medio";
  }
  if (["baixo", "low", "menor"].includes(v)) {
    return "baixo";
  }
  const n = Number(v);
  if (!Number.isNaN(n) && v !== "") {
    if (n >= 5) return "critico";
    if (n >= 4) return "alto";
    if (n >= 3) return "medio";
    return "baixo";
  }
  return "medio";
}

export function toFrontRisco(item: BackRisco | string): RiscoIdentificado {
  if (typeof item === "string") {
    return { titulo: item, descricao: item, nivel: "medio", impacto: "" };
  }
  const titulo = item.titulo ?? item.descricao ?? "";
  const descricao = item.descricao ?? item.titulo ?? "";
  return {
    titulo: titulo || descricao,
    descricao: descricao || titulo,
    nivel: mapNivelRisco(item.nivel),
    impacto: item.impacto ?? "",
  };
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
    riscosIdentificados: r.riscos.map(toFrontRisco),
    respostaSugerida: r.respostaSugerida,
    dataCriacao: dto.createdAt,
    usuarioId: dto.userId,
  };
}
