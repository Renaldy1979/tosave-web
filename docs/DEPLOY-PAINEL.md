# Deploy do painel admin (lote 1)

Ordem pensada para o app não parar em nenhum momento. Os passos marcados **[USUARIO]** exigem acesso ao DNS, ao EasyPanel ou ao túnel do banco.

## 1. Backend: migration antes do código

A `0008_admin_brands` cria a tabela `brands`. O código novo faz `LEFT JOIN brands` na lista de carros do app, então a tabela precisa existir **antes** do deploy. A migration é idempotente e pode rodar de novo sem efeito.

1. **[USUARIO]** No DBeaver, pelo túnel SSH, conectado como `postgres`, rode o conteúdo de `C:\Dev\backendToSave\src\db\migrations\0008_admin_brands.sql`.
   - Confira com `select count(*) from brands;`: devem aparecer as marcas atuais (4 no banco local).
2. **Orquestrador:** `git push origin main` no `backendToSave`. O `main` local já tem o merge da `feat/admin-lote1` (`20d1963`).
3. **[USUARIO]** No EasyPanel, faça o **Deploy** do `tosave-api-v2`, se ele não fizer sozinho. Depois, no **Console** dele:
   ```bash
   bun --bun drizzle-kit migrate
   ```
   Isso registra a 0008 no controle do Drizzle. O `CREATE TABLE` e o `INSERT` não fazem nada de novo.
4. **Teste:**
   - `https://api.tosave.cloud/health`;
   - o app abre a lista de carros normalmente.

## 2. DNS [USUARIO]

No DNS da Hostinger, com o IP da VPS `179.199.139.63` e TTL 300:

| Tipo | Nome | Situação |
|---|---|---|
| A | `admin` | já existe |
| A | `app` | criar |
| A | `@` | trocar a página padrão da Hostinger pelo IP da VPS |
| A | `www` | criar ou trocar (ou `CNAME` para `tosave.cloud`) |

## 3. Serviço do painel no EasyPanel [USUARIO]

1. Crie um serviço **App** chamado `tosave-web` no mesmo projeto:
   - fonte: `Renaldy1979/tosave-web`, branch `main`;
   - build: `Dockerfile`.
2. **Variáveis:** defina **`PORT=3000`**. Sem ela, o EasyPanel injeta `PORT=80`, o Next.js sobe na 80, o teste de saúde na 3000 falha e o container reinicia em loop (status amarelo).
   - O resto já vem do `Dockerfile`, que aponta para produção (API, Appwrite, `app.tosave.cloud` e `tosave.cloud`).
   - Os `NEXT_PUBLIC_*` entram no build. Se precisar trocar algum, use os **Build Args**.
   - **`PUBLIC_SITE_KEY`** (site institucional, lote 2): variável de **runtime** do serviço (não é `NEXT_PUBLIC_`, não entra no build). Vai no header `X-Site-Key` das chamadas do servidor a `/v2/public/*`, para isentar o site do limite por IP da API. Pedir o valor ao Alicerce (`backendToSave`).
3. **Domínios**, todos com HTTPS e porta interna **3000**:
   - `admin.tosave.cloud`;
   - `app.tosave.cloud`;
   - `tosave.cloud`;
   - `www.tosave.cloud`.
4. Faça o **Deploy**.

## 4. Appwrite [USUARIO, se preciso]

Se o login do painel der erro de CORS, cadastre `admin.tosave.cloud` no console do Appwrite em **Overview → Platforms → Add platform → Web**.

## 5. Testes

- `https://admin.tosave.cloud`: o login com a conta admin abre o painel.
- `https://tosave.cloud`: mostra o site institucional (home, vitrine).
- `https://www.tosave.cloud`: redireciona para `https://tosave.cloud`.
- `https://app.tosave.cloud`: mostra a página "em breve", com `/entrar` e `/cadastro` funcionando.

## Rollback

- **Painel:** no EasyPanel, pare o serviço `tosave-web` ou faça redeploy do build anterior. Ele não afeta o app.
- **Backend:** no EasyPanel, faça redeploy do deploy anterior do `tosave-api-v2`. A tabela `brands` pode ficar, porque o código antigo não a usa.
