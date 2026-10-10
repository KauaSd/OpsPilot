# OpsPilot — Backend (NestJS + Groq) — Design

Data: 2026-10-10

## 1. Intenção e porquê

O front-end `apps/web` (Next.js) já existe e hoje funciona com mocks locais.
Falta o back-end real: um serviço NestJS que recebe solicitações em texto
livre, chama um LLM na Groq, devolve um diagnóstico estruturado, persiste e
autentica usuários. Este documento descreve como construir esse back-end e
como ligá-lo ao front já existente.

## 2. Objetivos

- Back-end NestJS completo, tipado (TS estrito), testado e containerizável.
- Pipeline de IA: guardrails → prompt versionado → Groq (JSON mode, timeout,
  retry) → validação Zod → reparo único → erro mapeado.
- Autenticação JWT (access token) com bcrypt; cada análise pertence ao seu
  usuário.
- Contrato OpenAPI exportado para `packages/contracts/openapi.json`.
- Documentação: README raiz, `docs/api-contract.md`, `docs/DEPLOY.md`,
  `docs/DECISIONS.md`.
- Deploy **sem depender de Docker localmente** (o alvo é Vercel para o web e um
  host para a API). Dockerfile/compose continuam sendo entregues para quem
  quiser.

## 3. Não-objetivos

- Refresh token / revogação de sessão (só access token).
- Autorização por papéis (RBAC). Todos os usuários são "analistas".
- Front-end novo. O `apps/web` só ganha o mínimo para apontar para a API.
- Multi-tenant real, billing, i18n.

## 4. Anti-objetivos (o que tornaria isso um fracasso)

- Segredos no repositório (`.env` commitado, chave hardcoded).
- Logar o texto bruto do usuário ou a resposta bruta da IA.
- Fixar o modelo Groq no código.
- API que "funciona" apenas com mocks e nunca chama a Groq de verdade.
- Swagger divergente do comportamento real.

## 5. Restrições do ambiente (verificadas)

- `pnpm` 12.x, Node v24, git ok.
- **Docker não instalado nesta máquina** → não dá para subir o compose localmente.
  Os arquivos serão entregues, mas a verificação local será por `pnpm` (build,
  testes) e, opcionalmente, contra o Neon.
- **Sem `GROQ_API_KEY`** → todos os testes usam a Groq mockada. O usuário
  preencherá o `.env`.
- Sem banco Postgres rodando localmente → Prisma será validado por
  `prisma generate`/`prisma validate`; migrações rodarão contra o Neon do
  usuário (ou via `prisma migrate` quando ele tiver a `DATABASE_URL`).
- O repositório ainda **não é git** → `git init` na Etapa 1.

## 6. Decisões (registry)

D1. **Diretório do back-end = `apps/api`** (decidido pelo usuário). O pacote
chama-se `@opspilot/api`.

D2. **Monorepo pnpm.** Raiz com `pnpm-workspace.yaml` (`apps/*`, `packages/*`),
`package.json` raiz com scripts de orquestração. `apps/web` passa a ser
`@opspilot/web` e entra no workspace. O `pnpm-workspace.yaml` órfão que existe
dentro de `apps/web` será removido.

D3. **Ligação web↔back: adaptador no BFF do Next.** O back segue o spec fiel
(contrato próprio, Swagger correto). O BFF já existente
(`apps/web/src/app/api/proxy/[...path]/route.ts` e `api/auth/[...action]`)
ganha uma camada de tradução entre o contrato do back e o contrato que o front
já consome. Assim **as páginas e tipos React não mudam** — só o BFF e o env.
Alternativa descartada (registrada): fazer o back devolver o shape do front
(menos código no front, mas contrato do back deixa de bater com o spec/Swagger).

D4. **Deploy da API sem Docker:** primário = Render nativo (Build Command
`pnpm install --frozen-lockfile && pnpm --filter @opspilot/back build`; Start
Command `node dist/main.js`) ou o Dockerfile entregue; documentaremos também a
alternativa Vercel serverless. Banco = Neon (Postgres serverless, pooling).
Front = Vercel.

D5. **Rate limit por `userId`** (10 requisições/min), com fallback para IP em
rotas públicas.

D6. **`confianca`** circula 0..1 no back (spec) e é convertido para 0..100 no
adaptador do BFF.

D7. **Nomes de rota:** back em inglês (`/analyses`) conforme spec; o BFF traduz
de/para o `/analises` do front.

D8. **`tom` e `canal` são persistidos** (colunas no `Analysis`), além de
`relato`. Assim o DTO de leitura consegue devolvê-los em POST/GET/list.

D9. **DTO canônico de leitura** = `{ id, relato, tom, canal, resultado, meta,
createdAt, userId }` (o `resultado` é o schema interno da IA).

D10. **`confianca`** circula 0..1 no back; o BFF converte para 0..100.

D11. **Mapeamento de integração no BFF** (seção 16): resolve os conflitos de
`sentimento`, `categoria`, `diagnostico` e `planoDeAcao` sem alterar o schema
da IA nem o prompt.

## 7. Arquitetura

```
Next.js (apps/web, Vercel)
  └─ BFF: /api/auth/*            → repassa a API (auth)
          /api/proxy/*           → repassa + ADAPTA (analyses)
                 │  HTTPS + Bearer JWT
                 ▼
NestJS (apps/back)  /api/v1
  ├─ auth      (register, login, me)          JWT + bcrypt
  ├─ users     (persistência)
  ├─ analyses  (create/list/get)              guard JWT + throttler
  ├─ ai        (TriageAgent: guardrails → prompt → Groq → Zod → repair)
  ├─ health    (/health)
  └─ common    (filtro de erro, interceptors, config validada)
                 │
                 ├─ Prisma → PostgreSQL (Neon)
                 └─ Groq SDK (GROQ_API_KEY só aqui)
prompts/triage/v1/system.md  (lido em runtime, cacheado)
packages/contracts/openapi.json  (gerado por script)
```

### Layout de arquivos (alvo)

```
repo/
├─ pnpm-workspace.yaml
├─ package.json                     # scripts: dev, build, test, contracts:export, ...
├─ prompts/triage/v1/system.md
├─ packages/contracts/
│   ├─ package.json
│   └─ openapi.json                 # gerado
├─ apps/web/                        # já existe (ajustado)
├─ apps/back/
│   ├─ src/
│   │   ├─ main.ts
│   │   ├─ app.module.ts
│   │   ├─ ai/
│   │   │   ├─ ai.module.ts
│   │   │   ├─ triage.agent.ts
│   │   │   ├─ groq.client.ts
│   │   │   ├─ prompt-loader.service.ts
│   │   │   ├─ guardrails.ts
│   │   │   └─ schemas/analysis-result.schema.ts
│   │   ├─ auth/  users/  analyses/  health/
│   │   ├─ common/
│   │   │   ├─ filters/http-exception.filter.ts
│   │   │   ├─ interceptors/request-id.interceptor.ts
│   │   │   └─ config/{env.validation.ts, configuration.ts}
│   │   └─ prisma/{prisma.module.ts, prisma.service.ts, schema.prisma}
│   ├─ test/ (e2e)
│   ├─ Dockerfile
│   └─ .env.example
├─ docker-compose.yml               # web + back + postgres (perfil opcional)
├─ .github/workflows/ci.yml
└─ docs/{api-contract.md, DEPLOY.md, DECISIONS.md}
```

## 8. Contrato HTTP (backend, /api/v1)

### Enums de entrada (iguais ao front)
- `canal`: `email | chat | ticket | reuniao | outro`
- `tom`: `formal | neutro | empatico`

### DTO de criação de análise
```
POST /api/v1/analyses        (Bearer JWT)
{ relato: string (20..8000), tom?, canal?, contextoAdicional?, urgenciaUsuario? (1..5) }
→ 201 { id, ...resultado, meta }
```

### Saída da IA (schema interno, validado por Zod)
```
resumo (≤400) | categoria (financeiro|suporte_tecnico|comercial|rh|juridico|infraestrutura|outros)
prioridade (critica|alta|media|baixa) | justificativaPrioridade
sentimento (positivo|neutro|negativo|muito_negativo)
riscos[] | acoesRecomendadas[{acao,responsavelSugerido,prazoSugerido}]
informacoesFaltantes[] | respostaSugerida | confianca (0..1) | requerRevisaoHumana
```

### Demais rotas
- `POST /api/v1/auth/register` `{nome,email,senha}` → `{user, token}`
- `POST /api/v1/auth/login` `{email,senha}` → `{user, token}`
- `GET  /api/v1/auth/me` → `{user}`
- `GET  /api/v1/analyses?q&categoria&prioridade&page&limit` → `{items,total,page,limit,totalPages}`
- `GET  /api/v1/analyses/:id` (somente do próprio usuário) → análise
- `GET  /api/v1/health` → `{status,uptime,db}`

### Formato de erro (sempre)
```
{ statusCode, code, message, requestId }
```
Códigos previstos: `VALIDATION_ERROR(400)`, `UNAUTHORIZED(401)`, `FORBIDDEN(403)`,
`NOT_FOUND(404)`, `AI_UPSTREAM_ERROR(502)`, `AI_TIMEOUT(504)`, `AI_BUSY(503)`,
`RATE_LIMITED(429)`, `INTERNAL_ERROR(500)`. Mensagens em pt-BR, sem vazar
detalhes internos.

## 9. Pipeline de IA (`ai`)

1. **Guardrails** (`guardrails.ts`): length 20..8000; mascarar CPF/CNPJ/cartão
   (`***`) para log; detectar padrões de injection ("ignore as regras", etc.) e
   marcar como risco; nunca logar texto/resposta brutos.
2. **Mensagens**: `system` = conteúdo de `prompts/triage/<PROMPT_VERSION>/system.md`;
   `user` = dados dentro de `<solicitacao>...</solicitacao>` (canal, contexto,
   tom, urgência). Conteúdo do usuário é DADO, nunca instrução.
3. **Groq** (`groq.client.ts`): `temperature=0.2`,
   `response_format: {type:"json_object"}`, `GROQ_MODEL` por env, timeout
   `GROQ_TIMEOUT_MS` (padrão 25000) via `AbortController`, 1 retry com backoff
   para 429/5xx.
4. **Validação** (`analysis-result.schema.ts`, Zod): se inválida → **um** reparo
   enviando o erro ao modelo; se falhar de novo → `AI_UPSTREAM_ERROR` (502).
5. **Retorno**: `{ resultado, meta: { modelo, latenciaMs, tokens, versaoPrompt } }`.

`prompt-loader.service.ts` lê e cacheia o prompt em memória (por versão).

## 10. Modelo de dados (Prisma)

```prisma
model User {
  id        String     @id @default(cuid())
  nome      String
  email     String     @unique
  senhaHash String
  createdAt DateTime   @default(now())
  analyses  Analysis[]
}
model Analysis {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id])
  relato              String
  resultado           Json          // saída validada da IA
  meta                Json          // modelo, latenciaMs, tokens, versaoPrompt
  categoria           String
  prioridade          String
  createdAt           DateTime @default(now())
  @@index([userId, createdAt])
  @@index([categoria])
  @@index([prioridade])
}
```

## 11. Config / env (validadas no boot — falha rápida)

`DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, GROQ_API_KEY, GROQ_MODEL,
GROQ_TIMEOUT_MS, PROMPT_VERSION, WEB_ORIGIN, PORT, NODE_ENV`.
`.env.example` entregue; `.env*` no `.gitignore`. `GROQ_MODEL` sem default
fixo no código além de um modelo Llama 70B atual da Groq (documentar).

## 12. Testes (Jest, Groq mockada)

- `groq.client` / `triage.agent`: saída válida; JSON inválido → reparo ok;
  falha após reparo; timeout → 504; 429 → 503.
- `guardrails`: limites, mascaramento, injection.
- `analyses.service`: create/list/get + isolamento por usuário.
- `auth.service`: register/login (hash, duplicado).
- e2e: register/login → POST /analyses (Groq mockada) → GET /analyses/:id.

## 13. Deployment (sem Docker local)

- **API**: Render nativo (Node) ou Dockerfile. Start `node dist/main.js`.
  Variáveis: `PORT`, `DATABASE_URL` (Neon, com `?sslmode=require&pgbouncer=true`),
  `JWT_SECRET`, `JWT_EXPIRES_IN`, `GROQ_API_KEY`, `GROQ_MODEL`,
  `GROQ_TIMEOUT_MS`, `PROMPT_VERSION`, `WEB_ORIGIN`.
  Observação: cold start no plano gratuito do Render.
- **Web**: Vercel. `API_URL=<url-da-api>/api/v1`, `NEXT_PUBLIC_USE_MOCKS=false`.
- **DB**: Neon.
- `docker-compose.yml`: web + back + postgres para uso local (perfil opcional;
  não verificável aqui por falta de Docker).

## 14. Etapas (1 commit cada; lint+testes antes de avançar)

1. Scaffold do monorepo, `prompts/`, docker-compose, git init.
2. `back`: config validada, Prisma, auth (JWT/bcrypt), health.
3. `back`: módulo `ai` (Zod, prompt loader, guardrails, Groq client, agente) + testes.
4. `back`: `analyses` + erros padronizados + rate limit + e2e.
5. OpenAPI exportado + `docs/api-contract.md`.
6. CI, Dockerfile e `docs/DEPLOY.md`.
7. README raiz + ligação web↔back (BFF adaptador) + tag `v0.1.0`.

## 15. Em aberto para o usuário

- D1 (`apps/back` vs `apps/api`): default `apps/back`.
- Modelo Groq: preciso de internet para confirmar o Llama 70B atual antes de
  fixar o default em `GROQ_MODEL`; até lá deixo o valor por env sem fixar.

## 16. Mapeamento de integração (BFF do Next ↔ back)

O back permanece fiel ao spec. O BFF traduz.

**Rota:** `/analises` → `/analises`; o BFF reescreve para `/analyses` no back.

**Request (front → back), POST /analises:**
`{ relato, tom, canal, contextoAdicional?, urgenciaUsuario? }` passa igual.

**Response (back → front), item:**
| front (`AnalysisResult`) | origem no back |
|---|---|
| `id` | `id` |
| `relato` | `relato` |
| `tom` | `tom` |
| `canal` | `canal` |
| `diagnostico` | `` `${resultado.resumo}\n\n${resultado.justificativaPrioridade}` `` |
| `categoria` | `CATEGORIA_LABEL[resultado.categoria]` (enum → rótulo pt-BR) |
| `prioridade` | `resultado.prioridade` |
| `sentimento` | `resultado.prioridade==='critica' ? 'urgente' : (resultado.sentimento==='muito_negativo' ? 'negativo' : resultado.sentimento)` |
| `confianca` | `Math.round(resultado.confianca * 100)` |
| `requerRevisaoHumana` | `resultado.requerRevisaoHumana` |
| `planoDeAcao` | `resultado.acoesRecomendadas.map((a,i)=>({ ordem:i+1, titulo:a.acao, descricao:a.acao, responsavelSugerido:a.responsavelSugerido, prazoSugerido:a.prazoSugerido }))` |
| `informacoesFaltantes` | `resultado.informacoesFaltantes` |
| `riscosIdentificados` | `resultado.riscos` |
| `respostaSugerida` | `resultado.respostaSugerida` |
| `dataCriacao` | `createdAt` |
| `usuarioId` | `userId` |

**Lista:** o back já devolve `{items,total,page,limit,totalPages}`; cada item
passa pela tabela acima.

**Filtro de categoria (front → back):** o front manda rótulo pt-BR ou `todas`.
O BFF faz o mapa inverso rótulo→enum; `todas`/desconhecido → remove o param.

**Rótulos:** `financeiro→Financeiro`, `suporte_tecnico→Suporte Técnico`,
`comercial→Comercial`, `rh→Recursos Humanos`, `juridico→Jurídico`,
`infraestrutura→Infraestrutura`, `outros→Outros`.

**Busca `q` no back:** sobre `relato`, `resultado.resumo` e `categoria`.

**Auth:** BFF chama `${API_URL}/auth/*`; `API_URL` já inclui `/api/v1`, então
`API_URL=https://<host>/api/v1`. Contrato `{user,token}` / `{user}` já bate.
```
