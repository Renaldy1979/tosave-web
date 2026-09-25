# Handoff de design: Forja

Guia curto para implementar a interface da Fase 1. **Este arquivo é a fonte única do `tailwind.config.ts` e do `globals.css`.** Cole como está.

Leitura por prioridade:
1. Este arquivo.
2. `componentes.md`, ao criar cada componente.
3. `telas/README.md` (shell, padrão de erro, padrão de formulário admin) e depois a spec da tela que for implementar.
4. `design-system.md` e `marca.md` como referência (o porquê de cada token).

---

## 1. Setup visual do projeto

### Dependências de UI
```bash
npm i next-themes lucide-react class-variance-authority clsx tailwind-merge \
  @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-tabs \
  @radix-ui/react-switch @radix-ui/react-tooltip @radix-ui/react-dropdown-menu cmdk sonner
```
- Radix: acessibilidade de Modal, Popover, Tabs, Switch, Tooltip e Dropdown sem reinventar foco e teclado.
- `cmdk`: Combobox com busca (marca, série, atributos).
- `sonner`: toasts. Estilize com os tokens (seção 4, `toaster.tsx`).

### Tailwind: versão
A configuração abaixo foi escrita para **Tailwind v3.4** (`tailwind.config.ts` + `postcss`). Recomendação: `create-next-app --no-tailwind` e depois `npm i -D tailwindcss@3.4 postcss autoprefixer`.
Se o projeto já estiver em **Tailwind v4**: troque as 3 diretivas `@tailwind` por `@import "tailwindcss";` + `@config "../../tailwind.config.ts";` no topo do `globals.css`. Depois confira se `bg-primary/20` gera opacidade (é o teste do padrão `<alpha-value>`).

### Assets da marca (ver `marca.md`)
```
_brand/favicon/favicon.ico     → src/app/favicon.ico
_brand/favicon/icon-512.png    → src/app/icon.png
_brand/favicon/apple-icon.png  → src/app/apple-icon.png
_brand/logo.png                → public/brand/logo.png
_brand/logo-light.png          → public/brand/logo-light.png
_brand/logo-car.png            → public/brand/logo-car.png
```

### Fontes: `src/app/fonts.ts`
```ts
import { Inter, Saira, Saira_Condensed, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
export const fontDisplay = Saira({
  subsets: ["latin"], weight: ["600", "700", "800"], style: ["normal", "italic"],
  variable: "--font-display", display: "swap",
});
export const fontCondensed = Saira_Condensed({
  subsets: ["latin"], weight: ["600"], variable: "--font-condensed", display: "swap",
});
export const fontMono = JetBrains_Mono({
  subsets: ["latin"], weight: ["500"], variable: "--font-mono", display: "swap",
});
```

### Tema: `src/app/layout.tsx` (trecho)
```tsx
<html lang="pt-BR" suppressHydrationWarning
  className={`${fontSans.variable} ${fontDisplay.variable} ${fontCondensed.variable} ${fontMono.variable}`}>
  <body>
    <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]}
      enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  </body>
</html>
```
O tema **padrão é dark**. O toggle fica na Navbar e no `/profile`.

---

## 2. `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const sansFallback = ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"];
const monoFallback = ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"];

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    screens: { xs: "400px", sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
    extend: {
      colors: {
        bg: token("bg"),
        surface: { DEFAULT: token("surface"), 2: token("surface-2"), 3: token("surface-3") },
        ink: { DEFAULT: token("ink"), fg: token("ink-fg") },
        border: { DEFAULT: token("border"), strong: token("border-strong") },
        fg: { DEFAULT: token("fg"), muted: token("fg-muted"), subtle: token("fg-subtle") },
        primary: {
          DEFAULT: token("primary"), hover: token("primary-hover"), fg: token("primary-fg"),
          text: token("primary-text"), soft: token("primary-soft"),
        },
        accent: { DEFAULT: token("accent"), soft: token("accent-soft") },
        flame: { DEFAULT: token("flame"), soft: token("flame-soft") },
        success: token("success"),
        warning: token("warning"),
        danger: token("danger"),
        info: token("info"),
        ring: token("ring"),
        overlay: token("overlay"),

        // primitivos: só para ilustração/casos pontuais; componentes usam os semânticos
        orange: {
          50: "#FFF5E6", 100: "#FFE7C2", 200: "#FFCF85", 300: "#FFB347", 400: "#FF9A1A",
          500: "#FD8401", 600: "#E06E00", 700: "#B85600", 800: "#8F4300", 900: "#6B3200", 950: "#3D1C00",
        },
        yellow: {
          50: "#FFFBE6", 100: "#FFF5BF", 200: "#FFEC80", 300: "#FFE54D", 400: "#FFE133",
          500: "#FFDE21", 600: "#E6C200", 700: "#B39700", 800: "#806C00", 900: "#594B00",
        },
        red: {
          50: "#FFF0F0", 100: "#FFD6D6", 200: "#FFA8A8", 300: "#FF6B6B", 400: "#FF3838",
          500: "#FF0000", 600: "#E00000", 700: "#B30000", 800: "#800000", 900: "#4D0000",
        },
        neutral: {
          0: "#FFFFFF", 50: "#F6F6F8", 100: "#EBEBEF", 200: "#D6D6DD", 300: "#B4B4BE", 400: "#8A8A96",
          500: "#5B5B66", 600: "#3A3A43", 700: "#26262D", 800: "#1C1C21", 850: "#16161A", 900: "#111114",
          950: "#0B0B0D",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...sansFallback],
        display: ["var(--font-display)", ...sansFallback],
        condensed: ["var(--font-condensed)", ...sansFallback],
        mono: ["var(--font-mono)", ...monoFallback],
      },
      fontSize: {
        "display-2xl": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-xl": ["clamp(2rem, 4.5vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "700" }],
        h1: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        h2: ["1.375rem", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.6" }],
        body: ["0.9375rem", { lineHeight: "1.55" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        eyebrow: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.14em", fontWeight: "600" }],
      },
      spacing: { 4.5: "1.125rem", 13: "3.25rem", 18: "4.5rem", 22: "5.5rem", 30: "7.5rem" },
      borderRadius: { xs: "4px", sm: "6px", md: "8px", lg: "12px", xl: "16px" },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        pop: "var(--shadow-pop)",
        modal: "var(--shadow-modal)",
        glow: "var(--shadow-glow)",
      },
      backgroundImage: {
        flame: "linear-gradient(100deg, #FFDE21 0%, #FD8401 45%, #FF0000 100%)",
        "hero-glow":
          "radial-gradient(60% 80% at 75% 40%, rgb(253 132 1 / .28) 0%, rgb(255 0 0 / .10) 45%, transparent 75%)",
        "card-stage": "radial-gradient(80% 70% at 50% 60%, rgb(var(--surface-3)) 0%, rgb(var(--surface-2)) 70%)",
      },
      aspectRatio: { card: "4 / 3", gallery: "16 / 10" },
      transitionDuration: { fast: "120ms", base: "200ms", slow: "320ms" },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      zIndex: { sticky: "30", navbar: "40", tabbar: "40", popover: "50", modal: "60", toast: "70" },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "heart-pop": { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.25)" }, "100%": { transform: "scale(1)" } },
        "sheet-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        "heart-pop": "heart-pop 280ms cubic-bezier(0.22, 1, 0.36, 1)",
        "sheet-up": "sheet-up 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

## 3. `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* DARK é o padrão: vale para :root e para .dark */
  :root,
  .dark {
    color-scheme: dark;
    --bg: 11 11 13;
    --surface: 22 22 26;
    --surface-2: 28 28 33;
    --surface-3: 38 38 45;
    --ink: 11 11 13;
    --ink-fg: 246 246 248;
    --border: 38 38 45;
    --border-strong: 58 58 67;
    --fg: 246 246 248;
    --fg-muted: 180 180 190;
    --fg-subtle: 138 138 150;
    --primary: 253 132 1;
    --primary-hover: 255 154 26;
    --primary-fg: 11 11 13;
    --primary-text: 255 154 26;
    --primary-soft: 61 28 0;
    --accent: 255 222 33;
    --accent-soft: 89 75 0;
    --flame: 255 56 56;
    --flame-soft: 77 0 0;
    --success: 34 197 94;
    --warning: 255 222 33;
    --danger: 255 56 56;
    --info: 96 165 250;
    --ring: 253 132 1;
    --overlay: 0 0 0;

    --shadow-card: 0 0 0 1px rgb(38 38 45);
    --shadow-card-hover: 0 0 0 1px rgb(253 132 1 / .45), 0 12px 32px -8px rgb(253 132 1 / .25);
    --shadow-pop: 0 16px 40px -12px rgb(0 0 0 / .7), 0 0 0 1px rgb(58 58 67);
    --shadow-modal: 0 32px 80px -20px rgb(0 0 0 / .8);
    --shadow-glow: 0 0 24px rgb(253 132 1 / .35);
  }

  .light {
    color-scheme: light;
    --bg: 246 246 248;
    --surface: 255 255 255;
    --surface-2: 240 240 243;
    --surface-3: 235 235 239;
    --ink: 17 17 20;
    --ink-fg: 246 246 248;
    --border: 224 224 230;
    --border-strong: 200 200 208;
    --fg: 17 17 20;
    --fg-muted: 75 75 85;
    --fg-subtle: 110 110 122;
    --primary: 253 132 1;
    --primary-hover: 224 110 0;
    --primary-fg: 11 11 13;
    --primary-text: 184 86 0;
    --primary-soft: 255 231 194;
    --accent: 128 108 0;
    --accent-soft: 255 245 191;
    --flame: 224 0 0;
    --flame-soft: 255 240 240;
    --success: 21 128 61;
    --warning: 128 108 0;
    --danger: 224 0 0;
    --info: 37 99 235;
    --ring: 224 110 0;
    --overlay: 17 17 20;

    --shadow-card: 0 1px 2px rgb(17 17 20 / .06), 0 0 0 1px rgb(224 224 230);
    --shadow-card-hover: 0 0 0 1px rgb(253 132 1 / .5), 0 12px 28px -10px rgb(17 17 20 / .18);
    --shadow-pop: 0 16px 40px -12px rgb(17 17 20 / .2), 0 0 0 1px rgb(224 224 230);
    --shadow-modal: 0 32px 80px -20px rgb(17 17 20 / .3);
    --shadow-glow: 0 0 20px rgb(253 132 1 / .25);
  }

  /* Superfícies sempre-escuras (Navbar, Hero, aside de Auth). Forçam o
     conjunto dark mesmo no tema light, e a logo original fica legível. */
  .ink {
    color-scheme: dark;
    --surface: 22 22 26;
    --surface-2: 28 28 33;
    --surface-3: 38 38 45;
    --border: 38 38 45;
    --border-strong: 58 58 67;
    --fg: 246 246 248;
    --fg-muted: 180 180 190;
    --fg-subtle: 138 138 150;
    --primary-text: 255 154 26;
    --primary-soft: 61 28 0;
    --accent: 255 222 33;
    --accent-soft: 89 75 0;
    --flame: 255 56 56;
    --flame-soft: 77 0 0;
    --ring: 253 132 1;
    background-color: rgb(var(--ink));
    color: rgb(var(--fg));
  }

  *, ::before, ::after {
    @apply border-border;
  }

  body {
    @apply bg-bg font-sans text-body text-fg antialiased;
  }

  ::selection {
    background: rgb(253 132 1 / .35);
  }

  :focus-visible {
    outline: none;
  }
}

@layer components {
  /* Skeleton com shimmer */
  .skeleton {
    @apply relative overflow-hidden rounded-md bg-surface-2;
  }
  .skeleton::after {
    content: "";
    @apply absolute inset-0 -translate-x-full animate-shimmer;
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / .04), transparent);
  }
  .light .skeleton::after {
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / .6), transparent);
  }

  /* Texto com gradiente da marca (ex.: "1:64" no hero) */
  .text-flame-gradient {
    @apply bg-flame bg-clip-text text-transparent;
  }

  /* Container de página: 1440px, gutters 16 → 20 → 24 → 32 → 40 */
  .page-container {
    @apply mx-auto w-full max-w-[1440px] px-4 sm:px-5 md:px-6 lg:px-8 2xl:px-10;
  }

  /* <Logo variant="auto" />: alterna sem flash */
  .logo-light { display: none; }
  .light .logo-light { display: block; }
  .light .logo-dark { display: none; }
  .ink .logo-light { display: none !important; }
  .ink .logo-dark { display: block !important; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 4. Componentes: ordem de criação em `src/components/ui/`

Crie **nessa ordem**; cada onda destrava as telas da seção 5. Spec de cada um em `componentes.md`.

**Onda 1: fundação (antes de qualquer tela)**
| Arquivo | Nota |
|---|---|
| `src/lib/cn.ts` | `cn(...)` = `twMerge(clsx(...))` |
| `button.tsx` | 6 variantes × 3 tamanhos, `loading`, `asChild`. **Texto do primary é escuro** (`text-primary-fg`); nunca branco sobre laranja |
| `icon-button.tsx` | `aria-label` obrigatório; variante `glass` |
| `input.tsx` | + `PasswordInput`, `Textarea`, `MonoInput` (sempre `type="text"`, preserva `001`) |
| `badge.tsx` | inclui `brandState` e `accent` mono |
| `skeleton.tsx` | usa a classe `.skeleton` |
| `logo.tsx` | `variant auto/dark/light`, `size sm/md/lg` (ver `marca.md`) |
| `theme-toggle.tsx` | `next-themes` |
| `modal.tsx` | Radix Dialog; vira BottomSheet abaixo de `sm` |
| `confirm-dialog.tsx` | usado em toda exclusão e mudança de role/status |
| `empty-state.tsx` | `kind: "no-cars" \| "no-content"`, **com título fixo**, texto exato da especificação |
| `error-state.tsx` | padrão único de erro (telas/README.md) |
| `alert.tsx` | tonal `flame-soft` para erros de formulário |
| `toaster.tsx` | `sonner` estilizado: `bg-surface shadow-pop border-l-4` |

**Onda 2: auth + admin**
`select.tsx` · `combobox.tsx` (cmdk; BottomSheet no mobile) · `switch.tsx` · `segmented-control.tsx` · `tabs.tsx` · `avatar.tsx` · `image-upload.tsx` · `gallery-upload.tsx` (reordenação → `position`) · `data-table.tsx` (vira lista-cartão < `md`) · `pagination.tsx` (`numbered`) · `stat-card.tsx` · `admin-shell.tsx` (sidebar/drawer) · `password-strength.tsx`

**Onda 3: experiência pública**
`navbar.tsx` · `tab-bar.tsx` · `search-input.tsx` · `car-card.tsx` (+ `CarCardSkeleton`, variantes `catalog/collection/compact`) · `favorite-button.tsx` · `quantity-stepper.tsx` · `filter-bar.tsx` (desktop popovers + sheet mobile, estado na URL) · `pagination.tsx` (`load-more`) · `featured-series-carousel.tsx` · `lightbox.tsx` · `whatsapp-share-button.tsx` · `section-header.tsx`

---

## 5. Ordem de implementação das telas

Motivo da ordem: o banco começa vazio (sem seed de usuários), o `/setup` é a porta de entrada, e as telas públicas só fazem sentido com dados cadastrados pelo admin.

| # | Tela(s) | Spec | Depende de |
|---|---|---|---|
| 1 | Layout raiz, fontes, tema, `not-found`, `error` | `telas/README.md` | Onda 1 |
| 2 | `/setup` | `telas/setup.md` | Onda 1 + `password-strength` |
| 3 | `/login`, `/register` (layout de Auth compartilhado) | `telas/login.md`, `telas/register.md` | 2 |
| 4 | `AdminShell` + `/admin` dashboard | `telas/admin-dashboard.md` | Onda 2 |
| 5 | `/admin/brands` (+ `/new`, `/[id]/edit`) | `telas/admin-marcas.md` | 4. Estabelece o **padrão de formulário admin** |
| 6 | `/admin/series` (+ sub-rotas) | `telas/admin-series.md` | 5 |
| 7 | `/admin/cars/atributes` (+ sub-rotas) | `telas/admin-atributos.md` | 5 |
| 8 | `/admin/cars` (+ `/new`, `/[id]/edit`), upload e galeria | `telas/admin-carros.md` | 5–7 |
| 9 | `/` home (hero, carrossel de destaques, FilterBar, grid) | `telas/home.md` | Onda 3 + dados de 5–8 |
| 10 | `/car/[id]` | `telas/car-detalhe.md` | 9 |
| 11 | `/collections` | `telas/collections.md` | 9, 10 |
| 12 | `/profile` | `telas/perfil.md` | 3 |
| 13 | `/admin/settings` (abas Geral + Usuários) | `telas/admin-settings.md` | 4. A aba Geral aguarda a definição dos campos |

---

## 6. Regras que não podem quebrar (checklist de revisão visual)

- [ ] Nenhuma cor hex/primitiva em componente de tela; só tokens semânticos (`bg-surface`, `text-fg-muted`, `bg-primary`…).
- [ ] Texto sobre `bg-primary` é sempre `text-primary-fg` (escuro).
- [ ] Navbar, Hero e aside de Auth usam a classe `.ink` nos dois temas.
- [ ] Testado em **360 px**, 768 px, 1280 px e **nos dois temas**.
- [ ] Alvos de toque ≥ 44 px no mobile; `TabBar` não cobre conteúdo (`pb-20`).
- [ ] `focus-visible` com anel laranja em todo interativo.
- [ ] Loading com Skeleton na geometria final (sem spinner de página).
- [ ] Empty states com o texto exato: "Nenhuma miniatura disponível no momento." / "Nenhum conteúdo disponível."
- [ ] Toda exclusão com `ConfirmDialog`; toda mutação com toast.
- [ ] Campos de imagem são upload real (exceto `imagemURLOriginal`); sem campo de `imagemThumb`.
- [ ] Códigos (`collector`, `toy`, `seriePosition`, `scale`) em `font-mono`, e `001` continua `001`.
- [ ] Filtros e paginação refletidos na URL.
- [ ] `prefers-reduced-motion` respeitado.

Dúvida visual → `maestri ask "Aquarela" "..."`. Dúvida de requisito → Orquestrador.
