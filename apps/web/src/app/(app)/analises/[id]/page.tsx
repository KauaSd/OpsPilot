"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Gavel,
  ArrowLeft,
  ArrowRight,
  Share2,
  AlertTriangle,
  CircleDollarSign,
  Calendar,
  Shield,
  Receipt,
  CreditCard,
  ClipboardCheck,
  User,
  Timer,
  CheckCircle2,
  ScanSearch,
  HelpCircle,
  Package,
  Eye,
  Sparkles,
  Copy,
  Edit3,
  Check,
  ShieldCheck,
  Send,
  RefreshCw,
  Loader2,
  Mail,
} from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalyses";
import { ConfidenceMeter } from "@/components/analysis/ConfidenceMeter";
import { CategoryBadge } from "@/components/analysis/CategoryBadge";
import { SentimentBadge } from "@/components/analysis/SentimentBadge";
import { PriorityBadge } from "@/components/analysis/PriorityBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOCK_MINUTA = `Olá, Marcos (Equipe TechCorp Brasil),

Compreendo perfeitamente sua preocupação e peço sinceras desculpas pelo transtorno causado por esta duplicidade. Já localizamos a transação em duplicidade referente à NF 49201 no valor de R$ 4.250,00.

Nosso time financeiro já efetuou o cancelamento da cobrança excedente e o estorno imediato para a conta corrente de origem. Em anexo a esta mensagem, você encontra o comprovante oficial de liquidação bancária com o número de autenticação.

Como medida preventiva, revisamos suas diretrizes de cobrança automática para assegurar que nenhum outro débito indevido ocorra em suas faturas futuras. Caso necessite de qualquer esclarecimento adicional, estou pessoalmente à disposição para realizarmos uma conferência rápida.

Atenciosamente,
Mariana Silva — Líder de Operações
OpsPilot Support Desk`;

const INITIAL_CHECKLIST = [
  {
    id: 1,
    text: "Localizar comprovante de estorno da transação duplicada (NF 49201)",
    responsavel: "Suporte N2 / Faturamento",
    prazo: "30 minutos",
    statusTag: "Realizado às 14:12",
    concluido: true,
    chipClassName: "bg-surface-container-highest text-on-surface-variant",
    chipIcon: true,
  },
  {
    id: 2,
    text: "Aplicar crédito de cortesia ou isenção de taxa de processamento de R$ 150",
    responsavel: "Mariana Silva (CSM)",
    prazo: "2 horas",
    statusTag: "Recomendado para retenção",
    concluido: false,
    chipClassName: "bg-tertiary-fixed text-on-tertiary-container",
    chipIcon: false,
  },
  {
    id: 3,
    text: "Enviar e-mail conciliatório com o comprovante bancário em anexo",
    responsavel: "Suporte Operações",
    prazo: "1 hora",
    statusTag: "Aguardando validação da minuta",
    concluido: false,
    chipClassName: "text-primary font-semibold",
    chipIcon: false,
  },
];

export default function AnaliseResultadoPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "OPS-8492";

  const { data: analysis, isLoading } = useAnalysis(id);

  const [checklist, setChecklist] = React.useState(INITIAL_CHECKLIST);
  const [copied, setCopied] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const minutaRef = React.useRef<HTMLTextAreaElement>(null);

  const minutaText =
    analysis?.respostaSugerida && analysis.respostaSugerida.trim()
      ? analysis.respostaSugerida
      : MOCK_MINUTA;

  const categoria =
    analysis?.categoria || "Cobrança Duplicada Plano Enterprise";

  const toggleChecklist = (itemId: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, concluido: !item.concluido } : item
      )
    );
  };

  const completedCount = checklist.filter((c) => c.concluido).length;

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
      toast.success("Resposta aprovada e despachada para o cliente com sucesso!", {
        description: "Protocolo de auditoria registrado sob conformidade SOC2.",
      });
    }, 1200);
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

  const showBanner = !analysis || analysis.requerRevisaoHumana;

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
                Esta solicitação envolve menção direta a departamento jurídico e
                ameaça de cancelamento contratual. A resposta automática foi
                pausada pelo protocolo de segurança; valide o diagnóstico e
                revise a minuta abaixo antes do disparo definitivo.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 self-center shrink-0">
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Histórico do contrato: TechCorp Brasil (Tier Enterprise, LTV R$ 51.000, 18 meses)."
                  )
                }
                className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container transition-colors"
              >
                Ver Histórico do Contrato
              </button>
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
                ID: {analysis?.id || id}
              </span>
              <span>•</span>
              <span>Processado em 1.4s</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                E-mail Corporativo
              </span>
              <span>•</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold normal-case tracking-tight">
                TechCorp Brasil
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Diagnóstico #{analysis?.id || id} — {categoria}
            </h1>
          </div>

          {/* Incident Navigation Controls */}
          <div className="flex items-center gap-space-xs self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => router.push("/analises/nova")}
              title="Caso Anterior"
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => router.push("/analises/nova")}
              title="Próximo Caso"
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
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
          <PriorityBadge
            priority={analysis?.prioridade || "critica"}
            sla="SLA < 2h"
          />
          <SentimentBadge
            sentiment={analysis?.sentimento || "negativo"}
            detail="Negativo / Frustrado (Risco de Evasão)"
          />
          <ConfidenceMeter
            confidence={analysis?.confianca ?? 96.8}
            modelVersion="Modelo FinOps v3.2"
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
                <AlertTriangle className="h-[18px] w-[18px] text-error" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Riscos Operacionais e Contratuais
                </h2>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                2 alertas graves detectados
              </span>
            </div>

            {/* Risk Card 1: Churn & Legal */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error" />
              <div className="pl-2">
                <div className="flex flex-wrap items-start justify-between gap-space-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      Risco de Churn e Litígio Imediato
                    </span>
                    <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm uppercase font-semibold">
                      Nível 5
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-error font-semibold shrink-0">
                    Impacto: R$ 51.000/ano
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
                  O cliente comunicou formalmente que acionará a assessoria
                  jurídica caso a comprovação do estorno integral não seja
                  enviada dentro do limite de 24 horas úteis.
                </p>
                <div className="flex flex-wrap gap-x-space-md gap-y-1 items-center pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
                  <span className="inline-flex items-center gap-1">
                    <CircleDollarSign className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                    LTV Total: <strong className="text-on-surface font-semibold">R$ 51.000,00</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                    Tempo de Casa: <strong className="text-on-surface font-semibold">18 meses</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                    Contrato Enterprise com Cláusula Arbitral
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Card 2: Cash Flow Impact */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary-container" />
              <div className="pl-2">
                <div className="flex flex-wrap items-start justify-between gap-space-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      Bloqueio de Fluxo de Caixa do Cliente
                    </span>
                    <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-container font-label-sm text-label-sm uppercase font-semibold">
                      Impacto Alto
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface-variant font-semibold shrink-0">
                    Débito: R$ 4.250,00
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
                  O débito duplicado de R$ 4.250,00 ocorreu na conta primária
                  operacional da contratante, afetando os desembolsos de folha
                  de pagamento agendados para a data de hoje.
                </p>
                <div className="flex flex-wrap gap-x-space-md gap-y-1 items-center text-on-surface-variant font-label-sm text-label-sm">
                  <span className="inline-flex items-center gap-1">
                    <Receipt className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                    NF Vinculada: <strong className="text-on-surface font-code-sm font-semibold">#49201</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CreditCard className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                    Gateway: <strong className="text-on-surface font-semibold">Itaú Cobrança API</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Action Checklist */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Checklist de Ações Recomendadas
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm tabular-nums">
                {completedCount} de {checklist.length} concluídas
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none",
                    item.concluido && "opacity-75"
                  )}
                  onClick={() => toggleChecklist(item.id)}
                >
                  <input
                    type="checkbox"
                    checked={item.concluido}
                    onChange={() => toggleChecklist(item.id)}
                    className="mt-1 h-4 w-4 rounded accent-primary text-on-primary cursor-pointer shrink-0"
                    aria-label={item.text}
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      className={cn(
                        "font-body-md text-body-md text-on-surface font-medium cursor-pointer block",
                        item.concluido && "line-through text-on-surface-variant"
                      )}
                    >
                      {item.text}
                    </label>
                    <div className="flex flex-wrap items-center gap-space-sm mt-1">
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                        <User className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                        {item.responsavel}
                      </span>
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                        <Timer className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                        Prazo: {item.prazo}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-label-sm text-label-sm px-1.5 py-0.5 rounded",
                          item.chipClassName
                        )}
                      >
                        {item.chipIcon && (
                          <CheckCircle2 className="h-3 w-3 text-primary" strokeWidth={1.5} aria-hidden="true" />
                        )}
                        {item.statusTag}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Missing Information */}
          <div className="rounded-xl bg-surface-container p-space-md shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ScanSearch className="h-[18px] w-[18px] text-tertiary" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Informações Faltantes para Fechamento Completo
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
              A IA identificou lacunas nos anexos enviados pelo cliente. É
              recomendado solicitar cordialmente estas confirmações:
            </p>
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface">
              <li className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-tertiary shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                <span>
                  ID da segunda transação bancária ainda não anexado pelo
                  cliente (apenas o número da NF 49201 foi referenciado no corpo
                  da mensagem original).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-tertiary shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                <span>
                  Confirmação se o débito indevido ocorreu via transferência Pix
                  instantânea ou conciliação em Débito Automático Itaú PJ.
                </span>
              </li>
            </ul>
          </div>

          {/* Financial Transaction Inspector Mini-Widget */}
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0">
                <Package className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="font-label-md text-label-md font-semibold text-on-surface truncate">
                  Anexo Detectado: Comprovante_Estorno_49201.pdf
                </div>
                <div className="font-code-sm text-code-sm text-on-surface-variant truncate">
                  SHA256: 4e8b9...f21a • Gerado pelo Sistema Bancário às 14:10
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                toast.info("Visualização do comprovante bancário aberto em aba segura.")
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors shrink-0"
            >
              <Eye className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
              Visualizar PDF
            </button>
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
                  <Sparkles className="h-[18px] w-[18px] text-tertiary" strokeWidth={1.5} aria-hidden="true" />
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-tertiary-fixed-variant">
                    OpsPilot Suggestion
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Resposta Sugerida
                </h2>
                <p className="font-code-sm text-code-sm text-on-surface-variant">
                  Tom: Empático &amp; Resolutivo • Calibração Jurídica
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-semibold shrink-0">
                {sent ? "Enviado" : "Pronto para Envio"}
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
                    <Check className="h-[14px] w-[14px] text-primary" strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Copy className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                  )}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Modo de edição rápida aberto.")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors shadow-sm"
                >
                  <Edit3 className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
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
              />
            </div>

            {/* Key Policy Highlights Guardrails */}
            <div className="flex flex-col gap-1.5 p-space-sm rounded-lg bg-surface-container-lowest/60 mb-space-md text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-on-surface">
                <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
                Políticas de Conformidade Respeitadas:
              </div>
              <div className="grid grid-cols-2 gap-2 text-code-sm font-code-sm">
                <span className="flex items-center gap-1">✓ Sem admissão de dolo</span>
                <span className="flex items-center gap-1">✓ Anexo de estorno referenciado</span>
                <span className="flex items-center gap-1">✓ Canal direto assegurado</span>
                <span className="flex items-center gap-1">✓ Compromisso preventivo</span>
              </div>
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
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                ) : sent ? (
                  <Check className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Send className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                )}
                {sending ? "Enviando Comunicação..." : sent ? "Enviado com Sucesso!" : "Aprovar e Enviar Resposta"}
              </button>
              <div className="flex items-center justify-between pt-1 px-1">
                <button
                  type="button"
                  onClick={() => toast.info("Regerando minuta com calibração formal...")}
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary hover:underline"
                >
                  <RefreshCw className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                  Regerar resposta com outro tom
                </button>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  Atalho: ⌘ + Enter
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context Box: Client History */}
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Contexto Rápido do Contrato
              </span>
              <span className="font-code-sm text-code-sm text-primary">
                Status: Ativo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-surface-container-low">
                <span className="font-code-sm text-code-sm text-on-surface-variant block">
                  Tier
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Enterprise
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <span className="font-code-sm text-code-sm text-on-surface-variant block">
                  NPS Histórico
                </span>
                <span className="font-label-md text-label-md font-semibold text-primary tabular-nums">
                  9.4 / 10
                </span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low">
                <span className="font-code-sm text-code-sm text-on-surface-variant block">
                  Tickets Abertos
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface tabular-nums">
                  1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}