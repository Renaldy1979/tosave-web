"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeSegmented, ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth, useMe } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { SITE_URL } from "@/lib/env";
import { isActive, NAV } from "./nav";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const me = useMe();
  const { signOut } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/" onClick={onNavigate} className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo size="md" priority />
        </Link>
      </div>
      <nav aria-label="Painel" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 font-condensed text-eyebrow text-fg-subtle uppercase">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, indent }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-10 items-center gap-3 rounded-md px-3 text-body-sm font-medium transition duration-fast",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        indent && "ml-4",
                        active ? "bg-primary-soft text-primary-text" : "text-fg-muted hover:bg-surface-3 hover:text-fg"
                      )}
                    >
                      {active ? <span aria-hidden className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r bg-primary" /> : null}
                      <Icon size={18} strokeWidth={1.75} aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
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
            {initials(me.name || me.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-fg">{me.name || "Admin"}</p>
            <p className="truncate text-caption text-fg-subtle">{me.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Sair"
            title="Sair"
            className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Sidebar fixa em `lg+`; abaixo disso, topbar ink com menu em drawer. */
export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh lg:pl-62">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-62 border-r border-border bg-surface lg:block">
        <SidebarContent />
      </aside>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <header className="ink sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 px-2 lg:hidden">
          <div className="flex items-center gap-1">
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label="Abrir menu"
                className="flex size-11 items-center justify-center rounded-md text-fg hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu size={24} strokeWidth={1.75} />
              </button>
            </Dialog.Trigger>
            <Link href="/" aria-label="Painel">
              <Logo size="sm" variant="dark" priority />
            </Link>
          </div>
          <ThemeToggle />
        </header>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 animate-fade-in bg-overlay/70 backdrop-blur-sm lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-60 w-[280px] max-w-[85vw] animate-drawer-in bg-surface shadow-modal focus:outline-none lg:hidden">
            <Dialog.Title className="sr-only">Menu do painel</Dialog.Title>
            <Dialog.Description className="sr-only">Navegação entre as seções do painel.</Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar menu"
                className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-md text-fg-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </Dialog.Close>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}

/** Cabeçalho de página: breadcrumb + título + ações. */
export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        {breadcrumb ? <div className="mb-1 text-body-sm text-fg-subtle">{breadcrumb}</div> : null}
        <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">{title}</h1>
        {description ? <p className="mt-1 text-body text-fg-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
