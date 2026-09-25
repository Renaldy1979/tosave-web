# Detalhe da miniatura — `/car/[id]`

**Objetivo:** a "página de produto" premium. A miniatura ocupa a tela como numa loja de luxo; informações organizadas como uma ficha técnica. Conteúdo obrigatório (especificação): nome completo, galeria, informações, descrição, marca, código (toy), ano, atributos e quantidade na coleção.

## Layout desktop (lg+)

```
Navbar
← Voltar ao catálogo        Catálogo / HW J-Imports / '71 Datsun 510 Wagon     ← breadcrumb body-sm fg-subtle
┌─────────────────────────────────────────┬──────────────────────────────────┐
│  GALERIA (col-span-7)                   │  PAINEL (col-span-5, sticky top-24)│
│ ┌───┐ ┌───────────────────────────────┐ │  MATTEL · 2024                   │ ← eyebrow
│ │ ▢ │ │                               │ │  '71 Datsun 510 Wagon            │ ← display-xl font-display
│ ├───┤ │                               │ │  [#001] [8/10] [1/64]            │ ← badges accent/neutral mono
│ │ ▢ │ │      IMAGEM PRINCIPAL         │ │                                  │
│ ├───┤ │      aspect-gallery 16:10     │ │  ┌ Na sua coleção ─────────────┐ │
│ │ ▢ │ │      palco bg-card-stage      │ │  │ ♥  2 unidades   [– 2 +]     │ │ ← card de coleção
│ ├───┤ │      rounded-xl               │ │  └─────────────────────────────┘ │
│ │ ▢ │ │                    ⤢ 1/5      │ │  [ ♥ Adicionar à coleção ]  [⇪] │ ← primary lg + WhatsApp
│ └───┘ └───────────────────────────────┘ │                                  │
│  thumbs verticais 72px                   │  FICHA TÉCNICA                   │
│                                          │  Marca        Mattel  (logo 24px)│
│                                          │  Série        HW J-Imports  →    │
│                                          │  Código (toy) HKJ42  ⧉           │
│                                          │  Ano          2024               │
│                                          │  Escala       1/64               │
│                                          │  Cor          ● Azul metálico    │
│                                          │  Posição      8/10               │
│                                          │  Nº coleção   #001               │
│                                          │                                  │
│                                          │  ATRIBUTOS                       │
│                                          │  [Treasure Hunt] [Rodas Real…]   │
└─────────────────────────────────────────┴──────────────────────────────────┘
DESCRIÇÃO                          (col-span-7, body-lg, max-w-prose)
MAIS DA SÉRIE HW J-Imports         SectionHeader + carrossel horizontal de CarCard catalog
```

### Galeria
- Imagem principal: `imagemFull`, seguida das `CarImages` ordenadas por `position`.
- Palco `bg-card-stage rounded-xl`, `aspect-gallery`, `object-contain` com padding 5% (aqui a foto inteira importa mais que o preenchimento).
- Thumbs: coluna vertical à esquerda (desktop), 72×72 `rounded-md`, ativa com `ring-2 ring-primary`, demais `opacity-60 hover:opacity-100`.
- Hover na principal: cursor zoom-in; lente de zoom 2× acompanhando o mouse (desktop).
- Clique ou `⤢` abre **Lightbox** (componentes.md §8).
- Contador `1 / 5` em Badge glass mono no canto inferior direito.
- Só 1 imagem: sem thumbs, galeria ocupa a mesma área.

### Painel de informações
- Título: `title` completo, sem truncar (`display-xl`, quebra natural).
- Badges: `#collector` (accent, mono), `seriePosition` (neutral mono), `scale` (neutral mono). Campo vazio → badge não aparece.
- **Card "Na sua coleção"** (só se logado e quantity ≥ 1): `rounded-lg bg-primary-soft/60 border border-primary/30 p-4`, `Heart` preenchido `text-flame`, "2 unidades" `h3`, `QuantityStepper secondary`. Reduzir para 0 → ConfirmDialog "Remover da coleção?".
- **CTA:** não está na coleção → `Button primary lg` `Heart` "Adicionar à coleção" (flex-1). Está → o card acima substitui a CTA e o botão vira `Button secondary` "Remover da coleção".
- **Compartilhar:** `WhatsAppShareButton` (ícone, `secondary lg` quadrado) ao lado da CTA. Texto: "{title} — veja na ToSave: {url}".
- **Ficha técnica:** `<dl>` em grid 2 colunas (`grid-cols-[120px_1fr]`), label `body-sm fg-subtle`, valor `body text-fg`; linhas separadas por `border-b border-border` com `py-3`. Códigos em `font-mono`. `toy` com IconButton `Copy` (toast "Código copiado."). Série e marca são links que aplicam o filtro correspondente na home. Cor: dot com o hex (se hex) + texto. Linhas com valor vazio são omitidas.
- **Atributos:** Badges `neutral md` com ícone `Sparkles` 12 px; sem atributos → seção omitida.

### Descrição
`h2` "Sobre esta miniatura" + `description` em `body-lg text-fg-muted max-w-prose whitespace-pre-line`. Sem descrição → seção omitida.

### Mais da série
Até 10 carros da mesma série (exceto o atual), carrossel `overflow-x-auto snap-x` com cards de largura fixa 220 px; setas `IconButton secondary` no desktop. Se não houver outros, seção omitida.

## Mobile (base → md)

Ordem de empilhamento pensada para polegar:
1. Navbar com IconButton `ArrowLeft` "Voltar" à esquerda em vez da logo (e `Share2` à direita).
2. **Galeria full-bleed** (sem margem lateral, sem raio), `aspect-square`, carrossel com swipe + dots de paginação (dot ativo alongado 16 px `bg-primary`). Toque abre Lightbox.
3. Eyebrow, título `display-xl` (≈ 2rem), badges.
4. Ficha técnica, atributos, descrição, mais da série.
5. **Barra de ação fixa** na base (acima da TabBar escondida nesta rota): `bg-ink/90 backdrop-blur border-t` com `Button primary lg flex-1` "Adicionar à coleção" + WhatsApp. Quando já na coleção: "♥ Na coleção · 2" + QuantityStepper.

`md`: galeria com margem e `rounded-xl`, painel abaixo em 2 colunas (ficha | atributos+CTA). `lg+`: layout do diagrama.

## Estados

| Estado | Comportamento |
|---|---|
| Carregando | `DetailSkeleton`: rect da galeria + 4 thumbs + linhas de título/badges + 6 linhas de ficha |
| Deslogado clica em Adicionar | Modal de login rápido (login.md); após login a ação é concluída |
| Adicionando/removendo | otimista; stepper e botão com loading curto; erro → reverte + toast "Não foi possível atualizar sua coleção." |
| Carro não existe | `notFound()` → 404 padrão ("Página não encontrada." + "Voltar ao catálogo") |
| Sem imagens | galeria mostra palco com ícone `Car` 64 px; sem thumbs, sem lightbox |
| Erro de rede | `ErrorState` no lugar do conteúdo, breadcrumb mantido |

## SEO / compartilhamento
`generateMetadata`: title "{title} · ToSave", description = início da descrição, `og:image` = `imagemFull` (é o que aparece no preview do WhatsApp — por isso é importante).
