"use client";

import * as React from "react";
import {
  ChevronRight,
  Building2,
  Globe,
  Layers,
  MessageSquare,
  Send,
  ShieldCheck,
  RotateCcw,
  Check,
  Save,
} from "lucide-react";
import { Tom, Canal } from "@/lib/schemas/analysis";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TOM_OPTIONS: { id: Tom; label: string }[] = [
  { id: "formal", label: "Formal" },
  { id: "neutro", label: "Neutro" },
  { id: "empatico", label: "Empático" },
];

const CANAL_OPTIONS: { id: Canal; label: string }[] = [
  { id: "email", label: "E-mail" },
  { id: "chat", label: "Chat" },
  { id: "ticket", label: "Ticket" },
  { id: "reuniao", label: "Reunião" },
  { id: "outro", label: "Outro" },
];

const PLAN_OPTIONS = [
  "Enterprise Platinum (SLA 2h)",
  "Enterprise Gold (SLA 4h)",
  "Growth (SLA 8h)",
  "Standard (SLA 24h)",
];

const COMPLIANCE_CHIPS = ["LGPD Adequado", "SOC 2 Type II", "ISO 27001"];

const DEFAULTS = {
  nomeOrganizacao: "OpsPilot Ltda",
  dominio: "opspilot.app",
  plano: PLAN_OPTIONS[0],
  tom: "neutro" as Tom,
  canal: "email" as Canal,
  anonimizacao: true,
};

export default function ConfiguracoesPage() {
  const [form, setForm] = React.useState(DEFAULTS);

  const set = <K extends keyof typeof DEFAULTS>(key: K, value: (typeof DEFAULTS)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    toast.success("Configurações salvas.", {
      description: "As preferências de triagem foram atualizadas.",
    });
  };

  const handleReset = () => {
    setForm(DEFAULTS);
    toast.info("Configurações restauradas aos padrões.");
  };

  const inputClass =
    "w-full px-3 py-2 font-body-md text-body-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface transition-all";

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-space-md pb-space-lg">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mb-1">
            <span>OpsPilot</span>
            <ChevronRight className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-primary font-semibold">Configurações</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Configurações da Empresa
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Dados organizacionais e preferências padrão da triagem neural.
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Padrões
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary-container text-on-primary-fixed font-label-md text-label-md font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-md"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Salvar Configurações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Organização */}
        <div className="lg:col-span-6 rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Organização
            </h2>
          </div>

          <div className="flex flex-col gap-space-md">
            <div>
              <label
                htmlFor="org-nome"
                className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-1"
              >
                Nome da Organização
              </label>
              <input
                id="org-nome"
                type="text"
                value={form.nomeOrganizacao}
                onChange={(e) => set("nomeOrganizacao", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="org-dominio"
                className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-1 flex items-center gap-1"
              >
                <Globe className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                Domínio corporativo
              </label>
              <input
                id="org-dominio"
                type="text"
                value={form.dominio}
                onChange={(e) => set("dominio", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="org-plano"
                className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-1 flex items-center gap-1"
              >
                <Layers className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                Plano / Tier de Serviço
              </label>
              <select
                id="org-plano"
                value={form.plano}
                onChange={(e) => set("plano", e.target.value)}
                className={inputClass}
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preferências de Triagem */}
        <div className="lg:col-span-6 rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-tertiary/10 text-tertiary">
              <MessageSquare className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Preferências de Triagem
            </h2>
          </div>

          <div className="flex flex-col gap-space-md">
            <div>
              <span className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">
                Tom padrão da resposta
              </span>
              <div className="grid grid-cols-3 gap-space-xs">
                {TOM_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set("tom", t.id)}
                    className={cn(
                      "p-2.5 rounded-lg transition-all font-label-md text-label-md",
                      form.tom === t.id
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                <Send className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden="true" />
                Canal padrão de entrada
              </span>
              <div className="grid grid-cols-5 gap-space-xs">
                {CANAL_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => set("canal", c.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all font-label-md text-label-md",
                      form.canal === c.id
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle anonimização */}
            <div className="flex items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-semibold">
                    Anonimização de CPF/CNPJ e dados bancários
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Remove informações sensíveis antes do processamento neural.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.anonimizacao}
                onClick={() => set("anonimizacao", !form.anonimizacao)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors shrink-0 relative",
                  form.anonimizacao ? "bg-primary" : "bg-surface-container-high"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform",
                    form.anonimizacao ? "left-auto right-0.5" : "left-0.5"
                  )}
                />
              </button>
            </div>

            {/* Conformidade */}
            <div className="flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Certificações ativas
              </span>
              <div className="flex flex-wrap gap-2">
                {COMPLIANCE_CHIPS.map((chip) => (
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
    </div>
  );
}