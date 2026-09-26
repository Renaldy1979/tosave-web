# ToSave web

Next.js (App Router, TypeScript, Tailwind v4). Um deploy serve três domínios (`src/proxy.ts`):

| Host | Conteúdo |
|---|---|
| `admin.tosave.cloud` | Painel admin (`src/app/sites/admin`) |
| `app.tosave.cloud` | App web do colecionador; por ora, página "em breve" (`src/app/sites/app`) |
| `tosave.cloud`, `www.tosave.cloud` | 308 para `https://app.tosave.cloud` |

Sem banco próprio: dados da API v2 (`backendToSave`, contrato em `docs/API-V2.md`), login e imagens pelo Appwrite (SDK web). O painel exige a label `admin` no Appwrite (`GET /v2/me` → `role`).

## Dev

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3334 com o backend local
npm run dev
```

`localhost` abre o painel. `?site=app` mostra o site do app (fica em cookie; `?site=admin` volta).

## Deploy (EasyPanel)

Serviço App a partir do `Dockerfile` (porta 3000). Os `NEXT_PUBLIC_*` entram no bundle no build; os padrões do `Dockerfile` já apontam para produção.
Domínios no serviço: `admin.tosave.cloud`, `app.tosave.cloud`, `tosave.cloud`, `www.tosave.cloud`.
