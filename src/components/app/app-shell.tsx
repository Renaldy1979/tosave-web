"use client";

import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeSegmented, ThemeToggle } from "@/components/ui/theme-toggle";
import { MOCK_USER } from "@/app/sites/app/_mock/data";
import { cn } from "@/lib/cn";
import { SITE_URL } from "@/lib/env";
import { APP_NAV, isAppNavActive } from "./nav";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Sidebar fixa do app (desktop `lg+`): mesmo padrão do AdminShell (componentes.md §7). */
function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-62 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo size="md" priority />
        </Link>
      </div>
      <nav aria-label="App" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {APP_NAV.map(({ href, label, icon: Icon }) => {
          const active = isAppNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-md px-3 text-body font-medium transition duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "bg-primary-soft text-primary-text" : "text-fg-muted hover:bg-surface-3 hover:text-fg"
              )}
            >
              {active ? <span aria-hidden className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r bg-primary" /> : null}
              <Icon size={20} strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-border p-3">
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center gap-3 rounded-md px-3 text-body-sm font-medium text-fg-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ExternalLink size={18} strokeWidth={1.75} aria-hidden />
          Ver site
        </a>
        <ThemeSegmented />
        <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-body-sm font-bold text-primary-text">
            {initials(MOCK_USER.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-fg">{MOCK_USER.name}</p>
            <p className="truncate text-caption text-fg-subtle">{MOCK_USER.email}</p>
          </div>
          <Link
            href="/entrar"
            aria-label="Sair"
            title="Sair"
            className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

/** Faixa ink do celular: logo + tema (componentes.md §7, Navbar). */
function MobileTopBar() {
  return (
    <header className="ink sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 px-4 lg:hidden">
      <Link href="/" aria-label="Início">
        <Logo size="sm" variant="dark" priority />
      </Link>
      <ThemeToggle />
    </header>
  );
}

/** Barra inferior de 5 itens (componentes.md §7, TabBar); 5b acrescenta "Mais". */
function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação"
      className="ink fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-white/5 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {APP_NAV.map(({ href, label, icon: Icon }) => {
        const active = isAppNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-11 flex-1 flex-col items-center justify-center gap-0.5 text-caption transition duration-fast",
              active ? "text-primary" : "text-fg-subtle hover:text-fg-muted"
            )}
          >
            <Icon size={24} strokeWidth={1.75} fill={active ? "currentColor" : "none"} aria-hidden />
            {label === "Minha coleção" ? "Coleção" : label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Casca do app do colecionador: sidebar fixa no desktop, navbar + tab bar no celular. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg lg:pl-62">
      <Sidebar />
      <MobileTopBar />
      <main className="pb-20 lg:pb-0">{children}</main>
      <MobileTabBar />
    </div>
  );
}
