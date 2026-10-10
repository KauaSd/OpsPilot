"use client";

import * as React from "react";
import { ChevronRight, BarChart3, Loader2, Inbox, ClipboardCheck, Sparkles } from "lucide-react";
import { useAnalyses } from "@/hooks/useAnalyses";
import { computeDashboardMetrics } from "@/lib/reports/metrics";
import { Prioridade } from "@/lib/schemas/analysis";
import { cn } from "@/lib/utils";

const PRIORITY_LABELS: Record<Prioridade, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const PRIORITY_CHIP_CLASSES: Record<Prioridade, string> = {
  critica: "bg-error-container text-on-error-container",
  alta: "bg-tertiary-fixed text-on-tertiary-container",
  media: "bg-[rgba(202,138,4,0.12)] text-[#CA8A04]",
  baixa: "bg-[rgba(22,163,74,0.12)] text-[#16A34A]",
};

export default function RelatoriosPage() {
  const { data, isLoading } = useAnalyses({ limit: 100 });

  const metrics = React.useMemo(
    () => computeDashboardMetrics(data?.items || []),
    [data]
  );

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-space-md pb-space-lg">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mb-1">
            <span>OpsPilot</span>
            <ChevronRight className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-primary font-semibold">Relatórios</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Relatórios / Métricas
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Panorama consolidado das triagens processadas pela equipe de operações.
          </p>
        </div>
        <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2 shrink-0">
          <BarChart3 className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-label-md text-label-md text-on-surface-variant">
            IPC Dashboard
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
          <Loader2 className="h-6 w-6 animate-spin" strokeWidth={1.5} aria-hidden="true" />
          <p className="font-body-md text-body-md">Calculando métricas...</p>
        </div>
      ) : metrics.total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Inbox className="h-10 w-10 text-on-surface-variant/60" strokeWidth={1.5} />
          <p className="font-body-md text-body-md font-semibold text-on-surface">
            Nenhum diagnóstico disponível
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
            Realize uma análise de solicitação para gerar métricas de desempenho
            do pipeline neural.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-lg">
          {/* Cards principais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Total de Diagnósticos
              </span>
              <span className="font-headline-xl text-headline-xl text-on-surface tabular-nums font-semibold">
                {metrics.total}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                triagens processadas pelo motor neural
              </span>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Confiança Média da IA
              </span>
              <span className="font-headline-xl text-headline-xl text-on-surface tabular-nums font-semibold">
                {metrics.confiancaMedia.toLocaleString("pt-BR")}%
              </span>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-primary-container rounded-full"
                  style={{ width: `${Math.min(100, metrics.confiancaMedia)}%` }}
                />
              </div>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Requer Revisão Humana
              </span>
              <span className="font-headline-xl text-headline-xl text-on-surface tabular-nums font-semibold">
                {metrics.requerRevisaoPct.toLocaleString("pt-BR")}%
              </span>
              <span className="inline-flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                <ClipboardCheck className="h-4 w-4 text-tertiary" strokeWidth={1.5} aria-hidden="true" />
                {metrics.requerRevisao} {metrics.requerRevisao === 1 ? "caso aguardando" : "casos aguardando"} validação
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Distribuição por prioridade */}
            <div className="lg:col-span-5 rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Distribuição por Prioridade
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PRIORITY_LABELS) as Prioridade[]).map((p) => (
                  <div
                    key={p}
                    className={cn(
                      "inline-flex flex-col gap-0.5 px-3 py-2 rounded-lg",
                      PRIORITY_CHIP_CLASSES[p]
                    )}
                  >
                    <span className="font-label-sm text-label-sm font-semibold uppercase">
                      {PRIORITY_LABELS[p]}
                    </span>
                    <span className="font-headline-sm text-headline-sm tabular-nums">
                      {metrics.porPrioridade[p]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categorias */}
            <div className="lg:col-span-7 rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-2">
                <Sparkles className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Top Categorias
                </span>
              </div>
              {metrics.porCategoria.length === 0 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Nenhuma categoria identificada.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {metrics.porCategoria.map((item) => {
                    const pct = Math.round((item.count / metrics.total) * 100);
                    return (
                      <div
                        key={item.categoria}
                        className="flex items-center gap-3"
                      >
                        <span className="font-body-md text-body-md text-on-surface font-medium w-40 truncate shrink-0">
                          {item.categoria}
                        </span>
                        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-code-sm text-code-sm text-on-surface-variant tabular-nums w-16 text-right shrink-0">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}