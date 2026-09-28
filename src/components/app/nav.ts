import { Heart, Home, Layers, Search, User, type LucideIcon } from "lucide-react";

export type AppNavItem = { href: string; label: string; icon: LucideIcon };

/**
 * Itens do app do colecionador (docs/briefings/app-web-lote5.md, lote 5a).
 * Espelha `tosave-mobile/src/navigation/drawerItems.ts`, restrito às
 * telas que existem nesta fase — Notícias, Notificações, Clube da Troca e
 * Estatísticas entram no lote 5b.
 */
export const APP_NAV: AppNavItem[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/series", label: "Séries", icon: Layers },
  { href: "/colecao", label: "Minha coleção", icon: Heart },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function isAppNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
