# Projeto pausado — retomar na fase 2

Este é o **Projeto 02: portal web de administração + API** do ToSave.
Por decisão do usuário em 22/09/2026, ele está **pausado**. A fase atual é o **Projeto 01: app mobile**, em `..\app-mobile-tosave`.

Nada aqui deve ser alterado até a fase 2 ser aberta.

## O que já existe

- Next.js 15 (App Router, TypeScript, Tailwind v4) com dependências instaladas, incluindo `next-auth@5.0.0-beta.32`, Drizzle, better-sqlite3, React Hook Form, Zod, Lucide e sharp.
- `src/db/schema.ts` com as 8 tabelas, migração `drizzle/0000_*.sql` aplicada e o SQLite em `data/tosave.db`.
- `docs/ESPECIFICACAO.md` com os requisitos e as 11 decisões do usuário.
- `docs/design/` com design system, catálogo de componentes, 14 specs de tela e o handoff para o desenvolvedor.
- `_brand/` com a logo em versão escura e clara, silhueta e favicons.

Sem git, sem telas, sem autenticação, sem CRUD, sem seed.

## Pendências para quando retomar

1. **Tailwind:** o design system foi escrito para Tailwind v3.4, mas o projeto foi gerado com v4. O handoff explica como adaptar.
2. **Tabela `settings`:** a aba Geral de `/admin/settings` precisa de uma tabela que a especificação não define. O usuário indicou que a aba pode ficar vazia por ora.
3. **API para o app mobile:** a fase 2 precisa expor os endpoints que o app consumirá, substituindo os mocks de `src/services/` no projeto mobile.

## Reaproveitado pelo app mobile

`_brand/` e os documentos de design foram copiados para `app-mobile-tosave\docs\referencia-web\`. A paleta e a identidade são as mesmas nos dois projetos.
