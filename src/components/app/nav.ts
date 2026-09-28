import { BarChart3, Heart, Home, Layers, Newspaper, Repeat, Search, User, type LucideIcon } from "lucide-react";

export type AppNavItem = { href: string; label: string; icon: LucideIcon };

const HOME: AppNavItem = { href: "/", label: "Início", icon: Home };
const BUSCAR: AppNavItem = { href: "/buscar", label: "Buscar", icon: Search };
const SERIES: AppNavItem = { href: "/series", label: "Séries", icon: Layers };
const COLECAO: AppNavItem = { href: "/colecao", label: "Minha coleção", icon: Heart };
const ESTATISTICAS: AppNavItem = { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 };
const NOTICIAS: AppNavItem = { href: "/noticias", label: "Notícias", icon: Newspaper };
const TROCA: AppNavItem = { href: "/troca", label: "Clube da Troca", icon: Repeat };
const PERFIL: AppNavItem = { href: "/perfil", label: "Perfil", icon: User };

export const APP_NOTIFICATIONS_HREF = "/notificacoes";

/**
 * Itens do app do colecionador (docs/briefings/app-web-lote5.md, lote 5a
 * fase A, ajuste de navegação). Espelha `tosave-mobile/src/navigation/drawerItems.ts`.
 *
 * - Celular: barra inferior com 4 destes + "Mais" (painel com `APP_MORE_ITEMS`).
 * - Desktop: menu lateral agrupado em `APP_DESKTOP_NAV`.
 */
export const APP_MOBILE_TABS: AppNavItem[] = [HOME, BUSCAR, COLECAO, TROCA];

/** Itens do painel "Mais" (celular), aberto a partir da barra inferior. */
export const APP_MORE_ITEMS: AppNavItem[] = [SERIES, NOTICIAS, ESTATISTICAS, PERFIL];

/** Grupos do menu lateral fixo (desktop `lg+`). */
export const APP_DESKTOP_NAV: { title: string; items: AppNavItem[] }[] = [
  { title: "Explorar", items: [HOME, BUSCAR, SERIES] },
  { title: "Minha coleção", items: [COLECAO, ESTATISTICAS] },
  { title: "Comunidade", items: [NOTICIAS, TROCA] },
  { title: "Conta", items: [PERFIL] },
];

export function isAppNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
