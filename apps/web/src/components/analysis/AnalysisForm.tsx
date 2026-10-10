"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Zap,
  RotateCcw,
  Mail,
  MessageSquare,
  Ticket,
  Users,
  Route,
  CheckCircle2,
  FileText,
  Building2,
  ChevronDown,
  ShieldCheck,
  Gauge,
  Brain,
  Network,
  Activity,
  Check,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  createAnalysisSchema,
  CreateAnalysisInput,
  Tom,
  Canal,
} from "@/lib/schemas/analysis";
import { useCreateAnalysis } from "@/hooks/useAnalyses";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REAL_EXAMPLE = `Prezados,

Identificamos uma cobrança duplicada emitida referente à competência de Outubro na fatura corporativa da nossa conta (ID: ACCT-90422).

O valor contratado é de R$ 14.500,00, porém foi debitado o total de R$ 29.000,00 via DDA no banco Santander ontem pela manhã. O diretor financeiro solicitou o estorno imediato do excedente antes do fechamento contábil que ocorre impreterivelmente nesta sexta-feira às 17h, sob risco de retenção temporária das aprovações dos novos aditivos de licença enterprise.

Em anexo ao sistema já encaminhei os dois comprovantes de liquidação bancária. Aguardo a confirmação do cancelamento da duplicata e o comprovante do estorno bancário com máxima prioridade.

Cordialmente,
Roberto Mendonça
Gerente de Controladoria | Nexus Tecnologia S.A.`;

type ToneOption = Tom | "resolutivo";

const CHANNELS: { id: Canal; label: string; icon: React.ComponentType<any> }[] = [
  { id: "email", label: "E-mail", icon: Mail },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "ticket", label: "Ticket", icon: Ticket },
  { id: "reuniao", label: "Reunião", icon: Users },
  { id: "outro", label: "Outro", icon: Route },
];

const TONES: { id: ToneOption; title: string; desc: string }[] = [
  { id: "formal", title: "Formal", desc: "Protocolos e Jurídico" },
  { id: "neutro", title: "Neutro", desc: "Técnico e Direto" },
  { id: "empatico", title: "Empático", desc: "Acolhedor e Humano" },
  { id: "resolutivo", title: "Resolutivo", desc: "Ação Imediata & SLA" },
];

const PIPELINE_STEPS = [
  {
    step: "1",
    title: "Classificação de Categoria",
    desc: "Categorização taxonômica imediata (ex: Financeiro / Billing Crítico).",
  },
  {
    step: "2",
    title: "Avaliação de Riscos & SLA",
    desc: "Identificação de ameaças de churn, penalidades contratuais e prazo final.",
  },
  {
    step: "3",
    title: "Checklist de Resolução",
    desc: "Geração de passos acionáveis em ordem de prioridade para a equipe interna.",
  },
  {
    step: "4",
    title: "Minuta Pré-calibrada",
    desc: "Redação completa e customizada, pronta para envio no tom selecionado.",
  },
];

export function AnalysisForm() {
  const router = useRouter();
  const createMutation = useCreateAnalysis();
  const [showAdditionalContext, setShowAdditionalContext] =
    React.useState(false);
  const [selectedTone, setSelectedTone] = React.useState<ToneOption>(
    "resolutivo"
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateAnalysisInput>({
    resolver: zodResolver(createAnalysisSchema),
    defaultValues: {
      relato: REAL_EXAMPLE,
      tom: "empatico",
      canal: "email",
      urgenciaUsuario: 4,
      contextoAdicional: "Contrato Enterprise Tier 1 com faturamento anual de R$ 174.000,00.",
    },
    mode: "onChange",
  });

  const relatoValue = watch("relato") || "";
  const currentCanal = watch("canal");
  const charCount = relatoValue.length;
  const hasEnoughChars = charCount >= 20;

  const onSubmit = async (data: CreateAnalysisInput) => {
    try {
      const result = await createMutation.mutateAsync(data);
      toast.success("Diagnóstico concluído com sucesso!");
      router.push(`/analises/${result.id}`);
    } catch (err) {
      // error toast handled in mutation
    }
  };

  const handleClear = () => {
    reset({
      relato: "",
      tom: "neutro",
      canal: "ticket",
      urgenciaUsuario: 3,
      contextoAdicional: "",
    });
    setSelectedTone("neutro");
    toast.info("Formulário limpo.");
  };

  const handleRestoreExample = () => {
    setValue("relato", REAL_EXAMPLE, { shouldValidate: true });
    setValue("tom", "empatico", { shouldValidate: true });
    setValue("canal", "email", { shouldValidate: true });
    setValue("urgenciaUsuario", 4, { shouldValidate: true });
    setValue(
      "contextoAdicional",
      "Contrato Enterprise Tier 1 com faturamento anual de R$ 174.000,00.",
      { shouldValidate: true }
    );
    setSelectedTone("resolutivo");
    toast.success("Exemplo real restaurado.");
  };

  const handleToneSelect = (tone: ToneOption) => {
    setSelectedTone(tone);
    setValue("tom", tone === "resolutivo" ? "empatico" : tone, {
      shouldValidate: true,
    });
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (hasEnoughChars && !createMutation.isPending) {
          handleSubmit(onSubmit)();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasEnoughChars, createMutation.isPending, handleSubmit]);

  return (
    <div className="flex flex-col w-full">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mb-1">
            <span>OpsPilot</span>
            <ChevronRight className="h-[14px] w-[14px]" strokeWidth={1.5} />
            <span className="text-primary font-semibold">Nova Análise</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Nova Análise de Solicitação
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
            Cole uma mensagem, ticket ou e-mail corporativo para extrair
            diagnóstico, riscos e minutas automatizadas em segundos.
          </p>
        </div>
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
          <div className="px-space-md py-1.5 rounded-lg bg-surface-container flex items-center gap-2 text-on-surface-variant">
            <Zap className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-label-sm text-label-sm">
              Motor Neural <strong>v4.2 Active</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
        {/* ESQUERDA */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" />

            {/* Canal de Entrada */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface font-semibold mb-space-xs">
                Canal de Entrada
              </label>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                Determina o algoritmo de segmentação e prioridade temporal.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs">
                {CHANNELS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = currentCanal === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setValue("canal", item.id, { shouldValidate: true })}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg transition-all",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold shadow-sm"
                          : "bg-surface-container-low text-on-surface-variant hover:text-on-surface",
                        item.id === "outro" && "col-span-2 sm:col-span-1"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                      <span className="font-label-md text-label-md">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tom da Resposta Recomendada */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface font-semibold mb-space-xs">
                Tom da Resposta Recomendada
              </label>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                Calibra a linguagem da minuta gerada para os analistas operacionais.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
                {TONES.map((item) => {
                  const isSelected = selectedTone === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToneSelect(item.id)}
                      className={cn(
                        "text-left p-3 rounded-lg transition-all",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                      )}
                    >
                      {item.id === "resolutivo" && (
                        <div className="flex items-center justify-between">
                          <p className="font-label-md text-label-md font-semibold">
                            {item.title}
                          </p>
                          {isSelected && (
                            <CheckCircle2
                              className="h-4 w-4 text-primary"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      )}
                      {item.id === "resolutivo" ? null : (
                        <p className="font-label-md text-label-md font-semibold">
                          {item.title}
                        </p>
                      )}
                      <p className="font-label-sm text-label-sm opacity-70">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conteúdo da Solicitação */}
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <label
                  className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5"
                  htmlFor="request-content"
                >
                  <span>Conteúdo da Solicitação</span>
                  <span className="text-error font-body-sm" aria-hidden="true">
                    *
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestoreExample}
                    className="text-primary hover:text-on-primary-container font-label-sm text-label-sm transition-colors flex items-center gap-1"
                  >
                    <FileText className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                    Restaurar Exemplo Real
                  </button>
                  <span
                    className={cn(
                      "font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-high font-medium tabular-nums",
                      errors.relato
                        ? "bg-error-container text-on-error-container"
                        : "text-on-surface-variant"
                    )}
                  >
                    {charCount.toLocaleString("pt-BR")} / 5.000
                  </span>
                </div>
              </div>
              <div className="relative">
                <textarea
                  id="request-content"
                  rows={9}
                  maxLength={5000}
                  placeholder="Cole aqui a mensagem completa, e-mail corporativo ou transcrição do chamado para análise..."
                  className={cn(
                    "w-full rounded-xl bg-surface-container-low p-space-md text-on-surface placeholder:text-on-surface-variant/50 font-body-md text-body-md focus:outline-none focus:bg-surface transition-all resize-y",
                    errors.relato && "ring-1 ring-error"
                  )}
                  {...register("relato")}
                />
              </div>
              {errors.relato && (
                <p className="mt-1 font-body-sm text-body-sm text-error font-medium">
                  {errors.relato.message}
                </p>
              )}
            </div>

            {/* Contexto Adicional da Empresa */}
            <div className="rounded-xl bg-surface-container-low overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setShowAdditionalContext(!showAdditionalContext)}
                className="w-full p-space-md flex items-center justify-between text-left hover:bg-surface-container-high/40 transition-colors"
              >
                <div className="flex items-center gap-space-sm">
                  <Building2
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">
                      Contexto Adicional da Empresa (Opcional)
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Enriquece a análise combinando contratos, SLA ativo e classificação de contas.
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-on-surface-variant transition-transform duration-200",
                    showAdditionalContext && "rotate-180"
                  )}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
              {showAdditionalContext && (
                <div className="p-space-md pt-0 grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">
                      Nome do Cliente / Conta
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-surface text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-bright"
                      placeholder="Ex: Acme Corp"
                      type="text"
                      {...register("contextoAdicional")}
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">
                      Plano / Tier de Serviço
                    </label>
                    <select className="w-full px-3 py-2 rounded-lg bg-surface text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-bright">
                      <option>Enterprise Platinum (SLA 2h)</option>
                      <option>Enterprise Gold (SLA 4h)</option>
                      <option>Growth (SLA 8h)</option>
                      <option>Standard (SLA 24h)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">
                      Histórico Prévio Recente
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-surface text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-bright"
                      placeholder="Ex: Incidente de billing no mês passado"
                      type="text"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-2">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <ShieldCheck
                  className="h-[18px] w-[18px] text-tertiary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="font-body-sm text-body-sm">
                  Anonimização de CPF, CNPJ e dados bancários ativada.
                </span>
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending || !hasEnoughChars}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-space-lg py-3 rounded-lg bg-primary-container text-on-primary-fixed hover:bg-primary hover:text-on-primary transition-all font-label-md text-label-md font-semibold shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : (
                  <Sparkles
                    className="h-5 w-5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}
                {createMutation.isPending
                  ? "Processando IA..."
                  : "Analisar com OpsPilot"}
                {!createMutation.isPending && (
                  <kbd className="ml-1 px-1.5 py-0.5 rounded bg-on-primary-fixed/15 text-on-primary-fixed font-code-sm text-code-sm">
                    Ctrl + Enter
                  </kbd>
                )}
              </button>
            </div>
          </form>

          {/* Cards de métrica */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Gauge className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  ~ 3.2s
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tempo médio de síntese e extração de pendências
                </p>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  Zero Data Retention
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Logs voláteis descartados após a sessão do analista
                </p>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Brain className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  3 Modelos Cruzados
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tripla checagem semântica para prevenção de alucinação
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DIREITA */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          {/* Pipeline */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Pipeline Operacional de IA
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                Sequência
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Fluxo autônomo disparado instantaneamente ao submeter a mensagem.
            </p>
            <div className="flex flex-col gap-space-md relative mt-2">
              {PIPELINE_STEPS.map((item) => (
                <div key={item.step} className="flex gap-space-sm relative">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center font-code-sm text-code-sm font-bold shrink-0",
                      item.step === "1"
                        ? "bg-primary-container text-on-primary-fixed shadow-sm"
                        : "bg-surface-container text-on-surface-variant"
                    )}
                  >
                    {item.step}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="font-label-md text-label-md text-on-surface font-semibold">
                      {item.title}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prévia do Painel de Saída */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Prévia do Painel de Saída
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant">
                Aguardando
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Estrutura gerada na conclusão da triagem:
            </p>
            <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-low transition-all">
              <div className="flex items-center justify-between pb-2">
                <div className="h-4 w-28 bg-surface-container-highest rounded animate-pulse" />
                <div className="h-5 w-16 bg-error-container/60 rounded animate-pulse" />
              </div>
              <div className="h-3 w-5/6 bg-surface-container-highest rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-surface-container-highest rounded animate-pulse" />
              <div className="my-2 p-3 rounded-lg bg-surface-container flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-primary/40 rounded-full animate-pulse" />
                  <div className="h-3 w-32 bg-surface-container-highest rounded animate-pulse" />
                </div>
                <div className="h-2.5 w-full bg-surface-container-highest/60 rounded animate-pulse" />
                <div className="h-2.5 w-4/5 bg-surface-container-highest/60 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="h-7 w-24 bg-surface-container-highest rounded animate-pulse" />
                <div className="h-7 w-20 bg-surface-container-highest rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Conformidade & Governança */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
            <div className="flex items-center gap-2 text-on-surface">
              <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="font-headline-sm text-headline-sm">
                Conformidade & Governança
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Seus dados corporativos permanecem isolados em sandbox criptografada ponta a ponta (AES-256).
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["LGPD Adequado", "SOC 2 Type II", "ISO 27001"].map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-medium"
                >
                  <Check className="h-[14px] w-[14px] text-primary" strokeWidth={1.5} aria-hidden="true" />
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}