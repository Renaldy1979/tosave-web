"use client";

import { Bell, FileText, Info, LogOut, Mail, ShieldCheck, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Logo } from "@/components/ui/logo";
import { ThemeSegmented, ThemeToggle } from "@/components/ui/theme-toggle";
import { useAppConfig } from "@/lib/app-config";
import { useAuth, useMe } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useNotificationsUnread } from "@/lib/notifications-unread";
import { APP_MOBILE_TABS, APP_NAV_ORDER, APP_NOTIFICATIONS_HREF, isAppMoreActive, isAppNavActive } from "./nav";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Sino de notificações (celular e desktop), com contador de não lidas. */
function NotificationBell({ className }: { className?: string }) {
  const { count } = useNotificationsUnread();
  return (
    <Link
      href={APP_NOTIFICATIONS_HREF}
      aria-label={count > 0 ? `Notificações, ${count} não lidas` : "Notificações"}
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-md text-fg-muted transition duration-fast hover:bg-surface-3 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <Bell size={20} strokeWidth={1.75} aria-hidden />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-flame px-1 font-mono text-[10px] leading-none text-white"
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}

/** Sidebar fixa do app (desktop `lg+`): ordem oficial única, ajuda e sair separados (docs/briefings/navegacao-mais.md). */
function Sidebar() {
  const pathname = usePathname();
  const me = useMe();
  const { signOut } = useAuth();
  const router = useRouter();
  const { data: config } = useAppConfig();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-62 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link href="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo size="md" priority />
        </Link>
        <NotificationBell />
      </div>
      <nav aria-label="App" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {APP_NAV_ORDER.map(({ href, label, icon: Icon }) => {
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
        {config && (config.supportEmail || config.privacyUrl || config.termsUrl) ? (
          <div>
            <p className="px-3 pb-1 font-condensed text-eyebrow text-fg-subtle uppercase">Ajuda e informações</p>
            <div className="space-y-0.5">
              {config.supportEmail ? <SidebarHelpLink icon={Mail} label="Falar com o suporte" href={`mailto:${config.supportEmail}`} /> : null}
              {config.privacyUrl ? <SidebarHelpLink icon={ShieldCheck} label="Política de privacidade" href={config.privacyUrl} external /> : null}
              {config.termsUrl ? <SidebarHelpLink icon={FileText} label="Termos de uso" href={config.termsUrl} external /> : null}
              <div className="flex h-9 items-center gap-3 px-3 text-caption text-fg-subtle">
                <Info size={16} strokeWidth={1.75} aria-hidden />
                Sobre o ToSave · ToSave web
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setSignOutOpen(true)}
          className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-body font-medium text-danger transition duration-fast hover:bg-surface-3"
        >
          <LogOut size={20} strokeWidth={1.75} aria-hidden />
          Sair
        </button>

        <div className="flex items-center gap-3 border-t border-border pt-3">
          <ThemeSegmented />
        </div>
        <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-body-sm font-bold text-primary-text">
            {initials(me.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-fg">{me.name}</p>
            <p className="truncate text-caption text-fg-subtle">{me.email}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sair da conta?"
        confirmLabel="Sair"
        loading={signingOut}
        onConfirm={() => {
          setSigningOut(true);
          void signOut().then(() => router.push("/entrar"));
        }}
      >
        <p>Você pode entrar de novo quando quiser com o mesmo e-mail e senha.</p>
      </ConfirmDialog>
    </aside>
  );
}

function SidebarHelpLink({ icon: Icon, label, href, external }: { icon: LucideIcon; label: string; href: string; external?: boolean }) {
  const cls =
    "flex h-9 items-center gap-3 rounded-md px-3 text-caption text-fg-muted transition duration-fast hover:bg-surface-3 hover:text-fg";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <Icon size={16} strokeWidth={1.75} aria-hidden />
        {label}
      </a>
    );
  }
  return (
    <a href={href} className={cls}>
      <Icon size={16} strokeWidth={1.75} aria-hidden />
      {label}
    </a>
  );
}

/** Faixa ink do celular: logo + sino + tema (componentes.md §7, Navbar). */
function MobileTopBar() {
  return (
    <header className="ink sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 px-4 lg:hidden">
      <Link href="/" aria-label="Início">
        <Logo size="sm" variant="dark" priority />
      </Link>
      <div className="flex items-center gap-0.5">
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}

/** Barra inferior de 5 itens (componentes.md §7, TabBar): 4 diretos + a página "Mais". */
function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação"
      className="ink fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-white/5 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {APP_MOBILE_TABS.map(({ href, label, icon: Icon }) => {
        const active = href === "/mais" ? isAppMoreActive(pathname) : isAppNavActive(pathname, href);
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
