# OpsPilot Backend (NestJS + Groq) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o back-end NestJS do OpsPilot (auth JWT, módulo de IA com Groq, persistência Prisma/Postgres, Swagger, CI, deploy sem Docker) e ligá-lo ao front `apps/web` via adaptador no BFF.

**Architecture:** Monorepo pnpm com `apps/web` (Next, Vercel), `apps/api` (NestJS), `packages/contracts` (OpenAPI gerado) e `prompts/`. O front fala com o NestJS através do BFF já existente; o BFF reescreve `/analises→/analyses` e traduz o DTO do back para o shape do front. A chave da Groq vive só no NestJS.

**Tech Stack:** NestJS 10, TypeScript estrito, `groq-sdk`, Zod, Prisma + PostgreSQL (Neon), `@nestjs/config`, class-validator, `@nestjs/swagger`, `@nestjs/throttler`, helmet, `@nestjs/jwt` + bcrypt, `nestjs-pino`, Jest, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-10-opspilot-backend-design.md`

## Global Constraints

- TS estrito em todos os pacotes; sem `any` explícito fora de `catch`.
- Todo comando via `pnpm` nos pacotes; nada de `npm`/`yarn`.
- Prefixo HTTP `/api/v1`; CORS restrito por `WEB_ORIGIN`; helmet ligado.
- Erros sempre `{ statusCode, code, message, requestId }`, mensagens em pt-BR, sem vazar detalhes internos.
- Nenhum segredo no repositório; entregar `.env.example`; `.env*` no `.gitignore`.
- `GROQ_MODEL` só via env (nunca fixar modelo no código); timeout padrão `25000` via `GROQ_TIMEOUT_MS`.
- Enums de entrada: `canal = email|chat|ticket|reuniao|outro`; `tom = formal|neutro|empatico`.
- Schema de saída da IA: `resumo(≤400)`, `categoria(financeiro|suporte_tecnico|comercial|rh|juridico|infraestrutura|outros)`, `prioridade(critica|alta|media|baixa)`, `justificativaPrioridade`, `sentimento(positivo|neutro|negativo|muito_negativo)`, `riscos[]`, `acoesRecomendadas[{acao,responsavelSugerido,prazoSugerido}]`, `informacoesFaltantes[]`, `respostaSugerida`, `confianca(0..1)`, `requerRevisaoHumana`.
- Rate limit de criação de análise: 10/min por `userId`.
- Cada etapa = 1 commit; rodar lint + testes antes de avançar. Conventional Commits; tag `v0.1.0` ao final.

## Review Focus

- **Injection:** texto do usuário contém "ignore as regras anteriores" → é DADO; nunca vira instrução; se detectado, entra em `riscos`.
- **Dados sensíveis:** CPF/CNPJ/cartão no `relato` → mascarados em logs; texto bruto e resposta bruta da IA nunca aparecem em log.
- **Saída da IA inválida:** JSON válido mas fora do schema → 1 reparo; segundo erro → `AI_UPSTREAM_ERROR` (502).
- **Isolamento:** `GET /analyses/:id` de análise de outro usuário → 404 (não vaza existência).
- **Rate limit por usuário:** 11ª requisição em <1min do mesmo `userId` → 429; contas distintas não se afetam; `confianca` exatamente 0 ou 1 valida.

---

## Task 1: Scaffold do monorepo, prompts/, docker-compose, git

**Files:**
- Create: `pnpm-workspace.yaml`, `package.json` (raiz), `.gitignore`, `.npmrc`, `prompts/triage/v1/system.md`, `docker-compose.yml`, `packages/contracts/package.json`
- Modify: `apps/web/package.json` (name → `@opspilot/web`)
- Delete: `apps/web/pnpm-workspace.yaml`, `apps/web/pnpm-lock.yaml`

**Interfaces:**
- Produces: workspace pnpm com `apps/*` e `packages/*`; raiz com scripts `lint`, `typecheck`, `test`, `build`, `contracts:export`.

- [ ] **Step 1:** `git init` na raiz; criar `.gitignore` (node_modules, .next, dist, `.env*`, `!.env.example`, coverage).
- [ ] **Step 2:** `pnpm-workspace.yaml` com `packages: ['apps/*','packages/*']`; `.npmrc` com `node-linker=hoisted` (compatível com Next/Nest) — ou documentar escolha.
- [ ] **Step 3:** `package.json` raiz (private, packageManager pnpm) com scripts que delegam via `pnpm -r`/`--filter`.
- [ ] **Step 4:** Criar `prompts/triage/v1/system.md` com o conteúdo exato do spec (PAPEL…QUANDO NÃO SOUBER).
- [ ] **Step 5:** Criar `packages/contracts/package.json` (`@opspilot/contracts`, private) e `packages/contracts/openapi.json` placeholder `{}`.
- [ ] **Step 6:** `docker-compose.yml` (web, api, postgres) com healthchecks e envs por `.env`.
- [ ] **Step 7:** Renomear `apps/web` para `@opspilot/web`; remover os arquivos pnpm órfãos.
- [ ] **Step 8:** Rodar `pnpm install`; verificar `pnpm --filter @opspilot/web typecheck` ainda passa.
- [ ] **Step 9:** Commit `chore: scaffold pnpm monorepo, prompts and compose`.

---

## Task 2: api — config validada, Prisma, auth JWT, health

**Files:**
- Create: `apps/api/package.json`, `tsconfig.json`, `nest-cli.json`, `.eslintrc.cjs`, `jest.config.js`, `.env.example`, `.gitignore`
- Create: `apps/api/src/main.ts`, `src/app.module.ts`
- Create: `src/common/config/env.validation.ts`, `src/common/config/configuration.ts`
- Create: `src/prisma/schema.prisma`, `src/prisma/prisma.module.ts`, `src/prisma/prisma.service.ts`
- Create: `src/auth/{auth.module.ts,auth.controller.ts,auth.service.ts,dto/register.dto.ts,dto/login.dto.ts,jwt.strategy.ts,jwt-auth.guard.ts,current-user.decorator.ts}`
- Create: `src/users/{users.module.ts,users.service.ts}`
- Create: `src/health/{health.module.ts,health.controller.ts}`
- Test: `src/auth/auth.service.spec.ts`, `test/health.e2e-spec.ts`

**Interfaces:**
- Produces: `PrismaService extends PrismaClient`; `AuthService.register(dto)->{user,token}`, `login(dto)->{user,token}`, `validateUser`; `JwtAuthGuard`; `@CurrentUser() user: {id,email}`; env schema Zod validando as 9 vars.

- [ ] **Step 1:** `package.json` do api com deps (nest, prisma, @prisma/client, zod, class-validator, @nestjs/swagger, @nestjs/throttler, helmet, @nestjs/jwt, bcrypt, nestjs-pino, groq-sdk) e scripts `build/start/dev/lint/typecheck/test/test:e2e`.
- [ ] **Step 2:** Teste falho `auth.service.spec.ts`: register cria usuário com hash (não salva senha pura) e token; login com senha errada lança `UnauthorizedException`; email duplicado lança `ConflictException`.
- [ ] **Step 3:** Rodar `pnpm --filter @opspilot/api test` → FAIL.
- [ ] **Step 4:** `env.validation.ts` (Zod) + `configuration.ts`; `PrismaService` (onModuleInit connect); `schema.prisma` com `User`/`Analysis` (inclui `tom`, `canal`, `resultado Json`, `meta Json`, índices).
- [ ] **Step 5:** Implementar `UsersService` e `AuthService` (bcrypt hash; JWT sign com `JWT_SECRET`/`JWT_EXPIRES_IN`).
- [ ] **Step 6:** `main.ts`: helmet, CORS `WEB_ORIGIN`, ValidationPipe global (whitelist/transform), prefixo `api/v1`, Swagger `/docs` (placeholder de config), pino logger, `PORT`.
- [ ] **Step 7:** `health.controller` → `{status,uptime,db}`; `prisma validate` e `prisma generate`.
- [ ] **Step 8:** Rodar testes → PASS; `pnpm --filter @opspilot/api build`; commit `feat(api): config, prisma, auth and health`.

---

## Task 3: api — módulo ai (schemas Zod, prompt loader, guardrails, Groq client, agente) + testes

**Files:**
- Create: `src/ai/ai.module.ts`, `src/ai/schemas/analysis-result.schema.ts`, `src/ai/prompt-loader.service.ts`, `src/ai/guardrails.ts`, `src/ai/groq.client.ts`, `src/ai/triage.agent.ts`
- Test: `src/ai/guardrails.spec.ts`, `src/ai/triage.agent.spec.ts`, `src/ai/prompt-loader.service.spec.ts`

**Interfaces:**
- Produces: `analysisResultSchema` (Zod) + `type AnalysisResult`; `filterSensitive(text): string`; `hasInjection(text): boolean`; `assertWithinLimits(text)`; `PromptLoaderService.load(version)->string` (cache); `GroqClient.complete({system,user,timeoutMs})->{text,usage,model}`; `TriageAgent.run(input)->{resultado, meta:{modelo,latenciaMs,tokens,versaoPrompt}}`.

- [ ] **Step 1:** Testes falhos `guardrails.spec.ts`: limita 20/8000; mascara CPF/CNPJ/cartão; `hasInjection` detecta "ignore as regras anteriores"/"ignore previous instructions".
- [ ] **Step 2:** Rodar → FAIL. Implementar `guardrails.ts` (regex + máscara) → PASS.
- [ ] **Step 3:** Teste falho `prompt-loader.service.spec.ts`: carrega `prompts/triage/v1/system.md` e cacheia (segunda chamada não relê arquivo).
- [ ] **Step 4:** Implementar `PromptLoaderService` (path resolvido a partir da raiz do repo / env `PROMPTS_DIR`), `ai.module`, `analysis-result.schema.ts`.
- [ ] **Step 5:** Testes falhos `triage.agent.spec.ts` (Groq mockada): (a) saída válida → retorna resultado+meta; (b) JSON inválido → 1 reparo e sucesso; (c) JSON inválido 2x → `AI_UPSTREAM_ERROR`; (d) timeout → `AI_TIMEOUT`; (e) 429 → `AI_BUSY`.
- [ ] **Step 6:** Implementar `groq.client.ts` (json_object, temperature 0.2, timeout via AbortController, retry 429/5xx) e `triage.agent.ts` (monta `<solicitacao>`, valida Zod, reparo único, mapeia erros).
- [ ] **Step 7:** Rodar → PASS; commit `feat(api): ai module with guardrails, prompt loader, groq client and agent`.

---

## Task 4: api — analyses + erros padronizados + rate limit + e2e

**Files:**
- Create: `src/common/filters/http-exception.filter.ts`, `src/common/interceptors/request-id.interceptor.ts`, `src/common/errors.ts`
- Create: `src/analyses/{analyses.module.ts,analyses.controller.ts,analyses.service.ts,dto/create-analysis.dto.ts,dto/list-analyses.dto.ts}`
- Test: `src/analyses/analyses.service.spec.ts`, `test/analyses.e2e-spec.ts`

**Interfaces:**
- Consumes: `TriageAgent.run`, `PrismaService`, `JwtAuthGuard`, `@CurrentUser`.
- Produces: `POST /api/v1/analyses`, `GET /api/v1/analyses`, `GET /api/v1/analyses/:id`; DTO de leitura canônico `{id,relato,tom,canal,resultado,meta,createdAt,userId}`; `ThrottlerGuard` por userId.

- [ ] **Step 1:** Teste falho `analyses.service`: create persiste e devolve DTO; list filtra por `categoria`/`prioridade`/`q` e pagina; get de outro usuário → `NotFoundException`.
- [ ] **Step 2:** Rodar → FAIL. Implementar `AnalysesService` (Prisma) → PASS.
- [ ] **Step 3:** `CreateAnalysisDto` (IsEnum canal/tom; `relato` Length 20..8000; `urgenciaUsuario` 1..5 opcional; `contextoAdicional` opcional) + `ListAnalysesDto` (q, categoria, prioridade, page, limit).
- [ ] **Step 4:** `HttpExceptionFilter` (formata `{statusCode,code,message,requestId}`; mapeia `AI_*`), `RequestIdInterceptor`, tracker de throttler por `userId`.
- [ ] **Step 5:** `analyses.controller` com `@UseGuards(JwtAuthGuard, ThrottlerGuard)`; `@Throttle(10/min)` no POST; Swagger decorators.
- [ ] **Step 6:** e2e `analyses.e2e-spec.ts` (Groq mockada): register→login→POST /analyses→GET /analyses/:id; 401 sem token; 429 na 11ª.
- [ ] **Step 7:** Rodar testes + e2e → PASS; commit `feat(api): analyses module, error filter, rate limit and e2e`.

---

## Task 5: OpenAPI exportado + docs/api-contract.md

**Files:**
- Create: `apps/api/src/scripts/export-openapi.ts` (Nest → `packages/contracts/openapi.json`)
- Modify: `package.json` (raiz) adiciona `contracts:export`
- Create: `docs/api-contract.md`

**Interfaces:** Produces: `pnpm contracts:export` gera `packages/contracts/openapi.json` documentando `/api/v1/*`.

- [ ] **Step 1:** Script monta a app Nest, gera o documento via `SwaggerModule`, escreve o JSON.
- [ ] **Step 2:** Rodar `pnpm contracts:export`; verificar que o JSON contém `/api/v1/analyses` e o schema de erro.
- [ ] **Step 3:** `docs/api-contract.md` com rotas, exemplos de request/response e códigos de erro.
- [ ] **Step 4:** Commit `docs(contracts): export OpenAPI and document API contract`.

---

## Task 6: CI, Dockerfile e docs/DEPLOY.md

**Files:**
- Create: `.github/workflows/ci.yml`, `apps/api/Dockerfile`, `apps/web/Dockerfile` (opcional), `docs/DEPLOY.md`

**Interfaces:** Produces: CI roda lint+typecheck+test+build de web e api.

- [ ] **Step 1:** `ci.yml` com Node 20+, pnpm cache, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- [ ] **Step 2:** `Dockerfile` multi-stage, usuário não-root, copia `prompts/` e o contexto é a raiz do monorepo.
- [ ] **Step 3:** `docs/DEPLOY.md`: Render nativo (build/start), Neon (`DATABASE_URL` com sslmode/pgbouncer), Vercel (web + `API_URL`, `NEXT_PUBLIC_USE_MOCKS=false`), lista de variáveis, cold start do free tier.
- [ ] **Step 4:** Commit `chore: CI, Dockerfile and deploy docs`.

---

## Task 7: README + ligação web↔back (BFF adaptador) + tag v0.1.0

**Files:**
- Create: `README.md`, `docs/DECISIONS.md`, `apps/web/src/lib/api/adapters/analysis-adapter.ts`
- Modify: `apps/web/src/app/api/proxy/[...path]/route.ts`, `apps/web/src/app/api/auth/[...action]/route.ts`, `apps/web/.env.example`

**Interfaces:**
- Consumes: DTO canônico do back (Task 4).
- Produces: `toFrontAnalysis(dto): AnalysisResult`; `CATEGORIA_LABEL`/`CATEGORIA_ENUM`; BFF reescreve `/analises↔/analyses` e adapta request/response.

- [ ] **Step 1:** Teste falho (vitest no web) `analysis-adapter.test.ts`: `sentimento` (muito_negativo→negativo; prioridade critica→urgente), `categoria` enum→rótulo e filtro rótulo→enum, `confianca`×100, `diagnostico`=resumo+justificativa, `planoDeAcao` ordem/titulo/descricao.
- [ ] **Step 2:** Rodar → FAIL. Implementar `analysis-adapter.ts` → PASS.
- [ ] **Step 3:** Ajustar `proxy/[...path]/route.ts` para reescrever rota e aplicar o adaptador (create/list/get) quando `NEXT_PUBLIC_USE_MOCKS=false`.
- [ ] **Step 4:** Ajustar `.env.example` do web (`API_URL=https://<host>/api/v1`, `NEXT_PUBLIC_USE_MOCKS=false`).
- [ ] **Step 5:** `README.md` (arquitetura, como rodar, decisões, exemplos curl) e `docs/DECISIONS.md`.
- [ ] **Step 6:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; `git tag v0.1.0`; commit `docs: root README, decisions and web-back integration`.

---

## Self-Review

- **Cobertura do spec:** todas as seções do design (D1–D11, seções 7–16) mapeiam para Tasks 1–7. Env vars → Task 2. Pipeline IA → Task 3. Erros/rate limit → Task 4. OpenAPI → Task 5. CI/Docker/deploy → Task 6. Integração → Task 7.
- **Consistência de tipos:** `toFrontAnalysis`, `AnalysisResult` (back) e `analysisResultSchema` usados de forma única nas Tasks 3/4/7.
- **Review Focus:** cada item tem teste na task dona (injection/limites em T3; isolamento/rate limit em T4; reparo/erros de IA em T3).
- **Proporção:** plano em nível de arquivo/interface, sem transcrever corpos.
