"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BellRing, Megaphone, Newspaper, Radio } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/admin/admin-shell";
import { FormError, FormSection, RequiredLabel, Textarea } from "@/components/admin/form-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Field, fieldClass } from "@/components/ui/input";
import type { AdminNotification, AdminUser, Page } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useCursorPage } from "@/lib/use-cursor-page";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

const TITLE_MAX = 120;
const BODY_MAX = 500;
const LIMIT = 20;

const schema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(TITLE_MAX, `Título: até ${TITLE_MAX} caracteres.`),
  body: z.string().trim().min(1, "Informe o texto.").max(BODY_MAX, `Texto: até ${BODY_MAX} caracteres.`),
});
type Values = z.infer<typeof schema>;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const TYPE_LABEL: Record<string, string> = {
  admin_broadcast: "Aviso manual",
  news: "Notícia publicada",
};

export function NotificationsView() {
  const [refreshNonce, setRefreshNonce] = useState(0);

  return (
    <>
      <PageHeader title="Avisos" breadcrumb="Comunidade" description="Envie um aviso para todos os colecionadores." />

      <BroadcastForm onSent={() => setRefreshNonce((n) => n + 1)} />

      <div className="mt-8">
        <h2 className="mb-3 text-h3 text-fg">Histórico</h2>
        <NotificationsHistory key={refreshNonce} />
      </div>
    </>
  );
}

function BroadcastForm({ onSent }: { onSent: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const usersTotal = useApi("users-total", (signal) =>
    api<Page<AdminUser>>("/admin/users", { query: { limit: 1 }, signal }).then((p) => p.total ?? null)
  );

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    control,
    formState: { errors, dirtyFields },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "", body: "" }, mode: "onBlur" });

  const dirty = Object.keys(dirtyFields).length > 0;
  useUnsavedGuard(dirty && !sending);

  const values = useWatch({ control }) as Values;

  function onInvalid(errs: FieldErrors<Values>) {
    if (errs.title) setFocus("title");
    else if (errs.body) setFocus("body");
    toast.error("Revise os campos destacados.");
  }

  const onValid = handleSubmit(() => setConfirmOpen(true), onInvalid);

  async function confirmSend() {
    setSending(true);
    setServerError(null);
    try {
      await api("/admin/notifications/broadcast", { method: "POST", body: { title: values.title.trim(), body: values.body.trim() } });
      toast.success("Aviso enviado para todos.");
      reset({ title: "", body: "" });
      setConfirmOpen(false);
      onSent();
    } catch (err) {
      setServerError(errorMessage(err));
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onValid} noValidate>
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-7">
          <FormError message={serverError} />
          <FormSection n={1} title="Enviar para todos" invalid={!!(errors.title || errors.body)}>
            <div className="space-y-4">
              <Field label={<RequiredLabel>Título</RequiredLabel>} error={errors.title?.message}>
                {({ id, describedBy }) => (
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={errors.title ? true : undefined}
                    className={fieldClass}
                    placeholder="Nova série chegou à vitrine"
                    {...register("title")}
                  />
                )}
              </Field>
              <Field label={<RequiredLabel>Texto</RequiredLabel>} error={errors.body?.message}>
                {({ id, describedBy }) => (
                  <div>
                    <Textarea id={id} aria-describedby={describedBy} invalid={!!errors.body} className="min-h-[100px]" {...register("body")} />
                    <p className="mt-1 text-right text-caption text-fg-subtle">
                      {values.body?.length ?? 0}/{BODY_MAX}
                    </p>
                  </div>
                )}
              </Field>
            </div>
          </FormSection>

          <Button type="submit" size="lg" leftIcon={Radio}>
            Enviar para todos
          </Button>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-8 space-y-3">
            <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Prévia no celular</p>
            <PushPreview title={values.title} body={values.body} />
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !sending && setConfirmOpen(o)}
        title="Enviar para todos?"
        confirmLabel="Enviar para todos"
        loading={sending}
        onConfirm={() => void confirmSend()}
      >
        <p>
          Isso vai mandar push e aparecer na caixa de entrada de{" "}
          <strong className="text-fg">
            {usersTotal.data !== undefined && usersTotal.data !== null ? `${usersTotal.data} usuário(s)` : "todos os usuários"}
          </strong>
          .
        </p>
        <p className="mt-2">Não pode ser desfeito.</p>
        <div className="mt-3 rounded-md border border-border bg-surface-2 p-3">
          <p className="line-clamp-1 text-body-sm font-semibold text-fg">{values.title}</p>
          <p className="line-clamp-2 text-body-sm text-fg-muted">{values.body}</p>
        </div>
      </ConfirmDialog>
    </form>
  );
}

function PushPreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3 shadow-pop">
      <div className="flex items-start gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-flame text-primary-fg">
          <BellRing size={18} strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-body-sm font-semibold text-fg">{title.trim() || "Título do aviso"}</p>
            <span className="shrink-0 text-caption text-fg-subtle">agora</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-body-sm text-fg-muted">{body.trim() || "Texto do aviso."}</p>
        </div>
      </div>
    </div>
  );
}

function NotificationsHistory() {
  const page = useCursorPage<AdminNotification>("notifications-history", (cursor, signal) =>
    api("/admin/notifications", { query: { cursor, limit: LIMIT }, signal })
  );

  if (page.error) return <ErrorState onRetry={page.reload} />;

  if (page.loading || !page.data) {
    return (
      <div aria-busy="true" className="overflow-hidden rounded-lg bg-surface shadow-card">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="border-b border-border p-4 last:border-0">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="mt-2 h-3.5 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!page.data.items.length) {
    return (
      <div className="rounded-lg bg-surface shadow-card">
        <EmptyState kind="no-content" description="Nenhum aviso enviado ainda." />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-surface shadow-card">
      <ul className="divide-y divide-border">
        {page.data.items.map((n) => (
          <li key={n.id} className="flex items-start gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-text">
              {n.type === "news" ? (
                <Newspaper size={16} strokeWidth={1.75} aria-hidden />
              ) : (
                <Megaphone size={16} strokeWidth={1.75} aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-fg">{n.title}</p>
                <Badge variant="outline" size="sm">
                  {TYPE_LABEL[n.type] ?? n.type}
                </Badge>
                {n.broadcast ? (
                  <Badge variant="primary" size="sm">
                    Todo mundo
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 line-clamp-2 text-body-sm text-fg-muted">{n.body}</p>
              <p className="mt-1 text-caption text-fg-subtle">
                {dateFormatter.format(new Date(n.createdAt))} · {n.createdBy ? "Manual" : "Automático"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
