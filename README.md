# OpsPilot

Cockpit operacional com triagem inteligente de relatos de suporte. O usuário descreve um
relato (texto, tom e canal) e a IA classifica categoria/prioridade, aponta riscos
estruturados, sugere ações, lista informações faltantes e redige uma resposta pronta —
tudo persistido por usuário.

## Arquitetura

```
Navegador ──▶ Web (Next.js / BFF) ──▶ API (NestJS) ──▶ Postgres
                     │                      │
                     │                      └──▶ Groq (LLM)
                     └── cookies httpOnly (auth_token)
```

O navegador fala **apenas com o Web**. O Next atua como BFF:

- `/api/auth/*` → login/cadastro/logout, login com Google e sessão (cookie `auth_token`).
- `/api/proxy/*` → encaminha as chamadas de análise para a API, injetando o Bearer token.

A API é um serviço NestJS separado, com prefixo global `/api/v1`, Swagger em `/docs`, JWT,
rate limit e o agente de IA (Groq) isolado em `src/ai`.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Web | Next.js 16 (App Router), React 19, Tailwind v4, TanStack Query, Zod, Vitest |
| API | NestJS 11, Prisma 6, PostgreSQL, Passport/JWT, class-validator, Pino, Jest |
| IA | Groq SDK (`openai/gpt-oss-120b` por padrão), prompts versionados |
| Infra | pnpm workspaces, Docker (só Postgres local), Render (deploy) |

## Estrutura

```
apps/
  api/                 # Backend NestJS + Prisma + agente de IA
    prisma/            # schema.prisma, migrations/
    src/ai/            # cliente Groq, agente de triagem, guardrails, schema do resultado
    src/auth/          # register/login/google/me, JWT, throttling
    src/analyses/      # CRUD de análises (protegido por JWT)
    test/              # e2e (Jest + supertest)
  web/                 # Front-end Next.js (BFF + UI)
    src/app/api/       # rotas BFF: auth, proxy
    src/app/(app)/     # telas autenticadas (analises, historico, relatorios, configuracoes)
    src/app/(auth)/    # login
    src/lib/           # schemas, adapters, acesso à API
prompts/triage/v1/     # system prompt versionado (PROMPT_VERSION=v1)
render.yaml            # blueprint de deploy (API + Web + Postgres)
docs/DEPLOY.md         # passo a passo de deploy no Render
```

## Pré-requisitos

- Node **24.x** (ver `engines` na raiz)
- pnpm **12.x** (`packageManager` na raiz; `corepack enable` ou `npm i -g pnpm`)
- Docker (opcional) para subir um Postgres local
- Chave da [Groq](https://console.groq.com/keys) para usar a IA real
- (Opcional) OAuth Client do Google para o login social

## Rodando localmente

```bash
pnpm install

# 1) Banco
docker compose up -d postgres        # Postgres em localhost:5432 (opspilot/opspilot)

# 2) API
cp apps/api/.env.example apps/api/.env   # preencha GROQ_API_KEY (e Google, se quiser)
pnpm --filter @opspilot/api exec prisma migrate deploy
pnpm dev:api                          # http://localhost:3001/api/v1  (Swagger em /docs)

# 3) Web
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web                          # http://localhost:3000
```

Para usar a UI **sem backend**, deixe `NEXT_PUBLIC_USE_MOCKS=true` em `apps/web/.env.local`
(dados e autenticação simulados). Com `false`, o Web conversa com a API via `API_URL`.

## Variáveis de ambiente

### API — `apps/api/.env`

| Variável | Descrição |
| --- | --- |
| `NODE_ENV` | `development` / `production` |
| `PORT` | Porta HTTP (default `3001`) |
| `DATABASE_URL` | Conexão PostgreSQL |
| `JWT_SECRET` | Segredo do JWT (32+ caracteres) |
| `JWT_EXPIRES_IN` | Validade do token (ex.: `7d`) |
| `GROQ_API_KEY` | Chave da Groq |
| `GROQ_MODEL` | Modelo (default `openai/gpt-oss-120b`) |
| `GROQ_TIMEOUT_MS` | Timeout da chamada de IA (default `25000`) |
| `PROMPT_VERSION` | Versão do prompt em `prompts/triage/` (default `v1`) |
| `WEB_ORIGIN` | Origem(ns) liberada(s) no CORS (ex.: `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | (Opcional) client ID do Google OAuth |
| `GOOGLE_CLIENT_SECRET` | (Opcional) client secret do Google OAuth |

### Web — `apps/web/.env.local`

| Variável | Descrição |
| --- | --- |
| `API_URL` | URL base da API, **com** `/api/v1` (server-only) |
| `NEXT_PUBLIC_USE_MOCKS` | `true` para modo mock; `false` para usar a API |
| `GOOGLE_CLIENT_ID` | (Opcional) client ID usado pelo BFF para iniciar o login Google |

## Autenticação

Dois métodos, ambos emitindo um JWT da API guardado no cookie httpOnly `auth_token`:

- **E-mail e senha** — `POST /auth/register` e `POST /auth/login` (bcrypt).
- **Google (OAuth 2.0)** — qualquer conta Google. Na primeira vez o usuário é criado
  automaticamente; se já existir uma conta criada por senha com o mesmo e-mail, o login
  por Google é recusado (use a senha).

### Configurar o login com Google

1. Em [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services →
   Credentials → Create Credentials → OAuth client ID → Web application**.
2. Adicione as **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Produção: `https://<seu-web>.onrender.com/api/auth/google/callback`
3. Preencha `GOOGLE_CLIENT_ID` (API e Web) e `GOOGLE_CLIENT_SECRET` (somente API).

Fluxo: Web `/api/auth/google` monta a URL com `state` → Google → Web
`/api/auth/google/callback` envia o `code` para a API (`POST /auth/google`), que troca
pelo token, valida `email_verified`, faz upsert do usuário e devolve o JWT. O segredo fica
**apenas** na API.

## Endpoints principais

API (`/api/v1`, detalhes no Swagger `/docs`):

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Status da API e do banco |
| `POST` | `/auth/register` | Cria conta (e-mail + senha) |
| `POST` | `/auth/login` | Login com e-mail + senha |
| `POST` | `/auth/google` | Troca o `code` do Google por um JWT |
| `GET` | `/auth/me` | Usuário autenticado |
| `POST` | `/analyses` | Cria e analisa um relato (IA) |
| `GET` | `/analyses` | Lista as análises do usuário |
| `GET` | `/analyses/:id` | Obtém uma análise do usuário |

Todas as rotas de análise exigem JWT e têm rate limit por usuário.

## Scripts (raiz)

```bash
pnpm dev:api          # API em watch (Nest)
pnpm dev:web          # Web em dev (Next)
pnpm build            # build de todos os pacotes
pnpm typecheck        # tsc --noEmit em todos
pnpm test             # testes de todos (Jest na API, Vitest no Web)
pnpm lint             # eslint/next lint
pnpm --filter @opspilot/api test:e2e        # e2e da API
pnpm --filter @opspilot/api prisma:generate # regenerar o Prisma Client
```

> Observação: `pnpm lint` no pacote Web usa `next lint`, removido no Next 16 — o comando
> pode falhar até configurarmos ESLint explicitamente no `apps/web`. API e testes não são
> afetados.

## Deploy

Via **Render** usando o blueprint `render.yaml` (API + Web + Postgres). O passo a passo,
variáveis e observações (cold start do plano free, expiração do Postgres) estão em
[`docs/DEPLOY.md`](docs/DEPLOY.md).
