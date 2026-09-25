# Admin · Atributos — `/admin/cars/atributes`

CRUD de `Attributes`: title, description. A rota usa a grafia exata da especificação (`atributes`). Na sidebar aparece como **"Atributos"**, aninhado sob "Miniaturas".

## Rotas

| URL | Conteúdo |
|---|---|
| `/admin/cars/atributes` | Listagem |
| `/admin/cars/atributes/new` | Criar |
| `/admin/cars/atributes/[id]/edit` | Editar |

> Atenção de roteamento: `/admin/cars/atributes` convive com `/admin/cars/[id]/edit`. `atributes` e `new` são segmentos estáticos e têm prioridade sobre `[id]` no App Router, então não há conflito.

## Listagem

Atributos são rótulos (ex.: Treasure Hunt, Rodas de borracha), então a listagem é uma **lista leve em card**, não uma tabela.

```
Catálogo / Miniaturas / Atributos
Atributos  24                                          [+ Novo atributo]
Rótulos usados para filtrar e destacar miniaturas.
[🔍 Buscar atributo            ]

┌──────────────────────────────────────────────────────────────────────┐
│ ✦ Treasure Hunt                                   312 miniaturas   ⋯ │
│   Edição especial com símbolo de chama escondido.                    │
├──────────────────────────────────────────────────────────────────────┤
│ ✦ Rodas de borracha                                48 miniaturas   ⋯ │
│   Real Riders.                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

- Card único `rounded-lg bg-surface shadow-card`. Linhas `px-5 py-4 border-b border-border hover:bg-surface-3/50`, com ícone `Sparkles` em quadrado 32 px `bg-accent-soft text-accent`, título `body font-semibold`, descrição `body-sm fg-muted line-clamp-1` e contagem de uso `body-sm font-mono fg-subtle`.
- Linha clicável → edição. `⋯`: Editar, Ver miniaturas (→ `/admin/cars?attr={id}`), Excluir.
- Mobile: mesma lista; a contagem desce para a linha da descrição.

## Formulário (`/new` e `/[id]/edit`)

Padrão de formulário admin, versão **estreita** (`max-w-[640px]`, uma coluna, um card):

```
Catálogo / Miniaturas / Atributos / Novo
Novo atributo
┌──────────────────────────────────────────────┐
│ Nome *        [                            ] │
│ Descrição     [ Textarea                   ] │
│                                              │
│ Pré-visualização:  [✦ Treasure Hunt]         │  ← Badge como aparece no detalhe do carro
└──────────────────────────────────────────────┘
[ Excluir ]                    [ Cancelar ] [ Salvar atributo ]
```

## Estados
| Estado | Comportamento |
|---|---|
| Carregando | 8 linhas skeleton |
| Sem atributos | `EmptyState kind="no-content" size="lg"` → "Nenhum conteúdo disponível." + "Cadastrar atributo" |
| Busca sem resultado | `EmptyState kind="no-content" size="sm"` |
| Excluir | ConfirmDialog "Excluir atributo?", com o texto "**{title}** será removido de N miniaturas." |
| Salvar | toast "Atributo salvo." → volta para a listagem |
