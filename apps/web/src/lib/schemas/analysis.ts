import { z } from "zod";

export const tomEnum = z.enum(["formal", "neutro", "empatico"]);
export type Tom = z.infer<typeof tomEnum>;

export const canalEnum = z.enum(["email", "chat", "ticket", "reuniao", "outro"]);
export type Canal = z.infer<typeof canalEnum>;

export const prioridadeEnum = z.enum(["critica", "alta", "media", "baixa"]);
export type Prioridade = z.infer<typeof prioridadeEnum>;

export const sentimentoEnum = z.enum(["positivo", "neutro", "negativo", "urgente"]);
export type Sentimento = z.infer<typeof sentimentoEnum>;

export const nivelRiscoEnum = z.enum(["baixo", "medio", "alto", "critico"]);
export type NivelRisco = z.infer<typeof nivelRiscoEnum>;

export const createAnalysisSchema = z.object({
  relato: z
    .string()
    .min(20, "O relato deve conter no mínimo 20 caracteres para triagem adequada"),
  tom: tomEnum.default("neutro"),
  canal: canalEnum.default("ticket"),
  urgenciaUsuario: z.coerce.number().min(1).max(5).optional(),
  contextoAdicional: z.string().optional(),
});

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;

export interface ActionItem {
  ordem: number;
  titulo: string;
  descricao: string;
  responsavelSugerido?: string;
  prazoSugerido?: string;
}

export interface RiscoIdentificado {
  titulo: string;
  descricao: string;
  nivel: NivelRisco;
  impacto?: string;
}

export interface AnalysisResult {
  id: string;
  relato: string;
  tom: Tom;
  canal: Canal;
  diagnostico: string;
  categoria: string;
  prioridade: Prioridade;
  sentimento: Sentimento;
  confianca: number; // 0 to 100
  requerRevisaoHumana: boolean;
  planoDeAcao: ActionItem[];
  informacoesFaltantes: string[];
  riscosIdentificados: RiscoIdentificado[];
  respostaSugerida: string;
  dataCriacao: string;
  usuarioId: string;
}

export interface AnalysisFilters {
  q?: string;
  prioridade?: Prioridade | "todas";
  categoria?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAnalyses {
  items: AnalysisResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
