# Minha coleção — `/collections`

**Objetivo:** o "cofre" do colecionador. Deve dar orgulho de mostrar: números grandes, imagens dominantes, controle rápido de quantidade. Somente autenticado — deslogado é redirecionado para `/login?callbackUrl=/collections` com banner "Entre para acessar sua coleção."

## Estrutura

```
Navbar
┌ HEADER DA COLEÇÃO (surface, border-b) ──────────────────────────────────┐
│  MINHA COLEÇÃO                                    ← eyebrow primary-text │
│  Garagem de {primeiro nome}                       ← h1 font-display      │
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │   128    │ │   112    │ │    16    │ │    9     │   ← números         │
│  │ unidades │ │ modelos  │ │repetidos │ │ séries   │     font-display   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     italic          │
└──────────────────────────────────────────────────────────────────────────┘
FilterBar: [🔍 Buscar na coleção] [Série] [Marca] [Ano] [Atributos] [○ Apenas repetidos]
Grid de CarCard variant="collection"
Pagination load-more
```

### Header
- Título: "Garagem de {primeiro nome}" (`h1`, `font-display`).
- **Stats** (calculados do banco): unidades = soma de `quantity`; modelos = nº de registros; repetidos = registros com `quantity > 1`; séries = séries distintas. Mini-cards `rounded-lg bg-surface-2 p-4`, número `text-display-lg font-display italic` (o de "repetidos" em `text-flame`), label `caption uppercase tracking-wide fg-subtle`. Clicar em "repetidos" ativa o filtro.
- Mobile: stats em scroll horizontal `snap-x` (cards de 140 px) ou grid 2×2 — **usar grid 2×2** (evita conteúdo escondido).

### FilterBar
Igual à home + **Switch "Apenas repetidos"** (quantity > 1, exigência da especificação). No mobile, o switch fica também visível fora do sheet, como chip toggle ao lado do botão Filtros (é o filtro mais usado nesta tela).

### Grid
- Mesmas colunas da home.
- `CarCard variant="collection"`: QuantityStepper glass no canto superior direito; Badge `flame` "Repetido ×N" quando `quantity > 1`.
- Diminuir de 1 → 0 abre ConfirmDialog: "Remover da coleção?" / "**{title}** será removido da sua coleção." / Cancelar · Remover. Após remover, o card sai com fade + collapse (200 ms) e toast com ação **"Desfazer"** (5 s).

## Estados

| Estado | Comportamento |
|---|---|
| Carregando | header com stats skeleton (4 rects) + `CarGridSkeleton` |
| **Coleção vazia** | Stats ocultos; FilterBar oculta; `EmptyState kind="no-content" size="lg"` → **"Nenhum conteúdo disponível."**, description "Explore o catálogo e toque no ♥ para começar sua coleção.", `Button primary` "Explorar catálogo" → `/` |
| Filtro sem resultado | `EmptyState kind="no-content"` + "Nenhuma miniatura da sua coleção corresponde a esses filtros." + "Limpar filtros" |
| Atualizando quantidade | otimista; erro → reverte + toast "Não foi possível atualizar sua coleção." |
| Erro de rede | `ErrorState` no lugar do grid |

## Mobile
- Header compacto: título `h1` 1.5rem, stats 2×2 com números `2rem`.
- FilterBar sticky com busca + Filtros + chip "Repetidos".
- TabBar com "Coleção" ativo.
