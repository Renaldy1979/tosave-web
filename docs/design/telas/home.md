# Home pública — `/`

**Objetivo:** vitrine do catálogo. Em 1 segundo o visitante precisa sentir "loja premium de colecionáveis", e em 1 gesto chegar a uma miniatura. Após o login o colecionador cai aqui, direto na listagem.

## Estrutura (ordem vertical)

1. Navbar (ink)
2. **Hero** — muda por estado de sessão
3. **FilterBar** sticky
4. **Grid de miniaturas** + Pagination `load-more`
5. Rodapé mínimo

## 1. Hero

Superfície `ink` nos dois temas. Fundo `bg-hero-glow` (brilho laranja→vermelho radial à direita) + textura de ruído a 3% opcional. Borda inferior 1 px `border-white/5`.

### Visitante (deslogado)

```
Desktop (lg+) — altura ~520px, grid 12 col
┌──────────────────────────────────────────────────────────────────────┐
│  CATÁLOGO DE MINIATURAS                     ┌───────────────────────┐ │
│  Sua garagem                                │                       │ │
│  em escala 1:64.   ← "1:64" com texto       │  CARROSSEL DE SÉRIES  │ │
│                      gradiente flame         │  EM DESTAQUE          │ │
│  Encontre, organize e compartilhe cada      │  (isDefault = true)   │ │
│  Hot Wheels e Matchbox da sua coleção.      │                       │ │
│                                             │ 🔥 Série em destaque  │ │
│  [🔍 Buscar por nome ou código (toy)   ]    │ HW J-Imports  →       │ │
│  [ Criar minha coleção ]  Entrar            └──── ▬ • • ────────────┘ │
│                                                                        │
│  1.240 miniaturas · 38 séries · 12 marcas   ← contagens reais do banco │
└──────────────────────────────────────────────────────────────────────┘
```

- Coluna texto (`lg:col-span-6`): eyebrow `font-condensed text-primary-text` → título `text-display-2xl font-display italic font-extrabold` → subtítulo `body-lg text-fg-muted max-w-md` → `SearchInput size=lg` (`max-w-xl`) → CTAs: `Button flame lg` "Criar minha coleção" (→ /register) + `Button ghost lg` "Entrar".
- Coluna visual (`lg:col-span-6`): **carrossel das séries com `isDefault = true`** (decisão: várias séries podem ser destaque). Cada slide: imagem `aspect-[4/3] rounded-xl`, leve rotação 3D (`rotate-y-[-6deg]` + perspectiva), glow `shadow-glow`, Badge `flame` "Série em destaque", título da série em `h2` e contagem de miniaturas. Troca automática a cada 6 s com crossfade de 320 ms, pausada em hover/foco e desligada com `prefers-reduced-motion`. Paginação por dots (ativo alongado 16 px `bg-primary`) e setas `IconButton glass` no hover. Clique → aplica o filtro da série no grid e rola até ele. **Só 1 série em destaque:** sem dots nem setas, card estático.
- Linha de números (`body-sm text-fg-subtle`, números `font-mono text-fg`): contagens do banco. Oculta se todas forem 0.
- **Nenhuma série em destaque:** a coluna visual some e o texto centraliza (`text-center`, `max-w-2xl mx-auto`). Nada de placeholder inventado.

### Colecionador logado — hero compacto

Objetivo: a listagem acima da dobra. Altura ~200 px desktop / ~160 px mobile.
```
Olá, {primeiro nome}     ← h1 font-display
Você tem 42 miniaturas na coleção.   [Ver minha coleção →]
[🔍 Buscar por nome ou código                          ]
```
Sem CTA de cadastro e sem carrossel. As séries em destaque viram uma linha de chips "🔥 {série}" (scroll horizontal) logo acima dos filtros. Tocar num chip aplica o filtro.

### Responsividade do hero
| Base | `sm`–`md` | `lg+` |
|---|---|---|
| 1 coluna, `pt-8 pb-10`, título `2.5rem`, busca full-width, CTAs empilhados full-width; séries em destaque viram uma **faixa de cards horizontais com scroll-snap** abaixo dos CTAs (card 260 px: thumb 96×72 + título + seta) | 1 coluna, CTAs lado a lado, mesma faixa de séries | 2 colunas como o diagrama (carrossel), `py-20` |

## 2. FilterBar

Componente `FilterBar` (ver componentes.md §12) com: busca (sincronizada com a do hero — é o mesmo parâmetro `q`), Série, Marca, Ano, Atributos. Sticky abaixo da navbar. No mobile, busca + botão "Filtros" que abre o BottomSheet.

## 3. Grid

- `SectionHeader`: "Todas as miniaturas" + contagem `font-mono` à direita ("1.240"). Com filtros ativos: "Resultados" + contagem.
- Grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6`.
- `CarCard variant=catalog`, primeiros 4 com `priority`.
- Página de 24 itens; `Pagination load-more`.
- Favoritar direto do card (FavoriteButton). Deslogado → Modal de login.

## Estados

| Estado | Comportamento |
|---|---|
| **Carregando (primeira carga)** | Hero renderiza (server) com contagens; FilterBar com chips skeleton; `CarGridSkeleton` 8 (mobile) / 12 (desktop) |
| **Carregando (filtro/busca)** | Grid atual fica `opacity-50 pointer-events-none` + barra de progresso 2 px `bg-flame` no topo da FilterBar. Não trocar por skeleton (evita "piscar") |
| **Carregar mais** | Botão em loading; 4 `CarCardSkeleton` anexados ao fim do grid |
| **Sem nenhum carro no banco** | Grid substituído por `EmptyState kind="no-cars" size="lg"` → **"Nenhuma miniatura disponível no momento."** Sem ação para visitante; para ADMIN logado: `Button primary` "Cadastrar miniatura" → /admin/cars. FilterBar oculta. Números do hero ocultos |
| **Busca/filtro sem resultado** | `EmptyState kind="no-cars"` com título oficial + description "Tente outro termo ou limpe os filtros." + `Button outline` "Limpar filtros" (aprovado — decisão 2) |
| **Erro de rede** | `ErrorState` no lugar do grid; hero permanece |
| **Opções de filtro vazias** (ex.: sem atributos) | Chip do filtro fica oculto na barra; no sheet, a seção mostra "Nenhum conteúdo disponível." |

## Acessibilidade
- `h1` da página = título do hero (visitante) ou saudação (logado).
- Grid é `<ul role="list">`; cada card `<li>`.
- Anunciar contagem ao filtrar via `aria-live="polite"` ("312 miniaturas encontradas").
- Atalho `/` foca a busca (desktop).
