# Painel admin: lote 1 (25/09/2026)

Este briefing SUBSTITUI o `PAUSADO.md` e as partes de backend da `docs/ESPECIFICACAO.md`. Em caso de conflito, vale o que está aqui.

## Decisões do usuário

- **Front web separado do app mobile**, em Next.js (App Router, TypeScript, Tailwind), neste projeto `C:\Dev\tosave-web`, com o **mesmo design** do app (mesma marca, paleta, tipografia e tokens).
- **Domínios:**
  - `admin.tosave.cloud`: o painel admin (este lote);
  - `app.tosave.cloud`: a versão web do app, para colecionadores (lote futuro, no mesmo projeto);
  - `tosave.cloud`: por ora, redireciona para `app.tosave.cloud`.
- **Layout responsivo:** no celular, parecido com o app; no desktop, aproveita a largura, com menu lateral, tabelas e painéis.
- **Deploy:** um serviço App no EasyPanel da VPS, a partir do `Dockerfile`, igual ao backend.

## Arquitetura (v2, já em produção)

- **Sem banco próprio.** O SQLite, o Drizzle, o NextAuth e o bcrypt do esqueleto saem.
- **Dados:** a API do backend em `https://api.tosave.cloud` (repositório `C:\Dev\backendToSave`, contrato em `docs/API-V2.md`). As rotas `/admin/*` exigem a label `admin` no Appwrite.
- **Login e imagens:** pelo Appwrite (`https://tosave-appwrite.8m5sgi.easypanel.host/v1`, projeto `6aa1d3ab0039a9a9a8c4`), com o SDK web.
  - A sessão é do Appwrite. Para chamar a API, use `account.createJWT()` e mande `Authorization: Bearer <jwt>`. O JWT vale 15 minutos; renove antes de expirar.
  - Quem não for admin (`GET /v2/me` → `role`) vê "acesso negado".
- **Referência de uso:** o app mobile em `C:\Dev\tosave-mobile` já faz tudo isso. Veja `src/services/_http.ts`, `src/services/_appwrite.ts` e `src/services/auth.ts`.
- **Design:**
  - `docs/design/`: design system, componentes e specs de tela;
  - `_brand/`: a marca.
  - Os tokens precisam bater com os do app (`C:\Dev\tosave-mobile\tailwind.config.js` e `global.css`).

## Escopo do lote 1

1. **Base:**
   - limpar o esqueleto;
   - login pelo Appwrite com proteção de rota por admin;
   - layout do painel com menu lateral no desktop e menu recolhível no celular;
   - tema claro e escuro;
   - `Dockerfile`.
2. **Carros:** lista paginada com busca e filtros, criação, edição e troca de imagem.
3. **Séries, marcas e atributos:** CRUD, incluindo o logo da série e o destaque da Home (`is_default`).
4. **Usuários:** lista, bloquear e desbloquear, dar e tirar admin.
5. **Configurações:** edição do `app_config`.

Fica para depois: os parceiros com aprovação (ver a especificação do mobile, seção "Portal web") e o app web para colecionadores.

## Divisão

- **Alicerce (backend):** amplia as rotas `/admin/*` no `backendToSave` e documenta no `docs/API-V2.md`.
- **Dev web:** este projeto. Comece pela base, que não depende das rotas novas, e siga o contrato à medida que o Alicerce publicar.
