"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pager } from "@/components/admin/pager";
import { SearchInput } from "@/components/admin/search-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { NativeSelect } from "@/components/ui/select";
import type { AdminUser } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useCursorPage } from "@/lib/use-cursor-page";

const LIMIT = 20;
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function monthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]}/${d.getFullYear()}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

type Role = "" | "admin" | "user";
type Status = "" | "active" | "blocked";
type PendingAction = { user: AdminUser; kind: "promote" | "demote" | "block" };

export function UsersTab() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role>("");
  const [status, setStatus] = useState<Status>("");

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchInput className="flex-1" label="Nome ou e-mail" placeholder="Nome ou e-mail" value={q} onChange={setQ} />
        <NativeSelect aria-label="Papel" className="sm:w-48" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="">Todos os papéis</option>
          <option value="admin">Administrador</option>
          <option value="user">Colecionador</option>
        </NativeSelect>
        <NativeSelect aria-label="Status" className="sm:w-48" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="blocked">Inativo</option>
        </NativeSelect>
      </div>

      <UsersList key={`${q}:${role}:${status}`} q={q} role={role} status={status} />
    </>
  );
}

function UsersList({ q, role, status }: { q: string; role: Role; status: Status }) {
  const me = useMe();
  const page = useCursorPage<AdminUser>("users", (cursor, signal) =>
    api("/admin/users", { query: { q: q || undefined, role: role || undefined, status: status || undefined, cursor, limit: LIMIT }, signal })
  );
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (page.error) return <ErrorState onRetry={page.reload} />;

  if (page.loading || !page.data) {
    return (
      <div aria-busy="true" className="space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!page.data.items.length) {
    return q || role || status ? (
      <EmptyState kind="no-content" size="sm" description="Tente outro termo ou limpe os filtros." />
    ) : (
      <EmptyState kind="no-content" size="sm" />
    );
  }

  function updateUser(updated: AdminUser) {
    page.setData((prev) => ({ ...prev!, items: prev!.items.map((u) => (u.id === updated.id ? updated : u)) }));
  }

  async function unblock(user: AdminUser) {
    setBusyId(user.id);
    try {
      const updated = await api<AdminUser>(`/admin/users/${user.id}/unblock`, { method: "POST" });
      updateUser(updated);
      toast.success("Usuário atualizado.");
    } catch {
      toast.error("Não foi possível atualizar o usuário.");
    } finally {
      setBusyId(null);
    }
  }

  async function applyPending() {
    if (!pending) return;
    const { user, kind } = pending;
    setBusyId(user.id);
    setActionError(null);
    const route =
      kind === "promote"
        ? { path: `/admin/users/${user.id}/admin`, method: "POST" as const }
        : kind === "demote"
          ? { path: `/admin/users/${user.id}/admin`, method: "DELETE" as const }
          : { path: `/admin/users/${user.id}/block`, method: "POST" as const };
    try {
      const updated = await api<AdminUser>(route.path, { method: route.method });
      updateUser(updated);
      toast.success("Usuário atualizado.");
      setPending(null);
    } catch (err) {
      setActionError(errorMessage(err));
      toast.error("Não foi possível atualizar o usuário.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <ul className="space-y-2">
        {page.data.items.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isSelf={user.id === me.id}
            busy={busyId === user.id}
            onRoleChange={(next) => {
              if (next === user.role) return;
              setPending({ user, kind: next === "admin" ? "promote" : "demote" });
            }}
            onStatusChange={(next) => {
              if (next === user.status) return;
              if (next === "blocked") setPending({ user, kind: "block" });
              else void unblock(user);
            }}
          />
        ))}
      </ul>

      <Pager
        pageIndex={page.pageIndex}
        limit={LIMIT}
        count={page.data.items.length}
        total={page.total}
        hasNext={page.hasNext}
        onPrev={page.prev}
        onNext={page.next}
      />

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && !busyId && setPending(null)}
        title={
          pending?.kind === "promote"
            ? `Tornar ${pending.user.name} administrador?`
            : pending?.kind === "demote"
              ? `Remover acesso de administrador de ${pending.user.name}?`
              : `Desativar ${pending?.user.name}?`
        }
        confirmLabel={pending?.kind === "block" ? "Desativar" : pending?.kind === "promote" ? "Tornar administrador" : "Remover admin"}
        tone={pending?.kind === "block" ? "danger" : "primary"}
        loading={!!busyId}
        onConfirm={() => void applyPending()}
      >
        <p>
          {pending?.kind === "promote"
            ? "Terá acesso total ao painel."
            : pending?.kind === "demote"
              ? "Perde o acesso às áreas administrativas."
              : "Não conseguirá entrar até ser reativado."}
        </p>
        {actionError ? (
          <p role="alert" className="mt-2 text-danger">
            {actionError}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  );
}

function UserRow({
  user,
  isSelf,
  busy,
  onRoleChange,
  onStatusChange,
}: {
  user: AdminUser;
  isSelf: boolean;
  busy: boolean;
  onRoleChange: (role: "admin" | "user") => void;
  onStatusChange: (status: "active" | "blocked") => void;
}) {
  const disabled = isSelf || busy;
  const title = isSelf ? "Você não pode alterar a própria conta aqui." : undefined;
  return (
    <li className="flex flex-col gap-3 rounded-lg bg-surface p-4 shadow-card sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-body-sm font-bold text-primary-text">
          {initials(user.name || user.email)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-semibold text-fg">
            {user.name || "—"}
            {isSelf ? (
              <span className="inline-flex h-5 shrink-0 items-center rounded-xs bg-surface-3 px-1.5 text-[11px] font-medium text-fg-muted">Você</span>
            ) : null}
          </p>
          <p className="truncate text-body-sm text-fg-subtle">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NativeSelect
          aria-label={`Papel de ${user.name}`}
          title={title}
          disabled={disabled}
          value={user.role}
          onChange={(e) => onRoleChange(e.target.value as "admin" | "user")}
          className="w-40"
        >
          <option value="admin">Administrador</option>
          <option value="user">Colecionador</option>
        </NativeSelect>
        <NativeSelect
          aria-label={`Status de ${user.name}`}
          title={title}
          disabled={disabled}
          value={user.status}
          onChange={(e) => onStatusChange(e.target.value as "active" | "blocked")}
          className="w-32"
        >
          <option value="active">Ativo</option>
          <option value="blocked">Inativo</option>
        </NativeSelect>
      </div>
      <p className="shrink-0 text-caption text-fg-subtle sm:w-16 sm:text-right">{monthYear(user.createdAt)}</p>
    </li>
  );
}
