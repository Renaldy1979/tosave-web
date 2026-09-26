import { Car, LayoutDashboard, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

/** Menu do painel (componentes.md §7, AdminShell). */
export const NAV: NavGroup[] = [
  {
    label: "Visão geral",
    items: [{ href: "/", label: "Painel", icon: LayoutDashboard }],
  },
  {
    label: "Catálogo",
    items: [{ href: "/cars", label: "Miniaturas", icon: Car }],
  },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
