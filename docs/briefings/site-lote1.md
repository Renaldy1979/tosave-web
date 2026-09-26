# Site institucional: lote 1 (26/09/2026)

## Visão do usuário: quatro frentes

| Frente | Domínio | Público | Papel |
|---|---|---|---|
| **site** | `tosave.cloud` | visitante sem login (guest) | vitrine e captação para a comunidade |
| **app** | `app.tosave.cloud` | membro logado | versão web completa do app mobile (lote futuro) |
| **adm** | `admin.tosave.cloud` | admin | painel (já em produção) |
| **mobile** | iOS e Android | membro logado | já existe |

O guest vê uma **amostra curada** da comunidade: os principais carrinhos, com detalhe, busca e o "resto do site". Para ver a lista completa e usar tudo (coleção, etc.), ele se cadastra. O site precisa ser **incrível** e converter o guest em colecionador.

## Decisões

- **Um projeto só.** Site, app e admin ficam no `tosave-web`, separados por domínio no `src/proxy.ts`.
  - `tosave.cloud` **deixa de redirecionar** para `app.` e passa a servir o site.
  - `www.tosave.cloud` redireciona para `tosave.cloud`.
- **Vitrine com curadoria manual:** um flag `showcase` no carro, ligado pelo admin no painel.
- **A busca e os filtros do site valem só sobre os carros da vitrine**, com um aviso do tipo "a comunidade tem X mil miniaturas, cadastre-se para ver todas".
- **SEO:**
  - as páginas públicas são renderizadas no servidor, com `metadata`, Open Graph e `sitemap.xml`;
  - o detalhe do carro tem URL própria e amigável, por exemplo `/carros/<id>-<slug-do-nome>`.
- **Cadastro e login ficam no `app.tosave.cloud`** (`/cadastro` e `/entrar`), pelo Appwrite.
  - Os botões do site levam para lá.
  - Enquanto o app web não existe, quem se cadastra cai numa página de boas-vindas com os links para baixar o app e o aviso "versão web em breve".
  - Motivo: a sessão do Appwrite fica no domínio do Appwrite, e manter o login num só lugar evita problemas de cookie entre domínios.
- **Imagens:** os arquivos do Storage já são públicos (URL de preview com `project=`), então nada muda.

## Backend (Alicerce), no `backendToSave`

- **Migration 0010**, aditiva e idempotente: `cars.showcase boolean NOT NULL DEFAULT false`, com índice.
- **Admin:**
  - o `PUT /admin/cars/:id` aceita `showcase`;
  - o `GET /admin/cars` aceita o filtro `showcase`;
  - opcionalmente, uma rota para ligar e desligar a vitrine de vários carros de uma vez.
- **Rotas públicas, sem login**, em `/v2/public/*`:
  - `GET /v2/public/showcase`: lista paginada e busca, com os mesmos filtros do catálogo, **só carros com `showcase = true`**;
  - `GET /v2/public/cars/:id`: detalhe, com 404 se o carro não estiver na vitrine;
  - `GET /v2/public/stats`: os números da comunidade para o site (total de miniaturas, séries, membros e coleções);
  - `GET /v2/public/series`: as séries em destaque, com logo, para a seção da home, se for útil.
- **Segurança:**
  - só leitura, sem dados de usuários;
  - limite de requisições por IP;
  - `Cache-Control` público curto (60 a 300 s).
  - Nenhuma rota pública pode devolver um carro fora da vitrine.
- **Deploy:** o SQL da 0010 roda no DBeaver ANTES do código, como nos lotes do painel.

## Web (Lanterna), no `tosave-web`

- **Site em `tosave.cloud`:**
  - **home:** hero com a marca; como funciona; números da comunidade; destaques da vitrine; séries; chamada para o cadastro; rodapé com os links do app e a política de privacidade;
  - **`/vitrine`:** grade com busca e filtros, só sobre a vitrine, e o banner de cadastro;
  - **`/carros/[id]-[slug]`:** detalhe no padrão visual do app, com a chamada "adicione à sua coleção", que leva ao cadastro.
- **No `app.tosave.cloud`:** `/entrar`, `/cadastro` e `/boas-vindas`.
- **Painel:**
  - ligar e desligar "Vitrine" no formulário e na lista de carros, inclusive em lote se o backend oferecer;
  - filtro "na vitrine".
- **Design:** o mesmo design system e a mesma marca, ou seja, os tokens, o `_brand/` e o `docs/design/`. O site pode ser mais expressivo que o app, sem sair da identidade.
  - O celular é prioridade, e o desktop deve aproveitar a largura.
  - Tema claro e escuro.
- **Appwrite:** o usuário vai cadastrar a plataforma Web `tosave.cloud`.
