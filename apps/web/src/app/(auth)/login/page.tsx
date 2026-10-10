"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Terminal,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Network,
  Lock,
  Building2,
  AtSign,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/analises/nova";

  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Por favor, informe um e-mail corporativo válido.");
      return;
    }
    if (senha.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }
    if (mode === "register" && nome.trim().length < 2) {
      setError("Por favor, informe seu nome completo.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await authApi.login({ email, senha });
        toast.success("Autenticado com sucesso! Bem-vindo(a) ao OpsPilot.");
      } else {
        await authApi.register({ nome, email, senha });
        toast.success("Conta corporativa criada com sucesso!");
      }
      router.push(from);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("analista@opspilot.ai");
    setSenha("senha123");
    if (mode === "register") {
      setNome("Mariana Silva");
    }
    setError(null);
    toast.info("Credenciais de demonstração preenchidas.");
  };

  return (
    <div className="w-full min-h-screen lg:h-dvh flex flex-col items-center justify-center p-space-lg bg-surface lg:overflow-hidden">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden shadow-xl bg-surface-container-low lg:h-full lg:max-h-[942px]">
        {/* LADO ESQUERDO: Branding & Proposta de Valor */}
        <div className="lg:col-span-6 relative flex flex-col justify-between p-space-lg lg:p-space-xl overflow-hidden bg-gradient-to-br from-on-secondary-fixed via-on-primary-fixed to-inverse-surface text-inverse-on-surface">
          {/* Glow de fundo */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary/25 blur-3xl pointer-events-none" />

          {/* Topo */}
          <div className="relative z-10 flex items-center justify-between gap-space-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-fixed shadow-md">
                <Terminal className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md tracking-tight text-inverse-on-surface flex items-center gap-2">
                  OpsPilot
                  <span className="font-label-sm text-label-sm uppercase tracking-wider px-2 py-0.5 rounded bg-primary-container/25 text-primary-fixed">
                    AI OPS
                  </span>
                </span>
                <span className="font-label-sm text-label-sm text-secondary-fixed-dim">
                  Operational Cockpit v2.4
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-variant/10 text-inverse-on-surface font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              Cluster Brasil Leste 99.98%
            </div>
          </div>

          {/* Centro */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="font-headline-xl text-headline-xl text-inverse-on-surface mb-6 max-w-lg leading-tight">
              Decisões operacionais críticas com precisão de IA em segundos.
            </h1>
            <div className="space-y-4 max-w-xl">
              <div className="flex items-start space-x-3.5 p-3 rounded-lg bg-surface-variant/10 hover:bg-surface-variant/20 transition-colors">
                <div className="mt-0.5 p-1.5 rounded-lg bg-primary-container/20 text-primary-fixed flex items-center justify-center">
                  <TrendingUp className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className="font-body-md text-body-md text-inverse-on-surface font-medium leading-relaxed">
                  Triagem inteligente de chamados corporativos e detecção de churn em tempo real.
                </p>
              </div>
              <div className="flex items-start space-x-3.5 p-3 rounded-lg bg-surface-variant/10 hover:bg-surface-variant/20 transition-colors">
                <div className="mt-0.5 p-1.5 rounded-lg bg-primary-container/20 text-primary-fixed flex items-center justify-center">
                  <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className="font-body-md text-body-md text-inverse-on-surface font-medium leading-relaxed">
                  Respostas jurídicas e financeiras pré-validadas com conformidade estrita.
                </p>
              </div>
              <div className="flex items-start space-x-3.5 p-3 rounded-lg bg-surface-variant/10 hover:bg-surface-variant/20 transition-colors">
                <div className="mt-0.5 p-1.5 rounded-lg bg-primary-container/20 text-primary-fixed flex items-center justify-center">
                  <Network className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className="font-body-md text-body-md text-inverse-on-surface font-medium leading-relaxed">
                  Integração transparente com Zendesk, Salesforce e caixas de correio empresariais.
                </p>
              </div>
            </div>
          </div>

          {/* Base */}
          <div className="relative z-10 pt-6 mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-inverse-on-surface font-label-md text-label-md">
              <Lock className="h-5 w-5 text-primary-fixed" strokeWidth={1.5} aria-hidden="true" />
              <span>Conformidade LGPD &amp; SOC2 Type II</span>
            </div>
            <div className="flex items-center space-x-3 text-secondary-fixed-dim font-label-sm text-label-sm">
              <span>Latência p99 &lt; 140ms</span>
              <span>•</span>
              <span>Criptografia mTLS E2E</span>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Portal de Autenticação */}
        <div className="lg:col-span-6 flex items-center justify-center p-space-md lg:p-space-xl bg-surface-container-low lg:overflow-y-auto">
          <div className="w-full max-w-md bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-xl shadow-md flex flex-col my-auto">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 bg-surface-container rounded-lg mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={
                  mode === "login"
                    ? "py-2 text-center rounded-lg font-label-md text-label-md transition-all shadow-sm bg-surface-container-lowest text-on-surface font-semibold"
                    : "py-2 text-center rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-all"
                }
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={
                  mode === "register"
                    ? "py-2 text-center rounded-lg font-label-md text-label-md transition-all shadow-sm bg-surface-container-lowest text-on-surface font-semibold"
                    : "py-2 text-center rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-all"
                }
              >
                Criar conta corporativa
              </button>
            </div>

            {/* Cabeçalho Dinâmico */}
            <div className="mb-6">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {mode === "login" ? "Acesse o console" : "Criar conta corporativa"}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {mode === "login"
                  ? "Entre com suas credenciais de equipe para gerenciar filas de triagem."
                  : "Comece o piloto de triagem de chamados em sua empresa."}
              </p>
            </div>

            {/* SSO */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Entrar com Google Workspace</span>
              </button>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
              >
                <ShieldCheck className="h-[18px] w-[18px] text-secondary" strokeWidth={1.5} aria-hidden="true" />
                <span>Entrar com SSO / SAML 2.0</span>
              </button>
            </div>

            {/* Divisor */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full h-px bg-surface-container-highest" />
              <span className="absolute bg-surface-container-lowest px-3 font-label-sm text-label-sm text-on-surface-variant">
                ou continue com seu e-mail corporativo
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-center gap-2.5 p-3 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md"
              >
                <AlertCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="flex flex-col space-y-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="nome">
                    Nome completo
                  </label>
                  <div className="relative">
                    <input
                      id="nome"
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Mariana Silva"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary-container transition-all"
                    />
                    <Building2
                      className="absolute right-3 top-2.5 h-5 w-5 text-outline"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="work_email">
                  E-mail corporativo
                </label>
                <div className="relative">
                  <input
                    id="work_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.nome@empresa.com"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary-container transition-all"
                  />
                  <AtSign
                    className="absolute right-3 top-2.5 h-5 w-5 text-outline"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="work_password">
                    Senha de acesso
                  </label>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="font-label-sm text-label-sm text-primary hover:text-on-primary-container transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="work_password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary-container transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-outline hover:text-on-surface"
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Mínimo de 10 caracteres, incluindo caractere especial e dígito corporativo.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-lg bg-primary-container hover:bg-primary-fixed text-on-primary-fixed font-headline-sm text-headline-sm font-semibold tracking-wide flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>{mode === "login" ? "Acessar OpsPilot" : "Criar Organização e Acessar"}</span>
                    <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {/* Termos */}
            <div className="mt-6 pt-4 text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Ao continuar, você concorda com os{" "}
                <span className="text-on-surface underline hover:text-primary cursor-pointer">
                  Termos de Serviço
                </span>{" "}
                e à{" "}
                <span className="text-on-surface underline hover:text-primary cursor-pointer">
                  Política de Privacidade
                </span>{" "}
                corporativa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-surface animate-pulse text-on-surface-variant">
          Carregando portal corporativo...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}