# App web: lote 5 (briefing aprovado em 28/09/2026)

## Objetivo

A versão web completa do app mobile, para **membros logados**, em `app.tosave.cloud`. O visitante vê o site (`tosave.cloud`); quem se cadastra ou entra cai aqui. Mesmo design do app, com layout de verdade para o desktop.

## Como vamos fazer (decisão do usuário)

| Fase | Quem | O quê | Validação |
|---|---|---|---|
| **A: layout** | 1 agente web (Lanterna, com contexto zerado) | Todas as telas com o visual final e **dados de exemplo fixos** (exceção temporária à regra "sem mock"), celular e desktop, tema claro e escuro | Usuário no navegador |
| **B: dinâmico** | 1 agente com contexto zerado | Troca os dados de exemplo pela API v2, que já existe inteira e é a mesma do app mobile, e remove os mocks | Usuário, com a conta de colecionador |

- A fase B só começa com o visual aprovado.
- Os dados de exemplo ficam num único arquivo (`src/app/sites/app/_mock/`), para a fase B apagar de uma vez.

## Telas (espelho do app mobile)

| # | Tela | Referência no mobile |
|---|---|---|
| 1 | Início: destaques de séries, últimas notícias, resumo da coleção | `(drawer)/index.tsx` |
| 2 | Buscar: catálogo com busca e filtros (série, marca, ano, atributos) | `(drawer)/busca.tsx` |
| 3 | Séries e detalhe da série (tenho e faltam) | `(drawer)/series.tsx`, `serie/[id].tsx` |
| 4 | Minha coleção: grade, ordenar, filtros, todos e repetidos | `(drawer)/colecao.tsx` |
| 5 | Detalhe do carro: adicionar e remover da coleção, quantidade, compartilhar, anunciar | `car/[id].tsx` |
| 6 | Notícias e detalhe | `(drawer)/noticias.tsx`, `noticia/[id].tsx` |
| 7 | Notificações (caixa) | `(drawer)/notificacoes.tsx` |
| 8 | Clube da Troca: lista, detalhe (revelar contato), anunciar, meus anúncios | `(drawer)/troca.tsx`, `anuncio/*` |
| 9 | Estatísticas | `(drawer)/estatisticas.tsx` |
| 10 | Perfil: dados, telefone, tema, sair, excluir conta | `(drawer)/perfil.tsx`, `excluir-conta.tsx` |
| — | Entrar, cadastro e recuperar senha | já existem em `app.tosave.cloud`; revisar o visual |

## Layout (proposta)

- **Desktop (≥ 1024 px):**
  - menu lateral fixo com os itens do app mobile;
  - conteúdo largo: grade de 4 a 6 colunas, filtros em painel lateral, detalhe do carro em duas colunas.
- **Celular:** padrão parecido com o app, com barra inferior e menu.
- **Design:** os mesmos tokens, componentes e marca do site e do painel (`src/components/*`), reaproveitando o card de carro do site.

## Decisões do usuário (28/09/2026)

1. **Escopo: núcleo primeiro.** A versão 5a tem Início, Buscar, Coleção, Detalhe do carro, Séries (com o detalhe) e Perfil, mais a revisão visual de entrar, cadastro e recuperar senha. A versão 5b tem Notícias, Notificações, Clube da Troca e Estatísticas, no mesmo padrão visual.
2. **Navegação no celular:** barra inferior com 4 ou 5 itens mais "Mais". No desktop, menu lateral fixo.
3. **Web push:** fica para depois. A caixa de notificações (na 5b) funciona sem ele.
4. **PWA: NÃO haverá.** A web é acessada pela URL, e o app instalado vem das lojas (Android e iOS). Não criar manifest de instalação nem service worker.

## Ordem de execução

1. **Antes de acionar agentes:** zerar o contexto (`recruit --replace` no Sonnet).
2. **5a, fase A (layout):** Lanterna. O usuário valida o visual.
3. **5a, fase B (dinâmico):** um agente com contexto zerado. O usuário valida com a conta de colecionador. Deploy.
4. **5b:** repete as fases A e B para as telas restantes.
