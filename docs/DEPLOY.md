# Deploy — OpsPilot

Deploy **em uma única plataforma**: [Render](https://render.com).

- **API (NestJS + Groq)** → Web Service Node (processo persistente, ideal para chamadas de IA de até 25s).
- **Web (Next.js)** → Web Service Node (`next start`).
- **Banco** → Render Postgres (criado pelo blueprint).

O navegador fala apenas com o Web (BFF em `/api/proxy` e `/api/auth`); o BFF chama a API
server-side. O `API_URL` do Web é injetado automaticamente pelo blueprint via `fromService`.

## Passo a passo (Blueprint)

1. Render Dashboard → **New → Blueprint** → conecte o repositório `KauaSd/OpsPilot`.
2. O Render lê `render.yaml` e provisiona:
   - `opspilot-db` (Postgres free)
   - `opspilot-api` (Web Service)
   - `opspilot-web` (Web Service)
3. Preencha as variáveis `sync: false` quando solicitado:
   - `GROQ_API_KEY` (API) — chave da Groq em https://console.groq.com/keys
   - `WEB_ORIGIN` (API) — URL do serviço **opspilot-web** (ex.: `https://opspilot-web.onrender.com`).
     Pode preencher depois do primeiro deploy, quando a URL existir.
4. **Apply**. O Render cria tudo e faz o primeiro deploy.
5. Verificações:
   - API: `https://opspilot-api.onrender.com/api/v1/health` → `status: "ok"`.
   - Swagger: `https://opspilot-api.onrender.com/docs`.
   - Web: `https://opspilot-web.onrender.com` (login/cadastro funcionando contra a API real).
6. Se o `WEB_ORIGIN` foi preenchido depois, faça **Manual Deploy** da API para aplicar.

### Como o build/start roda

- API: build `pnpm install && prisma generate && nest build`; start `prisma migrate deploy && node apps/api/dist/main.js`.
- Web: build `pnpm install && next build`; start `next start` (usa a porta `PORT` do Render).

### Variáveis

Definidas em `render.yaml`:
`NODE_ENV`, `DATABASE_URL` (do banco), `JWT_SECRET` (gerado), `JWT_EXPIRES_IN`, `GROQ_API_KEY`,
`GROQ_MODEL`, `GROQ_TIMEOUT_MS`, `PROMPT_VERSION`, `WEB_ORIGIN` (API);
`NEXT_PUBLIC_USE_MOCKS=false`, `API_URL` (do serviço da API) (Web).

> Observações:
> - Serviços free do Render hibernam após ~15 min ociosos (cold start de ~30s).
> - O Postgres free expira em 30 dias. Para produção, use plano pago ou Neon e ajuste `DATABASE_URL`.
> - `llama-3.3-70b-versatile` foi descontinuado pela Groq em 2026-08-16; o default agora é
>   `openai/gpt-oss-120b`. Dá para trocar sem tocar no código ajustando `GROQ_MODEL`.

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
