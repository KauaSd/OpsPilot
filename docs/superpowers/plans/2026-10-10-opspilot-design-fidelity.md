# OpsPilot Design Fidelity & Functionality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduzir fielmente (`code.html`) e manter funcional o app Next.js em `apps/web` — shell, login, nova análise, resultado, histórico, relatórios e configurações.

**Architecture:** O design de origem é HTML estático com Tailwind CDN e tokens Material Design 3. Portamos cada `code.html` para componentes React/Next, ligados ao backend mock já existente (`src/lib/api`, `src/hooks`, `src/app/api/*`). Os tokens Material viram CSS custom properties em `:root`/`.dark`, expostos ao Tailwind v4 via `@theme inline`, de modo que o tema claro fica idêntico ao mockup e o escuro funciona.

**Tech Stack:** Next 16.4, React 19.3, TypeScript strict, Tailwind CSS v4 (`@tailwindcss/postcss`, sem `@config`), next/font (Inter), lucide-react, next-themes, @tanstack/react-query, react-hook-form + zod, sonner, vitest (jsdom).

**Spec:** `design/DESIGN.md`, `design/stitch_opspilot_ai_dashboard/opspilot_precision_operational_intelligence/DESIGN.md`, `design/stitch_opspilot_ai_dashboard/login_cadastro/code.html`, `design/stitch_opspilot_ai_dashboard/nova_an_lise/code.html`, `design/stitch_opspilot_ai_dashboard/resultado_da_an_lise/code.html`.

## Global Constraints

- **Workspace raiz do app:** `apps/web`. Alias TS: `@/*` → `./src/*`. Não é repo git — **não** há etapas de commit; cada task termina com verificação (`typecheck`/`test`/`build`).
- **Fonte única de verdade de cor:** os tokens Material do mockup. Valores **exatos** (light) em Task 1. Nenhum hex hardcoded nos componentes — só classes de token.
- **Tipografia:** Inter em toda a UI (via `next/font/google`), no lugar de Nunito/Lato.
- **Ícones:** `lucide-react` (o `DESIGN.md` exige Lucide 1.5px). **Remover** o `<link>` de Material Symbols do `layout.tsx`. Nunca usar `material-symbols-outlined`.
- **Tailwind v4:** proibido depender de `tailwind.config.ts`. Ele deve ser **deletado**; tudo em `src/styles/globals.css`.
- **Raios:** usar defaults do Tailwind — `rounded-xl`=12px (containers/cards/painéis), `rounded-lg`=8px (botões/inputs), `rounded-md`/`rounded`=6px/4px (badges/chips).
- **Sombras:** manter as classes do mockup (`shadow-sm`, `shadow-md`, `shadow-xl`, e `shadow-[0_1px_8px_rgba(0,0,0,0.04)]`), que batem com os defaults.
- **Cores semânticas proibidas:** texto branco sobre `teal-500`/`primary-container` (reprovado WCAG). Botão primário = fundo `primary-container`, texto `on-primary-fixed`.
- **Texto tabular:** IDs, contadores, percentuais e prazos usam `tabular-nums`.
- **Backend mock:** ativo via `NEXT_PUBLIC_USE_MOCKS=true` (`.env.local`). Endpoints: `POST /api/auth/{login,register,logout}`, `GET /api/auth/me`, `GET|POST /api/proxy/analises`, `GET /api/proxy/analises/:id`.
- **Tipos de domínio (não alterar):** `src/lib/schemas/analysis.ts` (`Tom=formal|neutro|empatico`, `Canal=email|chat|ticket|reuniao|outro`, `Prioridade=critica|alta|media|baixa`, `Sentimento=positivo|neutro|negativo|urgente`, `AnalysisResult`, `ActionItem`, `createAnalysisSchema` com `relato` ≥ 20 chars) e `src/lib/schemas/auth.ts`.
- **Testes:** `npm test` (vitest run, jsdom). Padrão existente usa `react-dom/server` `renderToString`. Não introduzir dependências novas de teste sem necessidade.

### Mapa de ícones Material Symbols → Lucide (usar em todas as páginas)

| Mockup | Lucide | Mockup | Lucide |
|---|---|---|---|
| terminal | `Terminal` | fact_check | `ClipboardCheck` |
| query_stats | `TrendingUp` | person | `User` |
| verified_user / security / shield-check | `ShieldCheck` | timer | `Timer` |
| hub | `Network` | help | `HelpCircle` |
| lock_clock / lock | `Lock` | inventory_2 | `Package` |
| alternate_email | `AtSign` | monetization_on | `CircleDollarSign` |
| visibility / visibility_off | `Eye` / `EyeOff` | calendar_today | `Calendar` |
| apartment / corporate_fare | `Building2` | shield | `Shield` |
| check_circle | `CheckCircle2` | receipt_long | `Receipt` |
| arrow_forward | `ArrowRight` | credit_card | `CreditCard` |
| auto_awesome / sparkle | `Sparkles` | search_insights | `SearchCheck` |
| schedule | `Clock` | warning | `AlertTriangle` |
| bar_chart | `BarChart3` | gavel | `Gavel` |
| tune | `SlidersHorizontal` | local_fire_department | `Flame` |
| logout | `LogOut` | sentiment_very_dissatisfied | `Frown` |
| add | `Plus` | account_balance_wallet | `Wallet` |
| search | `Search` | content_copy | `Copy` |
| mail | `Mail` | edit | `Edit3` |
| chat_bubble | `MessageSquare` | send | `Send` |
| confirmation_number | `Ticket` | refresh / sync | `RefreshCw` |
| groups | `Users` | check | `Check` |
| alt_route | `Route` | expand_more | `ChevronDown` |
| restart_alt | `RotateCcw` | progress_activity | `Loader2` (animate-spin) |
| bolt | `Zap` | psychology | `Brain` |
| history_edu | `FileText` | account_tree / view_timeline | `Network` / `Activity` |
| speed | `Gauge` | privacy_tip | `ShieldCheck` |

Tamanho de ícone: usar `className="h-[18px] w-[18px]"` (ou 16/20/24 conforme `text-[Npx]` do mockup) e `strokeWidth={1.5}`.

## Review Focus

1. **Dark mode:** todo token usado deve ter valor em `.dark`; nenhum componente pode manter hex light fixo, senão surge texto ilegível/fundo branco ao alternar.
2. **Viewport estreito:** sidebar desktop é fixa `w-64`; em `<768px` a navegação precisa continuar acessível (drawer) e o conteúdo não pode estourar (mockups são desktop).
3. **Estados vazio/carregando/erro** de `useAnalyses`/`useAnalysis` (busca sem resultado, filtros): devem renderizar nos estados do mockup, não em branco.
4. **Textos longos:** `relato` limitado a 5000 (contador `N / 5.000`), `textarea` `resize-y`, e `line-clamp` onde o mockup prevê.
5. **Acessibilidade/teclado:** `Ctrl/⌘+Enter` submete a nova análise; `⌘K` foca a busca; foco visível via `--ring`; `aria-current`/`aria-label` na navegação.

---

### Task 1: Toolchain, tokens de tema e tipografia

**Files:**
- Modify: `apps/web/src/styles/globals.css` (reescrever)
- Modify: `apps/web/src/app/layout.tsx`
- Delete: `apps/web/tailwind.config.ts`

**Interfaces:**
- Produces: classes utilitárias de token Material (`bg-surface`, `text-on-surface`, `bg-primary-container`, `text-on-primary-fixed`, `border-outline-variant`, `bg-surface-container-lowest`, `bg-tertiary-fixed`, `bg-error-container`, …), estilos de texto (`text-headline-xl|lg|md|sm`, `text-body-lg|md|sm`, `text-label-md|sm`, `text-code-sm`), espaçamentos (`p-space-md`, `px-space-lg`, `gap-gutter`, `p-margin`), fonte `font-sans` = Inter.
- Consumes: nada.

- [ ] **Step 1: Completar dependências**

Run: `npm install` (em `apps/web`)
Expected: `node_modules/next/dist/bin/next` passa a existir; `npm run build` deixa de falhar com `Cannot find module`.

- [ ] **Step 2: Reescrever `src/styles/globals.css`**

Estrutura exata:
```css
@import "tailwindcss";

:root {
  --surface: #fff8f5; --surface-bright: #fff8f5; --surface-dim: #dfd9d6;
  --surface-container-lowest: #ffffff; --surface-container-low: #f9f2ef;
  --surface-container: #f3ece9; --surface-container-high: #eee7e4;
  --surface-container-highest: #e8e1de; --surface-variant: #e8e1de;
  --on-surface: #1e1b1a; --on-surface-variant: #3c494a; --on-background: #1e1b1a;
  --outline: #6c7a7a; --outline-variant: #bbc9c9;
  --inverse-surface: #33302e; --inverse-on-surface: #f6efec; --inverse-primary: #47dadf;
  --primary: #00696c; --on-primary: #ffffff; --primary-container: #06bcc1;
  --on-primary-container: #004648; --primary-fixed: #6bf6fb; --primary-fixed-dim: #47dadf;
  --on-primary-fixed: #002021; --on-primary-fixed-variant: #004f52;
  --secondary: #4d6076; --on-secondary: #ffffff; --secondary-container: #d0e4ff;
  --on-secondary-container: #53667d; --secondary-fixed: #d0e4ff;
  --secondary-fixed-dim: #b5c8e2; --on-secondary-fixed: #071d30;
  --on-secondary-fixed-variant: #35485e;
  --tertiary: #735a3e; --on-tertiary: #ffffff; --tertiary-container: #c4a483;
  --on-tertiary-container: #503a21; --tertiary-fixed: #ffddba;
  --tertiary-fixed-dim: #e2c19e; --on-tertiary-fixed: #291803;
  --on-tertiary-fixed-variant: #5a4228;
  --error: #ba1a1a; --on-error: #ffffff; --error-container: #ffdad6;
  --on-error-container: #93000a; --background: #fff8f5;
}
.dark {
  --surface: #0c1a2a; --surface-bright: #12263a; --surface-dim: #0c1a2a;
  --surface-container-lowest: #12263a; --surface-container-low: #0c1a2a;
  --surface-container: #16283a; --surface-container-high: #1e3044;
  --surface-container-highest: #2a3c4e; --surface-variant: #2a3c4e;
  --on-surface: #f4edea; --on-surface-variant: #9ba4ac; --on-background: #f4edea;
  --outline: #6c7885; --outline-variant: #2a3c4e;
  --inverse-surface: #0c1a2a; --inverse-on-surface: #f4edea; --inverse-primary: #06bcc1;
  --primary: #42ccd0; --on-primary: #0c1a2a; --primary-container: #42ccd0;
  --on-primary-container: #002021; --primary-fixed: #6bf6fb; --primary-fixed-dim: #42ccd0;
  --on-primary-fixed: #002021; --on-primary-fixed-variant: #d2f3f4;
  --secondary: #b5c8e2; --on-secondary: #0c1a2a; --secondary-container: #35485e;
  --on-secondary-container: #d0e4ff; --secondary-fixed: #d0e4ff;
  --secondary-fixed-dim: #b5c8e2; --on-secondary-fixed: #071d30;
  --on-secondary-fixed-variant: #d0e4ff;
  --tertiary: #e2c19e; --on-tertiary: #0c1a2a; --tertiary-container: #735a3e;
  --on-tertiary-container: #ffddba; --tertiary-fixed: #3a2e1f;
  --tertiary-fixed-dim: #e2c19e; --on-tertiary-fixed: #ffddba;
  --on-tertiary-fixed-variant: #e2c19e;
  --error: #f87171; --on-error: #0c1a2a; --error-container: #4a1d1d;
  --on-error-container: #ffdad6; --background: #0c1a2a;
  --ring: #42ccd0;
}

@theme inline {
  --color-surface: var(--surface); /* … idem para TODOS os tokens acima … */
  --color-background: var(--background);
  --color-ring: var(--ring);
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --text-headline-xl: 32px; --text-headline-xl--line-height: 40px; --text-headline-xl--letter-spacing: -0.025em; --text-headline-xl--font-weight: 600;
  --text-headline-lg: 24px; --text-headline-lg--line-height: 32px; --text-headline-lg--letter-spacing: -0.02em; --text-headline-lg--font-weight: 600;
  --text-headline-md: 20px; --text-headline-md--line-height: 28px; --text-headline-md--letter-spacing: -0.015em; --text-headline-md--font-weight: 600;
  --text-headline-sm: 16px; --text-headline-sm--line-height: 24px; --text-headline-sm--letter-spacing: -0.01em; --text-headline-sm--font-weight: 600;
  --text-body-lg: 16px; --text-body-lg--line-height: 24px; --text-body-lg--letter-spacing: -0.005em; --text-body-lg--font-weight: 400;
  --text-body-md: 14px; --text-body-md--line-height: 20px; --text-body-md--font-weight: 400;
  --text-body-sm: 13px; --text-body-sm--line-height: 18px; --text-body-sm--font-weight: 400;
  --text-label-md: 13px; --text-label-md--line-height: 16px; --text-label-md--letter-spacing: 0.01em; --text-label-md--font-weight: 500;
  --text-label-sm: 11px; --text-label-sm--line-height: 14px; --text-label-sm--letter-spacing: 0.04em; --text-label-sm--font-weight: 600;
  --text-code-sm: 12px; --text-code-sm--line-height: 16px; --text-code-sm--letter-spacing: 0.02em; --text-code-sm--font-weight: 500;
  --spacing-gutter: 1.5rem; --spacing-gutter-sm: 1rem; --spacing-margin: 2rem; --spacing-margin-sm: 1rem;
  --spacing-space-xs: 0.25rem; --spacing-space-sm: 0.5rem; --spacing-space-md: 1rem; --spacing-space-lg: 1.5rem; --spacing-space-xl: 2.5rem;
}
:root { --ring: #06a4aa; }

body { background-color: var(--surface); color: var(--on-surface); font-size: 0.875rem; line-height: 1.25rem; -webkit-font-smoothing: antialiased; }
.tabular-nums { font-variant-numeric: tabular-nums; }
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
```
Notas: (a) a lista completa de `--color-*` no `@theme inline` deve espelhar **todos** os tokens de `:root`; (b) `--ring` fica fora do `@theme inline` porque troca por tema (o `@theme inline` usa `var(--ring)`); (c) `.dark` é aplicado por `next-themes attribute="class"`.

- [ ] **Step 3: `src/app/layout.tsx` — Inter e remoção de Material Symbols**

Substituir os imports `Nunito, Lato` por `Inter` (variable `--font-inter`, `subsets:["latin"]`, `display:"swap"`). `<html className={inter.variable}>`. Remover o `<link>` de Material Symbols do `<head>`. Manter metadata, `viewport`, `Providers`.

- [ ] **Step 4: Deletar `apps/web/tailwind.config.ts`**

- [ ] **Step 5: Verificar**

Run: `npm run build` → Expected: build conclui sem erro. `npm run typecheck` → Expected: sem erros.
(Pode gerar aviso de hidratação de tema; não é bloqueante.)

---

### Task 2: Shell do app (Sidebar + Header + layout)

**Files:**
- Modify: `apps/web/src/app/(app)/layout.tsx`
- Modify: `apps/web/src/components/layout/Sidebar.tsx`
- Modify: `apps/web/src/components/layout/Header.tsx`
- Modify: `apps/web/src/components/layout/ThemeToggle.tsx`
- Create: `apps/web/src/components/layout/nav.ts`
- Test: `apps/web/src/components/layout/__tests__/nav.test.ts`

**Interfaces:**
- Produces: `NAV_ITEMS: NavItem[]`, `NavItem = { title: string; href: string; icon: LucideIcon; match: (pathname: string) => boolean }`.
- Consumes: tokens da Task 1.

- [ ] **Step 1: Criar `src/components/layout/nav.ts`**

```ts
import { Sparkles, Clock, BarChart3, SlidersHorizontal, type LucideIcon } from "lucide-react";
export interface NavItem { title: string; href: string; icon: LucideIcon; match: (p: string) => boolean; }
export const NAV_ITEMS: NavItem[] = [
  { title: "Nova Análise", href: "/analises/nova", icon: Sparkles, match: (p) => p.startsWith("/analises/nova") },
  { title: "Histórico", href: "/historico", icon: Clock, match: (p) => p.startsWith("/historico") || /^\/analises\/[^/]+$/.test(p) },
  { title: "Relatórios / Métricas", href: "/relatorios", icon: BarChart3, match: (p) => p.startsWith("/relatorios") },
  { title: "Configurações da Empresa", href: "/configuracoes", icon: SlidersHorizontal, match: (p) => p.startsWith("/configuracoes") },
];
```

- [ ] **Step 2: Teste do nav**

```ts
import { describe, it, expect } from "vitest";
import { NAV_ITEMS } from "../nav";
describe("NAV_ITEMS", () => {
  it("expõe os 4 itens do mockup com hrefs corretos", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(["/analises/nova", "/historico", "/relatorios", "/configuracoes"]);
  });
  it("marca resultado de análise como Histórico", () => {
    expect(NAV_ITEMS[1].match("/analises/anl_123")).toBe(true);
    expect(NAV_ITEMS[1].match("/analises/nova")).toBe(false);
  });
});
```

- [ ] **Step 3: Rodar o teste** → Expected: PASS.

- [ ] **Step 4: `Sidebar.tsx` conforme o mockup**

`<aside class="fixed left-0 top-0 h-full w-64 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">`:
- Cabeçalho `h-16 px-space-lg flex items-center gap-space-sm`: logo (bloco `Terminal` em `bg-primary-container text-on-primary-fixed rounded-lg`) + "OpsPilot" (`text-headline-sm text-surface-container-lowest`) + badge "AI Ops" (`text-label-sm uppercase bg-surface-container-highest/20 text-primary-fixed`).
- Nav `px-space-md py-space-sm` iterando `NAV_ITEMS` com `Link`; item ativo = `bg-primary-container text-on-primary-fixed font-semibold rounded-lg shadow-sm`; inativo = `text-surface-variant hover:bg-surface-container-highest/15 hover:text-surface-container-lowest`. Ícone `h-[18px] w-[18px]`, texto `text-label-md`. `aria-current="page"` no ativo.
- Rodapé `p-space-md bg-inverse-surface/80`: card do perfil (avatar/inicial, nome = `user?.nome || "Mariana Silva"`, cargo "Líder de Operações") + botão logout (`LogOut`, chama `handleLogout` existente) + `ThemeToggle`.
- Manter props `user`, `className`, `onNavigate`.

- [ ] **Step 5: `Header.tsx` conforme o mockup**

`<header class="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">` com inner `px-space-lg flex items-center justify-between`:
- Esquerda: botão hamburguer (`md:hidden`, abre drawer) + pill de status `bg-surface-container text-on-surface-variant text-label-sm` com ponto `bg-primary-container animate-pulse` e `<strong>Sistema Operacional: 99.9% online</strong>`.
- Direita: campo busca `bg-surface-container-low` com `Search`, placeholder "Buscar comandos..." e `<kbd className="bg-surface-container text-code-sm">⌘K</kbd>` (foco via `⌘K`, id `global-search-input`); link "Novo Diagnóstico" `bg-primary-container text-on-primary-fixed font-label-md hover:bg-primary hover:text-on-primary`; avatar.
- Manter drawer mobile (mostra `<Sidebar onNavigate={...}>`).

- [ ] **Step 6: `ThemeToggle.tsx`** — restilizar para o contexto `inverse-surface` (texto `text-surface-variant`, `hover:bg-surface-container-highest/20`, ícones `Sun`/`Moon`).

- [ ] **Step 7: `(app)/layout.tsx`**

```tsx
<div className="min-h-screen bg-surface-container-low">
  <Sidebar className="hidden md:flex fixed left-0 top-0 h-full w-64" />
  <div className="md:pl-64">
    <Header />
    <main id="main-content" tabIndex={-1} className="relative pt-16 bg-surface-container-low min-h-screen focus:outline-none">
      <div className="w-full px-space-lg py-space-lg">{children}</div>
    </main>
  </div>
</div>
```
(`<Header/>` e `<Sidebar/>` são client; manter `"use client"` neles.)

- [ ] **Step 8: Verificar** — `npm test` (nav test PASS) e `npm run build`.

---

### Task 3: Badges e ConfidenceMeter (tokens Material)

**Files:**
- Modify: `apps/web/src/components/analysis/CategoryBadge.tsx`
- Modify: `apps/web/src/components/analysis/PriorityBadge.tsx`
- Modify: `apps/web/src/components/analysis/SentimentBadge.tsx`
- Modify: `apps/web/src/components/analysis/ConfidenceMeter.tsx`
- Test: `apps/web/src/components/analysis/__tests__/badges.test.tsx` (atualizar)

**Interfaces:**
- Mantém as props atuais (`category`, `priority`+`sla`, `sentiment`+`detail`, `confidence`+`modelVersion`+`className`).
- Consumes: tokens da Task 1.

- [ ] **Step 1: Atualizar o teste (falha primeiro)**

Manter as 4 asserções de conteúdo existentes (`Confiança da IA:`, `96.8%`, `Modelo FinOps v3.2`, `Financeiro / Faturamento`, `Negativo / Frustrado (Risco de Evasão)`, `CRÍTICA`) e adicionar:
```ts
it("PriorityBadge crítica usa tokens error-container", () => {
  const html = renderToString(React.createElement(PriorityBadge, { priority: "critica" }));
  expect(html).toContain("bg-error-container");
  expect(html).toContain("text-on-error-container");
});
```

- [ ] **Step 2: Rodar** `npm test -- badges` → Expected: FAIL na nova asserção.

- [ ] **Step 3: Restilizar os componentes** conforme `resultado_da_an_lise/code.html`:
- `CategoryBadge`: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-label-md` + ícone `Wallet`-like (usar `Folder`, `text-primary`, 16px).
- `PriorityBadge`: 4 níveis com `text-label-sm uppercase font-semibold`:
  - crítica → `bg-error-container text-on-error-container` + `Flame`;
  - alta → `bg-[rgba(234,88,12,0.12)] text-[#EA580C]` — **usar tokens**: `bg-tertiary-fixed text-on-tertiary-container` como equivalente do mockup (`bg-tertiary-fixed text-on-tertiary-container`) + `AlertTriangle`;
  - média → `bg-[rgba(202,138,4,0.12)] text-[#CA8A04]` (manter inline RGBA conforme DESIGN.md §2) + `Clock`;
  - baixa → `bg-[rgba(22,163,74,0.12)] text-[#16A34A]` + `CheckCircle2`.
  Exibir sufixo `(SLA < 2h)` quando `sla` for passado (como o mockup "Crítica (SLA < 2h)").
- `SentimentBadge`: negativo → `bg-tertiary-fixed text-on-tertiary-fixed-variant` + `Frown`; positivo → `bg-primary-container/15 text-on-primary-container` + `Smile`; neutro → `bg-surface-container text-on-surface-variant` + `Meh`.
- `ConfidenceMeter`: container `bg-surface-container-high text-on-surface rounded-lg`, ícone `Brain text-primary-container`, barra `w-20 h-1.5 bg-surface-container-highest` com preenchimento `bg-primary-container`; manter cálculo de porcentagem e `tabular-nums`.

- [ ] **Step 4: Rodar** `npm test -- badges` → Expected: PASS.

---

### Task 4: Página de Login (`login_cadastro/code.html`)

**Files:**
- Modify: `apps/web/src/app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: `authApi` (`src/lib/api/auth.ts`), `toast` (sonner), schemas de auth.
- Mantém: rota `?from=`, redirecionamento para `/analises/nova`, modo `login|register`.

- [ ] **Step 1: Estrutura fiel ao mockup**

`<main class="w-full min-h-screen flex items-center justify-center p-space-lg bg-surface">` com card `grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden shadow-xl bg-surface-container-low min-h-[942px]`:
- **Esquerda `lg:col-span-6`** `bg-gradient-to-br from-on-secondary-fixed via-on-primary-fixed to-inverse-surface text-surface p-space-lg lg:p-space-xl flex flex-col justify-between` + glows radiais (`bg-primary-container/20`, `bg-primary/25`, `blur-3xl`):
  - topo: logo `Terminal` + "OpsPilot" + badge "AI OPS" (`bg-primary-container/25 text-primary-fixed`) + "Operational Cockpit v2.4" (`text-secondary-fixed-dim`); pill "Cluster Brasil Leste 99.98%" (ponto `bg-primary-container animate-pulse`).
  - centro: `<h1 class="text-headline-xl text-surface-bright">Decisões operacionais críticas com precisão de IA em segundos.</h1>` + 3 bullets (`bg-surface-variant/10 rounded-lg`, ícones `TrendingUp`, `ShieldCheck`, `Network`, textos exatos do mockup).
  - base: `Lock` + "Conformidade LGPD & SOC2 Type II"; direita "Latência p99 < 140ms • Criptografia mTLS E2E".
- **Direita `lg:col-span-6`** `bg-surface-container-low flex items-center justify-center p-space-md lg:p-space-xl`, card `max-w-md bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-xl shadow-md`:
  - Tabs (`grid grid-cols-2 p-1 bg-surface-container rounded-lg`): "Entrar" / "Criar conta corporativa" — ativos conforme `mode`.
  - Título/subtítulo dinâmicos: login "Acesse o console" / "Entre com suas credenciais…"; register "Criar conta corporativa" / "Comece o piloto de triagem…" (textos do mockup).
  - Botões SSO: "Entrar com Google Workspace" (SVG Google) e "Entrar com SSO / SAML 2.0" (`ShieldCheck`); `bg-surface-container hover:bg-surface-container-high`.
  - Divisor "ou continue com seu e-mail corporativo".
  - Form: campo **Nome** (register, `Building2`), **E-mail corporativo** (`AtSign`), **Senha** (`Eye/EyeOff` + link "Esqueceu a senha?" que preenche demo). Inputs `bg-surface-container-low rounded-lg focus:ring-1 focus:ring-primary-container`.
  - Botão primário `bg-primary-container hover:bg-primary-fixed text-on-primary-fixed` com texto "Acessar OpsPilot"/"Criar Organização e Acessar" + `ArrowRight`.
  - Rodapé Termos/Política.
- **Funcionalidade:** manter `handleSubmit` (validação + `authApi.login/register` → `router.push(from)`), loading, alerta de erro em `bg-error-container text-on-error-container`, `fillDemoCredentials` (`analista@opspilot.ai` / `senha123`).

- [ ] **Step 2: Verificar** `npm run build` + smoke manual em `npm run dev` (login e registro navegam para `/analises/nova`).

---

### Task 5: Nova Análise (`nova_an_lise/code.html`)

**Files:**
- Modify: `apps/web/src/components/analysis/AnalysisForm.tsx`

**Interfaces:**
- Consumes: `useCreateAnalysis`, `createAnalysisSchema`/`CreateAnalysisInput`/`Tom`/`Canal`, `router`.
- Mantém `REAL_EXAMPLE`, defaults (`tom:"empatico"`, `canal:"email"`, `urgenciaUsuario:4`), atalho `Ctrl/⌘+Enter`, `handleClear`, `handleRestoreExample`.

- [ ] **Step 1: Estrutura fiel ao mockup** (grid `xl:grid-cols-12`, esquerda `xl:col-span-8`, direita `xl:col-span-4`)
- **Cabeçalho:** breadcrumb `OpsPilot › Nova Análise` (`text-label-sm uppercase`, último `text-primary font-semibold`), `<h1 class="text-headline-xl">Nova Análise de Solicitação</h1>`, subtítulo. Direita: pill "Motor Neural **v4.2 Active**" (`Zap text-primary`) e botão "Limpar" (`RotateCcw`).
- **Card do formulário** `bg-surface-container-lowest rounded-xl shadow-sm p-space-lg`:
  - **Canal de Entrada:** 5 botões (`grid-cols-2 sm:grid-cols-5`) E-mail/Chat/Ticket/Reunião/Outro com ícones `Mail/MessageSquare/Ticket/Users/Route`; ativo `bg-primary/10 text-primary font-semibold` (conforme script do mockup).
  - **Tom:** 4 botões Formal/Neutro/Empático/Resolutivo (2 linhas de texto: título `text-label-md font-semibold` + desc `text-label-sm opacity-70`); ativo `bg-primary/10 text-primary`; "Resolutivo" mostra `CheckCircle2`. **Nota:** o schema só aceita `formal|neutro|empatico`; "Resolutivo" mapeia para o default `empatico` mantendo o rótulo — registrar como decisão e manter `setValue("tom","empatico")`.
  - **Conteúdo da Solicitação:** label + `*`; direita "Restaurar Exemplo Real" (`FileText`) e contador `text-code-sm` `{n} / 5.000`; `textarea` `rounded-xl bg-surface-container-low p-space-md focus:bg-surface resize-y`, `maxlength=5000`.
  - **Accordion "Contexto Adicional da Empresa"** `bg-surface-container-low`, `Building2`, `ChevronDown` rotaciona; conteúdo com 3 campos como no mockup: "Nome do Cliente / Conta", "Plano / Tier de Serviço" (select), "Histórico Prévio Recente". Ligar apenas `contextoAdicional` ao form (os outros 2 são visuais/opcionais).
  - **Rodapé:** "Anonimização de CPF, CNPJ e dados bancários ativada." (`ShieldCheck text-tertiary`) + botão "Analisar com OpsPilot" (`Sparkles` + `kbd` "Ctrl + Enter") `bg-primary-container text-on-primary-fixed hover:bg-primary hover:text-on-primary`.
- **3 cards de métrica** (`~ 3.2s`/`Gauge`, "Zero Data Retention"/`Lock`, "3 Modelos Cruzados"/`Brain`).
- **Coluna direita:** "Pipeline Operacional de IA" (`Network`, badge "Sequência", 4 passos com bolinhas numeradas), "Prévia do Painel de Saída" (pill "Aguardando" + skeleton `animate-pulse` como no mockup), "Conformidade & Governança" (`ShieldCheck` + chips LGPD/SOC2/ISO).
- **Funcionalidade:** submissão chama `createMutation` → `router.push('/analises/${id}')`; erro via `errors.relato`; botão desabilitado se `charCount < 20` ou `isPending`.

- [ ] **Step 2: Verificar** `npm run typecheck` + `npm test` + smoke: submeter cria análise e navega para o resultado.

---

### Task 6: Resultado da Análise (`resultado_da_an_lise/code.html`)

**Files:**
- Modify: `apps/web/src/app/(app)/analises/[id]/page.tsx`

**Interfaces:**
- Consumes: `useAnalysis(id)`, badges (Task 3), `toast`, `router`.

- [ ] **Step 1: Estrutura fiel ao mockup**
- **Banner de Atenção** `bg-tertiary-fixed rounded-xl` com ícone `Gavel` em `bg-tertiary-container/40`, título "Atenção Operacional: Requer revisão humana antes do envio", pill `bg-error text-on-error` "AÇÃO BLOQUEADA", parágrafo, botão "Ver Histórico do Contrato". Exibir quando `analysis.requerRevisaoHumana` for verdadeiro (fallback: sempre visível como no mockup quando `id` demo).
- **Cockpit de metadados** `bg-surface-container-lowest rounded-xl p-space-lg`: linha `ID: {id}` (`bg-surface-container text-code-sm`), "Processado em 1.4s", "E-mail Corporativo", empresa; `<h1 class="text-headline-xl">Diagnóstico #{id} — {categoria}</h1>`; controles `ArrowLeft/ArrowRight` + "Exportar Análise" (`Share2`).
- **Badges:** `CategoryBadge` (categoria), `PriorityBadge` (prioridade + SLA), `SentimentBadge` (sentimento), `ConfidenceMeter` (confiança + modelo).
- **Grid** `lg:grid-cols-12`, esquerda `lg:col-span-7`, direita `lg:col-span-5 sticky top-20`:
  - **Esquerda:** "Riscos Operacionais e Contratuais" (2 cards com barra lateral `bg-error`/`bg-tertiary-container`, pills "Nível 5"/"Impacto Alto", metadados com `CircleDollarSign`/`Calendar`/`Shield`/`Receipt`/`CreditCard`); "Checklist de Ações Recomendadas" (checkbox custom, contador `n de N`, `User`+`Timer`+chips); "Informações Faltantes" (`bg-surface-container`, `HelpCircle`); "Anexo Detectado" (`Package` + `Eye` "Visualizar PDF").
  - **Direita (painel OpsPilot Suggestion)** `bg-tertiary-fixed rounded-xl`: header `Sparkles` + "OPSPILOT SUGGESTION" + pill "Pronto para Envio"; título "Resposta Sugerida" + tom; toolbar "Copiar" (`Copy`) / "Editar no Editor" (`Edit3`); textarea editável com a minuta (`analysis.respostaSugerida`); box de conformidade (4 itens); botão "Aprovar e Enviar Resposta" (`Send`) `bg-primary-container`; rodapé "Regerar resposta com outro tom" + "Atalho: ⌘ + Enter". Depois, card "Contexto Rápido do Contrato" (Tier / NPS / Tickets).
- **Funcionalidade:** checklist clicável (estado local, contador dinâmico), copiar minuta (`navigator.clipboard`), enviar (`toast`), exportar (`toast`), navegação `router.push('/analises/nova')`. Renderizar estado de carregamento quando `isLoading`.

- [ ] **Step 2: Verificar** `npm run build` + smoke: abrir `/analises/anl_891234` renderiza sem erro.

---

### Task 7: Histórico (`historico`, sem mockup — mesmo design system)

**Files:**
- Modify: `apps/web/src/app/(app)/historico/page.tsx`

**Interfaces:**
- Consumes: `useAnalyses`, badges, `Link`, `router`.
- Produz: lista estilo "ticket row" (Design System: `bg-cream-100`→`bg-surface-container-lowest`, hover `bg-surface-container-low`, borda `border-outline-variant`, acento esquerdo `border-primary` quando selecionado).

- [ ] **Step 1: Restilizar** mantendo busca/paginação/refresh existentes com classes de token: header `text-headline-xl`; toolbar `bg-surface-container-lowest rounded-xl`; linhas com `#id` em `bg-surface-container text-code-sm`, badges (Task 3), `diagnostico` e `relato` (line-clamp), metadados `Clock` + canal/tom, `ConfidenceMeter`, link "Ver Diagnóstico" (`ArrowRight`). Botão "Nova Análise" `bg-primary-container text-on-primary-fixed`. Estados vazio (`Inbox`) e carregando já existem — apenas retokenizar.

- [ ] **Step 2: Verificar** `npm test` + smoke com filtro sem resultados (estado vazio).

---

### Task 8: Relatórios / Métricas (nova)

**Files:**
- Create: `apps/web/src/lib/reports/metrics.ts`
- Test: `apps/web/src/lib/reports/__tests__/metrics.test.ts`
- Create: `apps/web/src/app/(app)/relatorios/page.tsx`
- Modify: `apps/web/src/proxy.ts` (proteger `/relatorios`)

**Interfaces:**
- Produces: `computeDashboardMetrics(analyses: AnalysisResult[]): DashboardMetrics` com `{ total, porPrioridade: Record<Prioridade, number>, porCategoria: { categoria: string; count: number }[], confiancaMedia: number, requerRevisao: number, requerRevisaoPct: number }`.

- [ ] **Step 1: Teste (falha primeiro)**

```ts
import { describe, it, expect } from "vitest";
import { computeDashboardMetrics } from "../metrics";
import type { AnalysisResult } from "@/lib/schemas/analysis";
const base = (o: Partial<AnalysisResult>): AnalysisResult => ({ id: "x", relato: "", tom: "neutro", canal: "ticket", diagnostico: "", categoria: "Cat", prioridade: "media", sentimento: "neutro", confianca: 90, requerRevisaoHumana: false, planoDeAcao: [], informacoesFaltantes: [], riscosIdentificados: [], respostaSugerida: "", dataCriacao: "", usuarioId: "u", ...o });
describe("computeDashboardMetrics", () => {
  it("array vazio retorna zeros", () => {
    const m = computeDashboardMetrics([]);
    expect(m.total).toBe(0);
    expect(m.confiancaMedia).toBe(0);
    expect(m.requerRevisaoPct).toBe(0);
  });
  it("conta prioridades, categorias e revisão", () => {
    const m = computeDashboardMetrics([
      base({ prioridade: "critica", categoria: "A", confianca: 80, requerRevisaoHumana: true }),
      base({ prioridade: "critica", categoria: "A", confianca: 100 }),
      base({ prioridade: "baixa", categoria: "B", confianca: 90 }),
    ]);
    expect(m.total).toBe(3);
    expect(m.porPrioridade.critica).toBe(2);
    expect(m.porCategoria[0]).toEqual({ categoria: "A", count: 2 });
    expect(m.confiancaMedia).toBe(90);
    expect(m.requerRevisaoPct).toBeCloseTo(33.3, 1);
  });
});
```

- [ ] **Step 2: Rodar** `npm test -- metrics` → Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `metrics.ts`** (agregação; categorias ordenadas por `count` desc; `confiancaMedia` = média arredondada a 1 casa; `requerRevisaoPct` = `total? round(revisao/total*1000)/10 : 0`).

- [ ] **Step 4: Rodar** `npm test -- metrics` → Expected: PASS.

- [ ] **Step 5: Página `relatorios/page.tsx`** (client): `useAnalyses({ limit: 100 })`, `<h1 class="text-headline-xl">Relatórios / Métricas</h1>`, grid de cards `bg-surface-container-lowest rounded-xl shadow-sm` com: Total de Diagnósticos, Confiança Média (barra `bg-primary-container`), Requer Revisão Humana (% e contagem), distribuição por prioridade (4 chips com as cores de severidade) e "Top Categorias" (lista com count). Estados vazio/carregando. `tabular-nums` em números.

- [ ] **Step 6: `proxy.ts`** — incluir `pathname.startsWith("/relatorios")` em `isProtectedRoute`. Verificar `npm run build`.

---

### Task 9: Configurações da Empresa (nova)

**Files:**
- Create: `apps/web/src/app/(app)/configuracoes/page.tsx`
- Modify: `apps/web/src/proxy.ts` (proteger `/configuracoes`)

**Interfaces:**
- Consumes: tokens, `toast`. Sem backend real de settings — persistir em estado local/toast (registrar como decisão).

- [ ] **Step 1: Página `configuracoes/page.tsx`** (client): `<h1 class="text-headline-xl">Configurações da Empresa</h1>` e cards `bg-surface-container-lowest rounded-xl shadow-sm`:
  - "Organização": Nome da Organização, Domínio corporativo, Plano/Tier (select com as 4 opções do mockup: Enterprise Platinum/Gold, Growth, Standard).
  - "Preferências de Triagem": tom padrão (radio/segmented), canal padrão (5 opções), toggle "Anonimização de CPF/CNPJ e dados bancários" (`bg-surface-container` switch).
  - "Conformidade": chips LGPD / SOC 2 / ISO 27001.
  - Botão "Salvar Configurações" `bg-primary-container text-on-primary-fixed` → `toast.success("Configurações salvas.")`. Botão "Padrões" (`RotateCcw`) restaura defaults.
- [ ] **Step 2: `proxy.ts`** — incluir `pathname.startsWith("/configuracoes")`. Verificar `npm run build`.

---

### Task 10: Verificação final

**Files:** nenhum (validação).

- [ ] **Step 1:** `npm run typecheck` → Expected: sem erros.
- [ ] **Step 2:** `npm test` → Expected: todos os testes PASS (schemas, badges, nav, metrics).
- [ ] **Step 3:** `npm run lint` (se `next lint` estiver indisponível no Next 16, rodar `npx eslint src`) → Expected: sem erros bloqueantes.
- [ ] **Step 4:** `npm run build` → Expected: build de produção conclui.
- [ ] **Step 5:** Smoke manual (`npm run dev`): alternar tema claro/escuro; navegar pelos 4 itens do menu; login → nova análise → resultado; histórico com busca/filtro; relatórios e configurações. Confirmar visualmente contra os `screen.png` de cada mockup.
