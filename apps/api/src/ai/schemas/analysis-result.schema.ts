import { z } from "zod";

export const CATEGORIAS = [
  "financeiro",
  "suporte_tecnico",
  "comercial",
  "rh",
  "juridico",
  "infraestrutura",
  "outros",
] as const;

export const PRIORIDADES = ["critica", "alta", "media", "baixa"] as const;

export const SENTIMENTOS = [
  "positivo",
  "neutro",
  "negativo",
  "muito_negativo",
] as const;

export const categoriaEnum = z.enum(CATEGORIAS);
export const prioridadeEnum = z.enum(PRIORIDADES);
export const sentimentoEnum = z.enum(SENTIMENTOS);

export const acaoRecomendadaSchema = z.object({
  acao: z.string().min(1),
  responsavelSugerido: z.string(),
  prazoSugerido: z.string(),
});

export const analysisResultSchema = z.object({
  resumo: z.string().min(1).max(400),
  categoria: categoriaEnum,
  prioridade: prioridadeEnum,
  justificativaPrioridade: z.string().min(1),
  sentimento: sentimentoEnum,
  riscos: z.array(z.string()),
  acoesRecomendadas: z.array(acaoRecomendadaSchema),
  informacoesFaltantes: z.array(z.string()),
  respostaSugerida: z.string(),
  confianca: z.number().min(0).max(1),
  requerRevisaoHumana: z.boolean(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AcaoRecomendada = z.infer<typeof acaoRecomendadaSchema>;
