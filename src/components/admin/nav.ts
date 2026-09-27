import { Car, LayoutDashboard, Layers, Newspaper, Settings, Sparkles, Tag, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; indent?: boolean };
export type NavGroup = { label: string; items: NavItem[] };

/** Menu do painel (componentes.md §7, AdminShell). */
export const NAV: NavGroup[] = [
  {
    label: "Visão geral",
    items: [{ href: "/", label: "Painel", icon: LayoutDashboard }],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/cars", label: "Miniaturas", icon: Car },
      { href: "/cars/atributes", label: "Atributos", icon: Sparkles, indent: true },
      { href: "/series", label: "Séries", icon: Layers },
      { href: "/brands", label: "Marcas", icon: Tag },
    ],
  },
  {
    label: "Comunidade",
    items: [{ href: "/news", label: "Notícias", icon: Newspaper }],
  },
  {
    label: "Sistema",
    items: [{ href: "/settings", label: "Configurações", icon: Settings }],
  },
];

const ALL_HREFS = NAV.flatMap((g) => g.items.map((i) => i.href));

/** Ativo apenas para o href mais específico (evita `/cars` e `/cars/atributes` acesos juntos). */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const matches = (h: string) => pathname === h || pathname.startsWith(`${h}/`);
  if (!matches(href)) return false;
  const best = ALL_HREFS.filter(matches).sort((a, b) => b.length - a.length)[0];
  return best === href;
}
