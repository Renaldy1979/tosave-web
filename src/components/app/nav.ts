import { BarChart3, Bell, Heart, Home, Layers, MoreHorizontal, Newspaper, Repeat, Search, User, type LucideIcon } from "lucide-react";

export type AppNavItem = { href: string; label: string; icon: LucideIcon };

const HOME: AppNavItem = { href: "/", label: "Início", icon: Home };
const BUSCAR: AppNavItem = { href: "/buscar", label: "Buscar", icon: Search };
const COLECAO: AppNavItem = { href: "/colecao", label: "Minha coleção", icon: Heart };
const NOTICIAS: AppNavItem = { href: "/noticias", label: "Notícias", icon: Newspaper };
const SERIES: AppNavItem = { href: "/series", label: "Séries", icon: Layers };
const TROCA: AppNavItem = { href: "/troca", label: "Clube da Troca", icon: Repeat };
const ESTATISTICAS: AppNavItem = { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 };
const NOTIFICACOES: AppNavItem = { href: "/notificacoes", label: "Notificações", icon: Bell };
const PERFIL: AppNavItem = { href: "/perfil", label: "Perfil", icon: User };
const MAIS: AppNavItem = { href: "/mais", label: "Mais", icon: MoreHorizontal };

export const APP_NOTIFICATIONS_HREF = NOTIFICACOES.href;
export const APP_MAIS_HREF = MAIS.href;

/**
 * Ordem oficial única (mobile e web), docs/briefings/navegacao-mais.md:
 * Início, Buscar, Coleção, Notícias, Séries, Clube da Troca, Estatísticas,
 * Notificações, Perfil. Uma linha aqui basta para acrescentar um item —
 * a tela Mais e o menu lateral do desktop usam esta mesma lista.
 */
export const APP_NAV_ORDER: AppNavItem[] = [HOME, BUSCAR, COLECAO, NOTICIAS, SERIES, TROCA, ESTATISTICAS, NOTIFICACOES, PERFIL];

/** Barra inferior do celular: 4 itens diretos + a página `/mais`. */
export const APP_MOBILE_TABS: AppNavItem[] = [HOME, BUSCAR, COLECAO, NOTICIAS, MAIS];

const APP_MOBILE_TAB_HREFS = new Set<string>(APP_MOBILE_TABS.map((item) => item.href));

/** Itens da ordem oficial que não estão na barra: abrem dentro da aba Mais. */
export const APP_MORE_ROUTES: AppNavItem[] = APP_NAV_ORDER.filter((item) => !APP_MOBILE_TAB_HREFS.has(item.href));

export function isAppNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** O botão "Mais" da barra fica ativo na própria página e nas rotas que só existem dentro dela. */
export function isAppMoreActive(pathname: string): boolean {
  return isAppNavActive(pathname, APP_MAIS_HREF) || APP_MORE_ROUTES.some((item) => isAppNavActive(pathname, item.href));
}
