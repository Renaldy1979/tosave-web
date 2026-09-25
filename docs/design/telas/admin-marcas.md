# Admin · Marcas — `/admin/brands`

CRUD de `Brands`: name, state, image, active.

**Decisão (dois campos independentes):**
- `state` = **situação da marca**, um enum: `ativa` · `descontinuada` · `em análise`. É informação editorial.
- `active` (boolean) = **visibilidade no site**. Controla só se a marca aparece no catálogo público (filtros, detalhe).

Para não confundir, a UI **nunca** usa a palavra "ativa" para o booleano: ele é sempre **"Visível no site"**.

| `state` | Badge | Label |
|---|---|---|
| `ativa` | `success` + dot | Ativa |
| `descontinuada` | `neutral` + ícone `Archive` | Descontinuada |
| `em análise` | `warning` tonal (`bg-accent-soft text-accent`) + ícone `Clock` | Em análise |

| `active` | Indicador |
|---|---|
| `true` | ícone `Eye` `text-fg-muted` "Visível" |
| `false` | ícone `EyeOff` `text-fg-subtle` "Oculta", e o tile fica `opacity-60` |

## Rotas

| URL | Conteúdo |
|---|---|
| `/admin/brands` | Listagem |
| `/admin/brands/new` | Criar |
| `/admin/brands/[id]/edit` | Editar |

## Listagem

Marcas são poucas e visuais (logos), então a listagem é um **grid de tiles compactos**.

```
Catálogo / Marcas
Marcas  12                                                      [+ Nova marca]
[🔍 Buscar marca ]  Situação: [Todas ▾]   Visibilidade: [Todas | Visíveis | Ocultas]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   [ LOGO ]   │ │   [ LOGO ]   │ │   [ LOGO ]   │ │   [ LOGO ]   │
│  1:1 contain │ │              │ │              │ │ (opacity-60) │
│ Mattel     ⋯ │ │ Matchbox   ⋯ │ │ Tomica     ⋯ │ │ Maisto     ⋯ │
│ [● Ativa]  👁 │ │ [● Ativa]  👁 │ │[⏱ Em análise]👁│ │[▣ Descont.] ⊘ │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

- Grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4`.
- **BrandTile:** `rounded-lg bg-surface shadow-card p-4`. Logo `aspect-square object-contain p-4 bg-surface-2 rounded-md` (sem logo: iniciais em `font-display` 28 px `text-fg-subtle`). Nome `body font-semibold`, Badge de situação e ícone de visibilidade na última linha.
- Menu `⋯`: Editar, Mostrar no site / Ocultar do site (toggle otimista, toast com "Desfazer"), Excluir.
- Clique no tile → edição.

## Formulário (`/new` e `/[id]/edit`)

Padrão de formulário admin (telas/README.md).

```
Catálogo / Marcas / Nova
Nova marca

┌ LOGO (lg:col-span-4) ─┐ ┌ DADOS (lg:col-span-8) ───────────────────────────┐
│  ImageUpload 1:1      │ │ Nome *      [                                  ] │
│  (object-contain)     │ │                                                  │
│                       │ │ Situação *  ( ● Ativa | Descontinuada | Em análise )│ ← segmented control
└───────────────────────┘ │                                                  │
                          │ ┌──────────────────────────────────────────────┐ │
                          │ │ 👁 Visível no site                  [Switch] │ │
                          │ │ Marcas ocultas não aparecem no catálogo      │ │
                          │ │ público. A situação não muda.                │ │
                          │ └──────────────────────────────────────────────┘ │
                          └──────────────────────────────────────────────────┘
[ Excluir ]                                          [ Cancelar ] [ Salvar marca ]
```
- Situação como **segmented control** (3 opções visíveis). No mobile vira `Select` nativo.
- Na edição: seção "Miniaturas desta marca" com contagem + link "Ver miniaturas" (→ `/admin/cars?brand={id}`).

## Estados
| Estado | Comportamento |
|---|---|
| Carregando | 10 tiles skeleton |
| Sem marcas | `EmptyState kind="no-content" size="lg"` → "Nenhum conteúdo disponível." + "Cadastrar marca" |
| Filtro sem resultado | `EmptyState kind="no-content" size="sm"` + "Limpar filtros" |
| Ocultar/mostrar | otimista, toast "Marca oculta do site." com "Desfazer" |
| Excluir | ConfirmDialog "Excluir marca?" com contagem de miniaturas vinculadas, igual a Séries |
| Salvar | toast "Marca salva." → volta para a listagem |
