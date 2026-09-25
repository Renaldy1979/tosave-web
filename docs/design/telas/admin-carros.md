# Admin · Miniaturas — `/admin/cars`

CRUD completo de `Cars` (todos os campos exceto id, createdAt, updatedAt) + galeria (`CarImages`) + atributos (`CarsAttributes`).

**Anti-CRUD:** a listagem tem thumbnail em toda linha, o formulário é dividido em seções nomeadas com preview ao vivo do card, e ações ficam em menu contextual — nunca uma tabela crua com links "editar/excluir".

## Rotas de UI

| URL | Conteúdo |
|---|---|
| `/admin/cars` | Listagem |
| `/admin/cars/new` | Formulário de criação |
| `/admin/cars/[id]/edit` | Formulário de edição |

> Sub-rotas aprovadas (decisão 11 da especificação). O formulário segue o **padrão de formulário admin** (telas/README.md).

---

## Listagem

```
Catálogo / Miniaturas
Miniaturas  1.240                                         [+ Nova miniatura]
[🔍 Título ou código toy     ] [Série ▾] [Marca ▾] [Ano ▾] [Imagem verificada ▾]

┌──────┬────────────────────────────┬──────────┬──────────────┬──────┬────────┬───┐
│      │ MINIATURA                  │ CÓDIGO   │ SÉRIE        │ ANO  │ IMAGEM │   │
├──────┼────────────────────────────┼──────────┼──────────────┼──────┼────────┼───┤
│ ▢    │ '71 Datsun 510 Wagon       │ HKJ42    │ HW J-Imports │ 2024 │ ● ok   │ ⋯ │
│56×42 │ Mattel · #001 · 8/10       │ mono     │ badge primary│ mono │        │   │
└──────┴────────────────────────────┴──────────┴──────────────┴──────┴────────┴───┘
1–20 de 1.240                     ‹ 1 2 3 … 62 ›                        20 por página ▾
```

- `DataTable` (componentes.md §13). Linha inteira clicável → edição. Menu `⋯`: Editar, Ver no site (`ExternalLink`), Excluir.
- Coluna "Imagem": `imagemCheck` → dot `success` "Verificada" / dot `fg-subtle` "Pendente". Filtro correspondente na barra.
- `Pagination numbered`, estado na URL.
- **Mobile (< md):** tabela vira lista de linhas-cartão: thumb 72×54 + título (2 linhas) + `toy · ano` mono + `⋯`. Busca + botão "Filtros" (BottomSheet). "Nova miniatura" vira `IconButton primary` `Plus` no header.

### Estados da listagem
| Estado | Comportamento |
|---|---|
| Carregando | 10 `TableRowSkeleton` (com rect de thumb) |
| Sem carros | `EmptyState kind="no-cars" size="lg"` → "Nenhuma miniatura disponível no momento." + `Button primary` "Cadastrar miniatura" |
| Busca sem resultado | `EmptyState kind="no-cars"` + "Limpar filtros" |
| Excluindo | ConfirmDialog "Excluir miniatura?" — "**{title}** e suas imagens serão excluídos. Ele também sairá das coleções dos usuários." → linha some com fade; toast "Miniatura excluída." |
| Erro | `ErrorState` no lugar da tabela |

---

## Formulário (criar / editar)

```
Catálogo / Miniaturas / Nova
Nova miniatura                                         ← h1 (edição: título do carro)

┌ FORMULÁRIO (lg:col-span-8) ──────────────────────┐ ┌ PREVIEW (lg:col-span-4, sticky) ┐
│ 1  IMAGENS                                        │ │  Pré-visualização                │
│    Imagem principal *    [ ImageUpload 4:3 ]      │ │  ┌─────────────────────┐        │
│    ⓘ A miniatura (thumb) é gerada automaticamente │ │  │  CarCard catalog    │        │
│    Galeria               [▢][▢][▢][ + ]  arrastar │ │  │  ao vivo            │        │
│    ☐ Imagem verificada (imagemCheck)   Switch     │ │  └─────────────────────┘        │
│                                                   │ │  Campos obrigatórios: 4 de 5 ✓  │
│ 2  IDENTIFICAÇÃO                                  │ └─────────────────────────────────┘
│    Título *              [                      ] │
│    Marca *  [Combobox ▾]     Série * [Combobox ▾] │
│    Nº coleção [#001 mono]    Posição [8/10 mono]  │
│    Código toy [HKJ42 mono]   Ano [2024]            │
│                                                   │
│ 3  DETALHES                                       │
│    Escala [1/64 mono]        Cor [● ColorInput  ] │
│    Descrição             [ Textarea             ] │
│    Atributos             [ Combobox multi ▾     ] │
│                                                   │
│ 4  CARGA EM LOTE (colapsado por padrão)           │
│    URL original da imagem [ texto              ]  │
│    ⓘ Usado apenas no processo manual de carga.    │
└───────────────────────────────────────────────────┘
┌ BARRA DE AÇÕES sticky bottom ──────────────────────────────────────────────────┐
│  Alterações não salvas ●            [ Cancelar ]  [ Salvar miniatura ]           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Regras visuais
- Cada seção é um card `rounded-lg bg-surface shadow-card p-5 md:p-6` com cabeçalho: número em quadrado 28 px `bg-primary-soft text-primary-text font-mono` + título `h3` + descrição `body-sm fg-subtle`.
- Campos em grid `grid-cols-1 sm:grid-cols-2 gap-4`; Título, Descrição, Atributos e uploads ocupam 2 colunas.
- **Uploads** obrigatoriamente reais (ImageUpload/GalleryUpload). Nenhum campo de URL para imagem. Única exceção: `imagemURLOriginal`, texto simples, na seção 4 "Carga em lote", colapsada (`Accordion`) com nota explicativa.
- Marca e Série: Combobox com busca; rodapé do popover com link "+ Cadastrar nova marca/série" (abre em nova aba para não perder o formulário).
- Campos `collector`, `seriePosition`, `toy`, `scale`: `MonoInput` (preservam zeros à esquerda). `year`: input numérico de 4 dígitos (`inputMode="numeric"`).
- `color`: `ColorInput` (texto ou hex).
- **Miniatura (thumb):** **não há campo.** O Backend gera `imagemThumb` redimensionando a imagem principal no upload (decisão 10). Abaixo do upload principal aparece `caption fg-subtle` com ícone `Info`: "A miniatura para os cards é gerada automaticamente." Na edição, o preview mostra a thumb real gerada.
- **Preview ao vivo:** CarCard real renderizado com os valores atuais (esconde-se abaixo de `lg`; no mobile vira botão "Pré-visualizar" que abre BottomSheet).
- **Barra de ações** sticky na base (`z-sticky bg-surface/90 backdrop-blur border-t`): indicador "Alterações não salvas" (dot `warning`) quando dirty; Cancelar (secondary) + Salvar (primary). Na edição, "Excluir" (`ghost` com texto `text-danger`) à esquerda.
- Sair com alterações não salvas → ConfirmDialog "Descartar alterações?".

### Campos obrigatórios
A obrigatoriedade final é do schema Zod do Backend. Visualmente: `*` em `text-flame` após o label; hint "* obrigatório" no topo do formulário.

### Estados do formulário
| Estado | Comportamento |
|---|---|
| Carregando (edição) | skeleton das 4 seções + preview |
| Enviando imagem | ImageUpload com barra de progresso `bg-flame`; botão Salvar desabilitado até concluir |
| Erro de upload | tile com borda `danger` e mensagem ("Formato não suportado. Use JPG, PNG ou WebP." / "Arquivo muito grande.") + "Tentar de novo" |
| Erros de validação | ao salvar: rola até o primeiro campo inválido, foca nele, e toast "Revise os campos destacados." Cabeçalho da seção com erro ganha dot `danger` |
| Salvando | botão loading "Salvando…"; campos disabled |
| Sucesso | criar → redireciona para a listagem com toast "Miniatura cadastrada." + ação "Ver no site"; editar → permanece, toast "Alterações salvas." |
| Combobox sem opções (sem marcas/séries) | "Nenhum conteúdo disponível." + link para cadastrar |
| Erro de servidor | Alert `flame-soft` no topo do formulário, dados preservados |

### Mobile
Seções empilhadas full-width; preview em BottomSheet; barra de ações fixa com botões `flex-1`; uploads em `aspect-card` full-width; galeria em grid 3 colunas.
