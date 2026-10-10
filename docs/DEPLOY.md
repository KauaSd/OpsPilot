# Deploy — OpsPilot

Arquitetura de deploy:

- **API (NestJS + Groq)** → [Render](https://render.com) via `render.yaml` (Web Service Node + Postgres gerenciado).
- **Web (Next.js)** → [Vercel](https://vercel.com).
- **Banco** → Render Postgres (criado pelo blueprint).

O navegador fala apenas com o Vercel (BFF em `/api/proxy` e `/api/auth`). O BFF chama a API
server-side (server-to-server), então o CORS da API não é exercitado pelo navegador.

## 1. API no Render (Blueprint)

1. Render Dashboard → **New → Blueprint** → selecione o repositório `KauaSd/OpsPilot`.
2. O Render lê `render.yaml` e provisiona:
   - `opspilot-db` (Postgres free)
   - `opspilot-api` (Web Service Node)
3. Preencha as variáveis marcadas `sync: false`:
   - `GROQ_API_KEY` — chave da Groq (`https://console.groq.com/keys`).
   - `WEB_ORIGIN` — URL final do Vercel (ex.: `https://opspilot.vercel.app`). Pode preencher depois.
4. Apply. O build roda `pnpm install && prisma generate && nest build`; o start roda
   `prisma migrate deploy && node apps/api/dist/main.js`.
5. Health check: `https://<api>/api/v1/health` deve responder `status: "ok"`.
6. Swagger: `https://<api>/docs`.

Variáveis (definidas em `render.yaml`): `NODE_ENV`, `DATABASE_URL` (do banco), `JWT_SECRET`
(gerado), `JWT_EXPIRES_IN`, `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_TIMEOUT_MS`, `PROMPT_VERSION`,
`WEB_ORIGIN`.

> Observação: o Postgres free do Render expira em 30 dias. Para produção, troque para um plano pago
> ou use Neon e ajuste `DATABASE_URL`.

## 2. Web no Vercel

1. Vercel → **Add New → Project** → importe `KauaSd/OpsPilot`.
2. Configure **Root Directory = `apps/web`** (Framework: Next.js, detectado automaticamente).
3. Environment Variables:
   - `API_URL` = `https://<api-do-render>/api/v1` (inclui o prefixo da API, **sem** barra final).
   - `NEXT_PUBLIC_USE_MOCKS` = `false`.
4. Deploy. Depois copie a URL do Vercel e coloque em `WEB_ORIGIN` na API (Render) e redeploy.

## Rodando localmente

```bash
pnpm install
# API
docker compose up -d db        # ou aponte DATABASE_URL para um Postgres local
pnpm --filter @opspilot/api exec prisma migrate deploy
pnpm dev:api                   # http://localhost:3001/api/v1 (Swagger em /docs)
# Web
cp apps/web/.env.example apps/web/.env.local   # API_URL=http://localhost:3001/api/v1
pnpm dev:web                   # http://localhost:3000
```

Para usar a UI sem backend, defina `NEXT_PUBLIC_USE_MOCKS=true` no `apps/web/.env.local`.
