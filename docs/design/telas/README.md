# Telas — Fase 1

Specs de tela do ToSave. Tokens em `../design-system.md`, componentes em `../componentes.md`, marca em `../marca.md`. Guia de implementação: `../handoff-forja.md`.

| Rota | Spec | Acesso |
|---|---|---|
| `/` | [home.md](home.md) | público |
| `/login` | [login.md](login.md) | público (logado → redireciona `/`) |
| `/register` | [register.md](register.md) | público (logado → redireciona `/`) |
| `/setup` | [setup.md](setup.md) | só enquanto não existe ADMIN |
| `/car/[id]` | [car-detalhe.md](car-detalhe.md) | público |
| `/collections` | [collections.md](collections.md) | autenticado |
| `/profile` | [perfil.md](perfil.md) | autenticado |
| `/admin` | [admin-dashboard.md](admin-dashboard.md) | ADMIN |
| `/admin/cars` · `/new` · `/[id]/edit` | [admin-carros.md](admin-carros.md) | ADMIN |
| `/admin/cars/atributes` · `/new` · `/[id]/edit` | [admin-atributos.md](admin-atributos.md) | ADMIN |
| `/admin/series` · `/new` · `/[id]/edit` | [admin-series.md](admin-series.md) | ADMIN |
| `/admin/brands` · `/new` · `/[id]/edit` | [admin-marcas.md](admin-marcas.md) | ADMIN |
| `/admin/settings` | [admin-settings.md](admin-settings.md) | ADMIN |

## Shell comum

- **Público/colecionador:** `Navbar` ink sticky no topo + `TabBar` fixa na base (< `md`). Conteúdo em `container` (1440 px). Rodapé mínimo: logo 96 px, "© ToSave", toggle de tema — `py-10 border-t border-border`, oculto no mobile quando a TabBar está visível (vai para o fim do scroll com `pb-20`).
- **Auth (`/login`, `/register`, `/setup`):** sem Navbar/TabBar. Layout split (ver login.md).
- **Admin:** `AdminShell` (sidebar `lg+`, drawer < `lg`).

## Convenções de todas as specs

- Breakpoints descritos de baixo para cima: **Base (360–639)** → `sm` → `md` → `lg` → `xl/2xl`.
- **Loading** = Skeleton com a geometria final (nunca spinner de página inteira), exceto ações de botão.
- **Erro de carregamento** (falha de servidor/rede) — padrão único, componente `ErrorState`: ícone `WifiOff`/`ServerCrash` em círculo `bg-flame-soft text-flame`, título "Não foi possível carregar.", texto "Verifique sua conexão e tente novamente.", `Button secondary` "Tentar novamente" (refaz a requisição). Em `error.tsx` do App Router.
- **404** (`not-found.tsx`): mesmo layout do EmptyState grande, título "Página não encontrada.", CTA "Voltar ao catálogo".
- **Empty states oficiais** (texto exato): "Nenhuma miniatura disponível no momento." / "Nenhum conteúdo disponível."
- Toda mutação dá feedback por Toast; toda exclusão passa por ConfirmDialog.

## Padrão de formulário admin (`/new` e `/[id]/edit`)

Vale para miniaturas, séries, marcas e atributos.
- **Header:** breadcrumb (`body-sm fg-subtle`) + `h1` ("Nova série" / nome do item na edição).
- **Corpo:** cards de seção `rounded-lg bg-surface shadow-card p-5 md:p-6`. Mídia à esquerda e dados à direita no `lg+`; empilhado abaixo disso. Formulários curtos (atributos) usam uma coluna `max-w-[640px]`.
- **Barra de ações** sticky na base (`z-sticky bg-surface/90 backdrop-blur border-t py-3`): à esquerda, "Excluir" (só na edição, `ghost text-danger`); à direita, o indicador "Alterações não salvas ●" (dot `warning`, só quando dirty) + Cancelar (secondary) + Salvar (primary). No mobile, botões `flex-1` e o Excluir vai para o fim do formulário.
- **Navegação:** Cancelar/voltar com alterações não salvas abre ConfirmDialog "Descartar alterações?". Salvar com sucesso volta para a listagem com toast.
- **Validação:** Zod + React Hook Form. No submit inválido, rola e foca o primeiro erro, e o toast diz "Revise os campos destacados."
- **Erro de servidor:** Alert `flame-soft` no topo do formulário; dados preservados.
- **Carregando (edição):** skeleton com a geometria das seções.
