# Admin · Séries — `/admin/series`

CRUD de `Series`: nome (`title`), descrição, imagem, destaque (`isDefault`).
**Decisão:** `isDefault` **não é exclusivo**, então várias séries podem ser destaque ao mesmo tempo na home.

**Anti-CRUD:** séries são coleções visuais, então a listagem é um **grid de cards com imagem**, não uma tabela.

## Rotas

| URL | Conteúdo |
|---|---|
| `/admin/series` | Listagem |
| `/admin/series/new` | Criar |
| `/admin/series/[id]/edit` | Editar |

## Listagem

```
Catálogo / Séries
Séries  38                              [Todas | Em destaque (3)]   [+ Nova série]
[🔍 Buscar série                ]

┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ 🔥 Em destaque    │ │ 🔥 Em destaque    │ │                   │
│   [ IMAGEM 16:9 ] │ │   [ IMAGEM 16:9 ] │ │   [ IMAGEM 16:9 ] │
│                   │ │                   │ │                   │
│ HW J-Imports    ⋯ │ │ Car Culture     ⋯ │ │ Mainline 2024   ⋯ │
│ 42 miniaturas     │ │ 18 miniaturas     │ │ 250 miniaturas    │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.
- **SeriesCard:** imagem `aspect-video bg-card-stage` com gradiente escuro na base; título `h3`; contagem de miniaturas `body-sm fg-subtle font-mono`; menu `⋯`: Editar, **Adicionar aos destaques / Remover dos destaques** (toggle otimista), Excluir.
- Séries em destaque aparecem **primeiro**, com Badge `flame` "Em destaque" sobre a imagem e `ring-1 ring-primary/50`.
- Filtro segmentado "Todas | Em destaque (N)".
- Sem imagem: palco com ícone `Layers` 40 px.
- Clique no card → `/admin/series/[id]/edit`.
- Paginação `numbered` se > 24.

## Formulário (`/new` e `/[id]/edit`)

Segue o **padrão de formulário admin** (telas/README.md): página própria, seções em card, barra de ações sticky.

```
Catálogo / Séries / Nova
Nova série

┌ IMAGEM (lg:col-span-5) ───────┐ ┌ DADOS (lg:col-span-7) ──────────────────────┐
│                               │ │ Nome *        [                           ] │
│   ImageUpload 16:9            │ │ Descrição     [ Textarea                  ] │
│                               │ │                                             │
└───────────────────────────────┘ │ ┌─────────────────────────────────────────┐ │
                                  │ │ 🔥 Destacar na página inicial  [Switch] │ │
                                  │ │ Séries em destaque aparecem no hero da  │ │
                                  │ │ home. Hoje: 3 séries em destaque.        │ │
                                  │ └─────────────────────────────────────────┘ │
                                  └─────────────────────────────────────────────┘
[ Excluir ]                                           [ Cancelar ] [ Salvar série ]
```
- Mobile: imagem em cima (full-width 16:9), campos abaixo, barra de ações fixa.
- Na edição, abaixo do formulário: seção "Miniaturas desta série" com até 8 `CarCard compact` + "Ver todas" (→ `/admin/cars?serie={id}`).

## Estados
| Estado | Comportamento |
|---|---|
| Carregando | 8 cards skeleton (rect 16:9 + 2 linhas) |
| Sem séries | `EmptyState kind="no-content" size="lg"` → "Nenhum conteúdo disponível." + `Button primary` "Cadastrar série" |
| Filtro "Em destaque" vazio | `EmptyState kind="no-content" size="sm"` + description "Ative 'Destacar na página inicial' em uma série." |
| Busca sem resultado | `EmptyState kind="no-content"` + "Limpar busca" |
| Excluir | ConfirmDialog "Excluir série?", com o texto "**{title}** será excluída." Se houver miniaturas vinculadas: "Ela possui **N miniaturas** vinculadas." (bloqueio ou desvínculo é regra do Backend; erro do servidor aparece no dialog) |
| Salvar | upload com progresso, validação inline, toast "Série salva." → volta para a listagem |
