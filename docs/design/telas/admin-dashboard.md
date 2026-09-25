# Admin · Dashboard — `/admin`

**Objetivo:** visão de "cockpit". Mostrar os 4 números exigidos (carros, séries, usuários, itens em coleção) com peso editorial e dar atalhos para o trabalho do dia. Só ADMIN; COLLECTOR → redireciona `/`.

## Shell
`AdminShell` (componentes.md §7): sidebar 248 px em `lg+`, drawer abaixo disso. Fundo `bg-bg`, conteúdo `max-w-[1280px] px-4 md:px-8 py-6 md:py-8`.

## Layout

```
Painel                                              [+ Nova miniatura]   ← h1 + Button primary
Visão geral do catálogo ToSave.

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ 🚗         │ │ ▦          │ │ 👤         │ │ ♥          │   StatCard ×4
│ Miniaturas │ │ Séries     │ │ Usuários   │ │ Em coleções│
│ 1.240      │ │ 38         │ │ 516        │ │ 8.932      │   display-lg font-display italic
│ Ver todas →│ │ Ver todas →│ │ Gerenciar →│ │            │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌ Adicionadas recentemente ─────────────────────┐ ┌ Atalhos ─────────────────┐
│ ▢ '71 Datsun 510 Wagon   HKJ42   há 2 h   ⋯  │ │ [Layers] Nova série       │
│ ▢ Nissan Skyline GT-R    HCT01   ontem    ⋯  │ │ [Tag]    Nova marca       │
│ ▢ …  (6 últimas, CarCard compact)             │ │ [Sparkles] Novo atributo  │
│                           Ver todas →         │ │ [Settings] Configurações  │
└───────────────────────────────────────────────┘ └──────────────────────────┘
       lg:col-span-8                                    lg:col-span-4
```

- **StatCard** (componentes.md §13): o primeiro ("Miniaturas") ganha tratamento hero — borda superior 2 px `bg-flame` e ícone em `bg-primary`/`text-primary-fg`. Os outros ficam no padrão tonal. Números com separador de milhar pt-BR.
- "Usuários → Gerenciar" leva a `/admin/settings?tab=usuarios`. "Em coleções" = soma de `Collections.quantity` (sem link).
- **Recentes:** 6 carros por `createdAt desc`; cada linha abre a edição. Menu `⋯`: Editar, Ver no site, Excluir.
- **Atalhos:** lista de botões-linha 52 px `rounded-md hover:bg-surface-3` com ícone em quadrado tonal + seta.

## Responsividade
| Base | `sm` | `lg+` |
|---|---|---|
| Stats em grid 2×2, número `1.75rem`; "Nova miniatura" vira `Button primary sm` ao lado do título (sem FAB) | Stats 2×2 maiores | Stats em 4 colunas; recentes + atalhos em 8/4 |

## Estados
| Estado | Comportamento |
|---|---|
| Carregando | 4 `StatCardSkeleton` + 6 `TableRowSkeleton` |
| Catálogo vazio (0 carros) | Números mostram `0` (é dado real, não vazio). O card "Adicionadas recentemente" vira um **card de onboarding**: `EmptyState kind="no-cars"` → "Nenhuma miniatura disponível no momento." + description "Comece cadastrando marcas e séries, depois adicione as miniaturas." + 3 botões na ordem: "Cadastrar marca", "Cadastrar série", "Cadastrar miniatura" (primary) |
| Erro | `ErrorState` por bloco (um erro em "recentes" não derruba os stats) |
