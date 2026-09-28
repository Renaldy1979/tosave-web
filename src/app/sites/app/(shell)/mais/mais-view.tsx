"use client";

import { ChevronRight, FileText, Info, LogOut, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ListRow } from "@/components/ui/list-row";
import { useAppConfig } from "@/lib/app-config";
import { useAuth, useMe } from "@/lib/auth";
import { useNotificationsUnread } from "@/lib/notifications-unread";
import { APP_NAV_ORDER, APP_NOTIFICATIONS_HREF, isAppNavActive } from "@/components/app/nav";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Tela "Mais" (docs/briefings/navegacao-mais.md): árvore de navegação completa + itens estacionados. */
export function MaisView() {
  const router = useRouter();
  const pathname = usePathname();
  const me = useMe();
  const { signOut } = useAuth();
  const { count } = useNotificationsUnread();
  const { data: config } = useAppConfig();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Mais</h1>

      <Link
        href="/perfil"
        className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition duration-fast hover:bg-surface-3/50"
      >
        <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-h3 font-bold text-primary-text">
          {initials(me.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold text-fg">{me.name}</p>
          <p className="truncate text-body-sm text-fg-muted">{me.email}</p>
        </div>
        <ChevronRight size={18} strokeWidth={1.75} className="text-fg-subtle" aria-hidden />
      </Link>

      <div className="mt-8">
        <p className="mb-2 font-condensed text-eyebrow text-fg-subtle uppercase">Navegação</p>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {APP_NAV_ORDER.map(({ href, label, icon: Icon }) => (
            <ListRow
              key={href}
              icon={Icon}
              label={label}
              href={href}
              active={isAppNavActive(pathname, href)}
              value={href === APP_NOTIFICATIONS_HREF && count > 0 ? (count > 9 ? "9+" : String(count)) : undefined}
            />
          ))}
        </div>
      </div>

      {config && (config.supportEmail || config.privacyUrl || config.termsUrl) ? (
        <div className="mt-8">
          <p className="mb-2 font-condensed text-eyebrow text-fg-subtle uppercase">Ajuda e informações</p>
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {config.supportEmail ? <ListRow icon={Mail} label="Falar com o suporte" href={`mailto:${config.supportEmail}`} showChevron={false} /> : null}
            {config.privacyUrl ? <ListRow icon={ShieldCheck} label="Política de privacidade" href={config.privacyUrl} external /> : null}
            {config.termsUrl ? <ListRow icon={FileText} label="Termos de uso" href={config.termsUrl} external /> : null}
            <ListRow icon={Info} label="Sobre o ToSave" value="ToSave web" showChevron={false} />
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <ListRow icon={LogOut} label="Sair" danger showChevron={false} onClick={() => setSignOutOpen(true)} />
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
    </div>
  );
}
