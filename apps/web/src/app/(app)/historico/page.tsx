"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { useAnalyses } from "@/hooks/useAnalyses";
import { PriorityBadge } from "@/components/analysis/PriorityBadge";
import { CategoryBadge } from "@/components/analysis/CategoryBadge";
import { SentimentBadge } from "@/components/analysis/SentimentBadge";
import { ConfidenceMeter } from "@/components/analysis/ConfidenceMeter";
import { Prioridade } from "@/lib/schemas/analysis";
import { cn } from "@/lib/utils";

function HistoricoContent() {
  const [search, setSearch] = React.useState("");
  const [selectedPrioridade, setSelectedPrioridade] = React.useState<string>("todas");
  const [page, setPage] = React.useState(1);

  const { data, isLoading, refetch, isFetching } = useAnalyses({
    page,
    limit: 10,
    q: search.trim() || undefined,
    prioridade: selectedPrioridade !== "todas" ? (selectedPrioridade as Prioridade) : undefined,
  });

  const analyses = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-space-md pb-space-lg">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mb-1">
            <span>OpsPilot</span>
            <ChevronRight className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-primary font-semibold">Histórico</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Histórico de Diagnósticos
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Auditoria, triagens concluídas e acompanhamento de planos de ação
            operacionais.
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} strokeWidth={1.5} />
            <span>Atualizar</span>
          </button>
          <Link
            href="/analises/nova"
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary-container text-on-primary-fixed font-label-md text-label-md font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-md"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            <span>Nova Análise</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-md mb-space-lg">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md">
          {/* Search input (8 cols) */}
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              placeholder="Buscar por ID, categoria ou conteúdo do relato..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 font-body-md text-body-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface transition-all"
            />
            <Search className="h-4 w-4 text-on-surface-variant absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.5} />
          </div>

          {/* Prioridade Select (4 cols) */}
          <div className="sm:col-span-4">
            <select
              value={selectedPrioridade}
              onChange={(e) => {
                setSelectedPrioridade(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 font-body-md text-body-md rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface transition-all"
            >
              <option value="todas">Todas as Prioridades</option>
              <option value="critica">Crítica (SLA &lt; 2h)</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analyses Table / List */}
      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-body-sm text-body-sm">Carregando histórico de diagnósticos...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-on-surface-variant/60" strokeWidth={1.5} />
            <p className="font-body-md text-body-md font-semibold text-on-surface">
              Nenhuma análise encontrada
            </p>
            <p className="font-body-sm text-body-sm max-w-sm mx-auto">
              Tente alterar os termos de busca ou filtros aplicados, ou crie um
              novo diagnóstico.
            </p>
            <Link
              href="/analises/nova"
              className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary-container text-on-primary-fixed font-label-md text-label-md font-semibold hover:bg-primary hover:text-on-primary transition-all"
            >
              Criar Nova Análise
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {analyses.map((item) => (
              <div
                key={item.id}
                className="p-space-lg hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-md"
              >
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-space-sm">
                    <span className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded tabular-nums">
                      #{item.id}
                    </span>
                    <CategoryBadge category={item.categoria} />
                    <PriorityBadge priority={item.prioridade} />
                    <SentimentBadge sentiment={item.sentimento} />
                  </div>

                  <p className="font-body-md text-body-md text-on-surface font-semibold line-clamp-1">
                    {item.diagnostico}
                  </p>

                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                    {item.relato}
                  </p>

                  <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-code-sm text-code-sm pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                      {new Date(item.dataCriacao).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span className="uppercase">Canal: {item.canal}</span>
                    <span>•</span>
                    <span className="uppercase">Tom: {item.tom}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                  <ConfidenceMeter
                    confidence={item.confianca}
                    modelVersion=""
                    className="py-1 px-2.5"
                  />

                  <Link
                    href={`/analises/${item.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors group shrink-0"
                  >
                    <span>Ver Diagnóstico</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-space-md border-t border-outline-variant/40 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
            <div>
              Mostrando página <strong className="text-on-surface">{page}</strong> de{" "}
              <strong className="text-on-surface">{totalPages}</strong> (Total: {total})
            </div>

            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoricoPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-on-surface-variant font-body-sm text-body-sm">
          Carregando histórico...
        </div>
      }
    >
      <HistoricoContent />
    </Suspense>
  );
}