"use client";

import { ArrowLeftRight, Bell, Megaphone, Newspaper, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const TYPE_ICON: Record<string, LucideIcon> = {
  news: Newspaper,
  admin_broadcast: Megaphone,
  trade_match: ArrowLeftRight,
  trade_interest: ArrowLeftRight,
};

/** "Agora" · "há 40 min" · "há 5h" · "ontem" · "12 de mar." */
function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

/** Linha da caixa de notificações; ponto e fundo destacam as não lidas. */
export function NotificationRow({
  title,
  body,
  type,
  read,
  createdAt,
  onClick,
}: {
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  onClick?: () => void;
}) {
  const Icon = TYPE_ICON[type] ?? Bell;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border border-border p-3.5 text-left transition duration-fast hover:border-primary/40 hover:bg-surface-3/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        read ? "bg-surface" : "bg-primary-soft/40"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          read ? "bg-surface-3 text-fg-subtle" : "bg-primary-soft text-primary-text"
        )}
      >
        <Icon size={17} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("line-clamp-1 text-body-sm", read ? "font-medium text-fg" : "font-semibold text-fg")}>{title}</p>
          {!read ? <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-flame" /> : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-body-sm text-fg-muted">{body}</p>
        <p className="mt-1 text-caption text-fg-subtle">{relativeTime(createdAt)}</p>
      </div>
    </button>
  );
}

export function NotificationRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3.5">
      <div className="skeleton size-9 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-3.5 w-2/5" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-2.5 w-1/5" />
      </div>
    </div>
  );
}
