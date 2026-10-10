"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Gavel,
  ArrowLeft,
  ArrowRight,
  Share2,
  AlertTriangle,
  ClipboardCheck,
  User,
  Timer,
  CheckCircle2,
  ScanSearch,
  HelpCircle,
  Sparkles,
  Copy,
  Edit3,
  Check,
  Send,
  RefreshCw,
  Loader2,
  Mail,
  FileSearch,
} from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalyses";
import { ConfidenceMeter } from "@/components/analysis/ConfidenceMeter";
import { CategoryBadge } from "@/components/analysis/CategoryBadge";
import { SentimentBadge } from "@/components/analysis/SentimentBadge";
import { PriorityBadge } from "@/components/analysis/PriorityBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { NivelRisco } from "@/lib/schemas/analysis";

const NIVEL_META: Record<
  NivelRisco,
  { label: string; badge: string; bar: string }
> = {
  critico: {
    label: "Nível Crítico",
    badge: "bg-error-container text-on-error-container",
    bar: "bg-error",
  },
  alto: {
    label: "Nível Alto",
    badge: "bg-tertiary-fixed text-on-tertiary-container",
    bar: "bg-tertiary-container",
  },
  medio: {
    label: "Nível Médio",
    badge: "bg-[rgba(202,138,4,0.12)] text-[#CA8A04]",
    bar: "bg-[#CA8A04]",
  },
  baixo: {
    label: "Nível Baixo",
    badge: "bg-[rgba(22,163,74,0.12)] text-[#16A34A]",
    bar: "bg-[#16A34A]",
  },
};

const TOM_LABEL: Record<string, string> = {
  formal: "Formal",
  neutro: "Neutro",
  empatico: "Empático",
};

export default function AnaliseResultadoPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const { data: analysis, isLoading, isError } = useAnalysis(id);

  const [done, setDone] = React.useState<Set<number>>(new Set());
  const [copied, setCopied] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const minutaRef = React.useRef<HTMLTextAreaElement>(null);

  const toggleChecklist = (ordem: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(ordem)) {
        next.delete(ordem);
      } else {
        next.add(ordem);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-space-md">
        <div className="h-24 bg-surface-container-low rounded-xl animate-pulse" />
        <div className="h-32 bg-surface-container-low rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="h-48 bg-surface-container-low rounded-xl animate-pulse" />
            <div className="h-48 bg-surface-container-low rounded-xl animate-pulse" />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="h-72 bg-surface-container-low rounded-xl animate-pulse" />
            <div className="h-24 bg-surface-container-low rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-space-md py-20 text-center">
        <div className="p-3 rounded-full bg-error-container text-on-error-container">
          <FileSearch className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Análise não encontrada
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Não foi possível carregar o diagnóstico solicitado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/analises/nova")}
          className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary-container text-on-primary-fixed font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Voltar para Nova Análise
        </button>
      </div>
    );
  }

  const riscos = analysis.riscosIdentificados ?? [];
  const acoes = analysis.planoDeAcao ?? [];
  const faltantes = analysis.informacoesFaltantes ?? [];
  const categoria = analysis.categoria || "Não classificada";
  const minutaText = analysis.respostaSugerida?.trim() || "";
  const completedCount = acoes.filter((a) => done.has(a.ordem)).length;
  const showBanner = analysis.requerRevisaoHumana;

  const handleCopyMinuta = () => {
    const text = minutaRef.current?.value || minutaText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Minuta copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApproveSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success("Resposta aprovada e pronta para despacho!");
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Banner de Atenção Operacional */}
      {showBanner && (
        <div className="w-full mb-space-lg">
          <div className="rounded-xl bg-tertiary-fixed text-on-surface p-space-md shadow-sm relative overflow-hidden flex items-start gap-space-md">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-tertiary/10 rounded-full blur-xl pointer-events-none" />
            <div className="shrink-0 p-2 rounded-lg bg-tertiary-container/40 text-on-tertiary-container flex items-center justify-center">
              <Gavel className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs mb-1">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Atenção Operacional: Requer revisão humana antes do envio
                </span>
                <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm uppercase tracking-wider">
                  Ação Bloqueada
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                A IA sinalizou esta solicitação como de alto risco (jurídico,
                financeiro de alto valor, ameaça, dados sensíveis ou baixa
                confiança). Valide o diagnóstico e revise a minuta abaixo antes
                do disparo definitivo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Executive Header & Metadata Cockpit */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-md">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mb-1">
              <span className="inline-flex items-center gap-1 font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                ID: {analysis.id}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Mail
                  className="h-[14px] w-[14px]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Canal: {analysis.canal}
              </span>
              <span>•</span>
              <span>
                {new Date(analysis.dataCriacao).toLocaleString("pt-BR")}
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Diagnóstico #{analysis.id} — {categoria}
            </h1>
            {analysis.diagnostico && (
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-3xl whitespace-pre-line">
                {analysis.diagnostico}
              </p>
            )}
          </div>

          {/* Incident Navigation Controls */}
          <div className="flex items-center gap-space-xs self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => router.push("/analises/nova")}
              title="Nova análise"
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <ArrowLeft
                className="h-[18px] w-[18px]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => router.push("/analises/nova")}
              title="Nova análise"
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <ArrowRight
                className="h-[18px] w-[18px]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() =>
                toast.success("Relatório de diagnóstico exportado em PDF e JSON.")
              }
              className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Exportar Análise
            </button>
          </div>
        </div>

        {/* Metadata Badges & AI Confidence Indicator */}
        <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
          <CategoryBadge category={categoria} />
          <PriorityBadge priority={analysis.prioridade} />
          <SentimentBadge sentiment={analysis.sentimento} />
          <ConfidenceMeter
            confidence={analysis.confianca}
            modelVersion=""
            className="ml-auto"
          />
        </div>
      </div>

      {/* Main Grid: 2 Columns (7 left / 5 right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* SECTION 1: Identified Risks */}
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className="h-[18px] w-[18px] text-error"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Riscos Operacionais e Contratuais
                </h2>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                {riscos.length}{" "}
                {riscos.length === 1 ? "risco identificado" : "riscos identificados"}
              </span>
            </div>

            {riscos.length === 0 ? (
              <div className="rounded-xl bg-surface-container-low p-space-md text-on-surface-variant font-body-md text-body-md">
                Nenhum risco relevante identificado pela IA para esta
                solicitação.
              </div>
            ) : (
              riscos.map((risco, index) => {
                const meta = NIVEL_META[risco.nivel] ?? NIVEL_META.medio;
                return (
                  <div
                    key={`${risco.titulo}-${index}`}
                    className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm relative overflow-hidden"
                  >
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1.5",
                        meta.bar
                      )}
                    />
                    <div className="pl-2">
                      <div className="flex flex-wrap items-start justify-between gap-space-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm text-on-surface">
                            {risco.titulo}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded font-label-sm text-label-sm uppercase font-semibold",
                              meta.badge
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {risco.impacto && (
                          <span className="font-code-sm text-code-sm text-on-surface-variant font-semibold shrink-0">
                            Impacto: {risco.impacto}
                          </span>
                        )}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        {risco.descricao}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SECTION 2: Action Checklist */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <ClipboardCheck
                  className="h-[18px] w-[18px] text-primary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Checklist de Ações Recomendadas
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm tabular-nums">
                {completedCount} de {acoes.length} concluídas
              </span>
            </div>

            {acoes.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Nenhuma ação recomendada para esta solicitação.
              </p>
            ) : (
              <div className="flex flex-col gap-space-sm">
                {acoes.map((item) => {
                  const concluido = done.has(item.ordem);
                  return (
                    <div
                      key={item.ordem}
                      className={cn(
                        "flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none",
                        concluido && "opacity-75"
                      )}
                      onClick={() => toggleChecklist(item.ordem)}
                    >
                      <input
                        type="checkbox"
                        checked={concluido}
                        onChange={() => toggleChecklist(item.ordem)}
                        className="mt-1 h-4 w-4 rounded accent-primary text-on-primary cursor-pointer shrink-0"
                        aria-label={item.titulo}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          className={cn(
                            "font-body-md text-body-md text-on-surface font-medium cursor-pointer block",
                            concluido && "line-through text-on-surface-variant"
                          )}
                        >
                          {item.titulo}
                        </label>
                        {item.descricao && item.descricao !== item.titulo && (
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                            {item.descricao}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-space-sm mt-1">
                          {item.responsavelSugerido && (
                            <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                              <User
                                className="h-[14px] w-[14px]"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                              {item.responsavelSugerido}
                            </span>
                          )}
                          {item.prazoSugerido && (
                            <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                              <Timer
                                className="h-[14px] w-[14px]"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                              Prazo: {item.prazoSugerido}
                            </span>
                          )}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-label-sm text-label-sm px-1.5 py-0.5 rounded",
                              concluido
                                ? "bg-surface-container-highest text-on-surface-variant"
                                : "bg-tertiary-fixed text-on-tertiary-container"
                            )}
                          >
                            {concluido && (
                              <CheckCircle2
                                className="h-3 w-3 text-primary"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                            )}
                            {concluido ? "Concluído" : "Pendente"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: Missing Information */}
          <div className="rounded-xl bg-surface-container p-space-md shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ScanSearch
                className="h-[18px] w-[18px] text-tertiary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Informações Faltantes para Fechamento Completo
              </h3>
            </div>
            {faltantes.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                A IA não identificou lacunas de informação nesta solicitação.
              </p>
            ) : (
              <>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                  A IA identificou lacunas nos dados enviados. É recomendado
                  solicitar cordialmente estas confirmações:
                </p>
                <ul className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface">
                  {faltantes.map((info, index) => (
                    <li
                      key={`${info}-${index}`}
                      className="flex items-start gap-2"
                    >
                      <HelpCircle
                        className="h-4 w-4 text-tertiary shrink-0 mt-0.5"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span>{info}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — AI Suggested Response Panel */}
        <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-20">
          {/* Primary AI Suggestion Container */}
          <div className="rounded-xl bg-tertiary-fixed text-on-surface p-space-lg shadow-md relative">
            {/* Panel Header */}
            <div className="flex items-start justify-between gap-space-sm mb-space-md pb-space-sm border-b border-tertiary-container/30">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles
                    className="h-[18px] w-[18px] text-tertiary"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-tertiary-fixed-variant">
                    OpsPilot Suggestion
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Resposta Sugerida
                </h2>
                <p className="font-code-sm text-code-sm text-on-surface-variant">
                  Tom: {TOM_LABEL[analysis.tom] ?? analysis.tom}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-semibold shrink-0">
                {sent ? "Aprovado" : "Pronto para Envio"}
              </span>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Minuta Pré-Formatada:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyMinuta}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors shadow-sm"
                >
                  {copied ? (
                    <Check
                      className="h-[14px] w-[14px] text-primary"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ) : (
                    <Copy
                      className="h-[14px] w-[14px]"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Modo de edição rápida aberto.")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors shadow-sm"
                >
                  <Edit3
                    className="h-[14px] w-[14px]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Editar no Editor
                </button>
              </div>
            </div>

            {/* Response Body Area */}
            <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-inner mb-space-md">
              <textarea
                ref={minutaRef}
                className="w-full bg-transparent font-body-md text-body-md text-on-surface resize-none focus:outline-none leading-relaxed"
                rows={13}
                defaultValue={minutaText}
                placeholder="A IA não gerou uma resposta sugerida."
              />
            </div>

            {/* Main Submission Button */}
            <div className="flex flex-col gap-space-xs">
              <button
                type="button"
                onClick={handleApproveSend}
                disabled={sending || sent}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container text-on-primary-fixed font-label-md text-label-md font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : sent ? (
                  <Check
                    className="h-5 w-5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : (
                  <Send
                    className="h-5 w-5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}
                {sending
                  ? "Processando..."
                  : sent
                  ? "Resposta Aprovada"
                  : "Aprovar Resposta"}
              </button>
              <div className="flex items-center justify-between pt-1 px-1">
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Regerando minuta com outro tom...")
                  }
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary hover:underline"
                >
                  <RefreshCw
                    className="h-[14px] w-[14px]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Regerar resposta com outro tom
                </button>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  Atalho: ⌘ + Enter
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
