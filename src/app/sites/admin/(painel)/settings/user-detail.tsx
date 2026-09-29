"use client";

import { BadgeCheck, Laptop, LogOut, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { NativeSelect } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AdminUser, AdminUserLog, AdminUserSession } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useApi } from "@/lib/use-api";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function fmt(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

const LOG_EVENT_LABEL: Record<string, string> = {
  "session.create": "Login",
  "session.delete": "Sessão encerrada",
  "user.update.password": "Senha alterada",
  "user.update.email": "E-mail alterado",
  "user.update.name": "Nome alterado",
  "user.update.phone": "Telefone alterado",
  "user.update.status": "Status alterado",
  "user.recovery.create": "Redefinição de senha solicitada",
  "user.recovery.update": "Senha redefinida",
  "user.verification.create": "Verificação de e-mail solicitada",
  "user.verification.update": "E-mail verificado",
};

function logLabel(event: string): string {
  return LOG_EVENT_LABEL[event] ?? event;
}

type PendingAction = { kind: "promote" | "demote" | "block" };

export function UserDetail({ initialUser }: { initialUser: AdminUser }) {
  const router = useRouter();
  const me = useMe();
  const [user, setUser] = useState(initialUser);
  const isSelf = user.id === me.id;
  const title = isSelf ? "Você não pode alterar a própria conta aqui." : undefined;

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [roleBusy, setRoleBusy] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const [verifiedBusy, setVerifiedBusy] = useState(false);
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function unblock() {
    setRoleBusy(true);
    try {
      const updated = await api<AdminUser>(`/admin/users/${user.id}/unblock`, { method: "POST" });
      setUser(updated);
      toast.success("Usuário reativado.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRoleBusy(false);
    }
  }

  async function applyPending() {
    if (!pending) return;
    setRoleBusy(true);
    setPendingError(null);
    const route =
      pending.kind === "promote"
        ? { path: `/admin/users/${user.id}/admin`, method: "POST" as const }
        : pending.kind === "demote"
          ? { path: `/admin/users/${user.id}/admin`, method: "DELETE" as const }
          : { path: `/admin/users/${user.id}/block`, method: "POST" as const };
    try {
      const updated = await api<AdminUser>(route.path, { method: route.method });
      setUser(updated);
      toast.success("Usuário atualizado.");
      setPending(null);
    } catch (err) {
      setPendingError(errorMessage(err));
    } finally {
      setRoleBusy(false);
    }
  }

  async function toggleVerified(next: boolean) {
    setVerifiedBusy(true);
    try {
      const updated = await api<AdminUser>(`/admin/users/${user.id}/verify-email`, { method: "POST", body: { verified: next } });
      setUser(updated);
      toast.success(next ? "E-mail marcado como verificado." : "E-mail marcado como não verificado.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setVerifiedBusy(false);
    }
  }

  async function sendRecovery() {
    setRecoveryBusy(true);
    try {
      await api(`/admin/users/${user.id}/send-recovery`, { method: "POST" });
      toast.success("E-mail de redefinição enviado.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRecoveryBusy(false);
    }
  }

  async function handleDelete() {
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api(`/admin/users/${user.id}`, { method: "DELETE" });
      toast.success("Usuário excluído.");
      router.push("/settings?tab=usuarios");
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title={user.name || user.email}
        breadcrumb={
          <>
            Sistema /{" "}
            <a href="/settings?tab=usuarios" className="hover:text-fg">
              Configurações / Usuários
            </a>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-8">
          <section className="rounded-lg bg-surface p-5 shadow-card md:p-6">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-h3 font-bold text-primary-text">
                {initials(user.name || user.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-fg">
                  {user.name || "—"}
                  {isSelf ? <Badge variant="outline">Você</Badge> : null}
                  <Badge variant={user.role === "admin" ? "primary" : "neutral"}>{user.role === "admin" ? "Administrador" : "Colecionador"}</Badge>
                  <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status === "active" ? "Ativo" : "Inativo"}</Badge>
                </p>
                <p className="mt-0.5 truncate text-body-sm text-fg-subtle">{user.email}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-body-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-caption text-fg-subtle">Telefone</dt>
                    <dd className="text-fg">{user.phoneNumber || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-caption text-fg-subtle">Coleção</dt>
                    <dd className="text-fg">{user.collectionModels} modelos</dd>
                  </div>
                  <div>
                    <dt className="text-caption text-fg-subtle">Cadastro</dt>
                    <dd className="text-fg">{fmt(user.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-caption text-fg-subtle">Atualizado</dt>
                    <dd className="text-fg">{fmt(user.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-body-sm font-medium text-fg">Papel</p>
                <NativeSelect
                  aria-label="Papel"
                  title={title}
                  disabled={isSelf || roleBusy}
                  value={user.role}
                  onChange={(e) => {
                    const next = e.target.value as "admin" | "user";
                    if (next === user.role) return;
                    setPendingError(null);
                    setPending({ kind: next === "admin" ? "promote" : "demote" });
                  }}
                >
                  <option value="admin">Administrador</option>
                  <option value="user">Colecionador</option>
                </NativeSelect>
              </div>
              <div>
                <p className="mb-1.5 text-body-sm font-medium text-fg">Status</p>
                <NativeSelect
                  aria-label="Status"
                  title={title}
                  disabled={isSelf || roleBusy}
                  value={user.status}
                  onChange={(e) => {
                    const next = e.target.value as "active" | "blocked";
                    if (next === user.status) return;
                    if (next === "blocked") {
                      setPendingError(null);
                      setPending({ kind: "block" });
                    } else {
                      void unblock();
                    }
                  }}
                >
                  <option value="active">Ativo</option>
                  <option value="blocked">Inativo</option>
                </NativeSelect>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 rounded-md bg-surface-2 p-4">
              <div className="flex items-center gap-2 min-w-0">
                <BadgeCheck size={18} strokeWidth={1.75} className="shrink-0 text-fg-muted" aria-hidden />
                <div>
                  <label htmlFor="email-verified" className="font-medium text-fg">
                    E-mail verificado
                  </label>
                  <p className="text-body-sm text-fg-subtle">Marcação manual, espelhada do Appwrite.</p>
                </div>
              </div>
              <Switch id="email-verified" checked={user.emailVerified} disabled={verifiedBusy} onCheckedChange={(v) => void toggleVerified(v)} />
            </div>
          </section>

          <UserSessions userId={user.id} />
          <UserActivity userId={user.id} />
        </div>

        <div className="space-y-4 lg:col-span-4">
          <section className="rounded-lg bg-surface p-5 shadow-card md:p-6">
            <h2 className="mb-3 text-h3 text-fg">Senha</h2>
            <p className="mb-4 text-body-sm text-fg-subtle">Envia o e-mail de redefinição de senha (fluxo do Appwrite).</p>
            <Button variant="secondary" fullWidth loading={recoveryBusy} onClick={() => void sendRecovery()}>
              Enviar e-mail de redefinição
            </Button>
          </section>

          <section className="rounded-lg bg-surface p-5 shadow-card md:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-h3 text-fg">
              <ShieldAlert size={18} strokeWidth={1.75} className="text-danger" aria-hidden />
              Zona de risco
            </h2>
            <p className="mb-4 text-body-sm text-fg-subtle">
              {isSelf ? "Você não pode excluir a própria conta pelo painel." : "Exclui a conta do colecionador (Postgres e Appwrite)."}
            </p>
            <Button variant="danger" fullWidth disabled={isSelf} onClick={() => setConfirmDelete(true)}>
              Excluir usuário
            </Button>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !roleBusy && !o && setPending(null)}
        title={
          pending?.kind === "promote"
            ? `Tornar ${user.name} administrador?`
            : pending?.kind === "demote"
              ? `Remover acesso de administrador de ${user.name}?`
              : `Desativar ${user.name}?`
        }
        confirmLabel={pending?.kind === "block" ? "Desativar" : pending?.kind === "promote" ? "Tornar administrador" : "Remover admin"}
        tone={pending?.kind === "block" ? "danger" : "primary"}
        loading={roleBusy}
        onConfirm={() => void applyPending()}
      >
        <p>
          {pending?.kind === "promote"
            ? "Terá acesso total ao painel."
            : pending?.kind === "demote"
              ? "Perde o acesso às áreas administrativas."
              : "Não conseguirá entrar até ser reativado. Todas as sessões ativas serão encerradas."}
        </p>
        {pendingError ? (
          <p role="alert" className="mt-2 text-danger">
            {pendingError}
          </p>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(o) => !deleteBusy && setConfirmDelete(o)}
        title="Excluir usuário?"
        confirmLabel="Excluir"
        loading={deleteBusy}
        onConfirm={() => void handleDelete()}
      >
        <p>
          A conta de <strong className="text-fg">{user.name || user.email}</strong> será excluída, junto com a coleção, anúncios de troca e garagens.
          Essa ação não pode ser desfeita.
        </p>
        {deleteError ? (
          <p role="alert" className="mt-2 text-danger">
            {deleteError}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  );
}

function sessionTitle(s: AdminUserSession): string {
  return s.device || s.client || "Sessão";
}

function sessionMeta(s: AdminUserSession): string {
  return [s.client && s.client !== sessionTitle(s) ? s.client : null, s.os, s.country, s.ip].filter(Boolean).join(" · ");
}

function UserSessions({ userId }: { userId: string }) {
  const { data, error, loading, setData, reload } = useApi(`admin-user-sessions:${userId}`, (signal) =>
    api<AdminUserSession[]>(`/admin/users/${userId}/sessions`, { signal })
  );
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmOne, setConfirmOne] = useState<AdminUserSession | null>(null);
  const [busy, setBusy] = useState(false);

  async function endAll() {
    setBusy(true);
    try {
      await api(`/admin/users/${userId}/sessions`, { method: "DELETE" });
      setData([]);
      toast.success("Todas as sessões foram encerradas.");
      setConfirmAll(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function endOne(session: AdminUserSession) {
    setBusy(true);
    try {
      await api(`/admin/users/${userId}/sessions/${session.id}`, { method: "DELETE" });
      setData((prev) => (prev ?? []).filter((s) => s.id !== session.id));
      toast.success("Sessão encerrada.");
      setConfirmOne(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg bg-surface p-5 shadow-card md:p-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-h3 text-fg">Sessões ativas</h2>
        {data && data.length > 0 ? (
          <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={() => setConfirmAll(true)}>
            Encerrar todas
          </Button>
        ) : null}
      </header>

      {error ? (
        <ErrorState compact onRetry={reload} message="Não foi possível carregar as sessões." />
      ) : loading || !data ? (
        <div aria-busy="true" className="space-y-2">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))}
        </div>
      ) : !data.length ? (
        <EmptyState kind="no-content" size="sm" description="Nenhuma sessão ativa no momento." />
      ) : (
        <ul className="space-y-2">
          {data.map((session) => (
            <li key={session.id} className="flex items-center gap-3 rounded-md bg-surface-2 p-3">
              <Laptop size={18} strokeWidth={1.75} className="shrink-0 text-fg-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{sessionTitle(session)}</p>
                <p className="truncate text-caption text-fg-subtle">{sessionMeta(session)}</p>
              </div>
              <p className="hidden shrink-0 text-caption text-fg-subtle sm:block">Expira {fmt(session.expiresAt)}</p>
              <Button variant="ghost" size="sm" leftIcon={LogOut} onClick={() => setConfirmOne(session)}>
                Encerrar
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog open={confirmAll} onOpenChange={(o) => !busy && setConfirmAll(o)} title="Encerrar todas as sessões?" confirmLabel="Encerrar todas" loading={busy} onConfirm={() => void endAll()}>
        O usuário precisará entrar novamente em todos os aparelhos.
      </ConfirmDialog>

      <ConfirmDialog
        open={!!confirmOne}
        onOpenChange={(o) => !busy && !o && setConfirmOne(null)}
        title="Encerrar sessão?"
        confirmLabel="Encerrar"
        loading={busy}
        onConfirm={() => confirmOne && void endOne(confirmOne)}
      >
        {confirmOne ? (
          <>
            A sessão em <strong className="text-fg">{sessionTitle(confirmOne)}</strong> será encerrada.
          </>
        ) : null}
      </ConfirmDialog>
    </section>
  );
}

function UserActivity({ userId }: { userId: string }) {
  const { data, error, loading, reload } = useApi(`admin-user-logs:${userId}`, (signal) => api<AdminUserLog[]>(`/admin/users/${userId}/logs`, { signal }));

  return (
    <section className="rounded-lg bg-surface p-5 shadow-card md:p-6">
      <h2 className="mb-4 text-h3 text-fg">Atividades</h2>

      {error ? (
        <ErrorState compact onRetry={reload} message="Não foi possível carregar as atividades." />
      ) : loading || !data ? (
        <div aria-busy="true" className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
      ) : !data.length ? (
        <EmptyState kind="no-content" size="sm" description="Nenhuma atividade registrada." />
      ) : (
        <ul className="max-h-80 space-y-1 overflow-y-auto">
          {data.map((log, i) => (
            <li key={`${log.event}-${log.createdAt}-${i}`} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-body-sm hover:bg-surface-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-fg">{logLabel(log.event)}</p>
                <p className="truncate text-caption text-fg-subtle">
                  {[log.device ?? log.client, log.os, log.country, log.ip].filter(Boolean).join(" · ")}
                </p>
              </div>
              <p className="shrink-0 text-caption text-fg-subtle">{fmt(log.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
