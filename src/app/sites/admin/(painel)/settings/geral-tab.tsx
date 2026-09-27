"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState, type InputHTMLAttributes } from "react";
import { Controller, useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ActionBar, FormError } from "@/components/admin/form-parts";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { fieldClass } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AdminConfig } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/use-api";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

const urlOrEmpty = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.+/.test(v), `${label}: use o formato esquema://…`);

const schema = z.object({
  termsUrl: urlOrEmpty("Termos de uso"),
  privacyUrl: urlOrEmpty("Política de privacidade"),
  supportEmail: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail de suporte inválido."),
  passwordRecoveryUrl: urlOrEmpty("Recuperação de senha"),
  minAppVersion: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d+\.\d+\.\d+$/.test(v), "Versão no formato N.N.N (ex.: 1.4.0)."),
  minMembersToShow: z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v), "Use um número inteiro, 0 ou mais."),
  notifyOnNews: z.boolean(),
});

type Values = z.infer<typeof schema>;

function toValues(config: AdminConfig): Values {
  return {
    termsUrl: config.termsUrl,
    privacyUrl: config.privacyUrl,
    supportEmail: config.supportEmail,
    passwordRecoveryUrl: config.passwordRecoveryUrl,
    minAppVersion: config.minAppVersion,
    minMembersToShow: String(config.minMembersToShow),
    notifyOnNews: config.notifyOnNews,
  };
}

export function GeralTab() {
  const { data, error, loading, reload } = useApi("app-config", (signal) => api<AdminConfig>("/admin/config", { signal }));

  if (error) return <ErrorState onRetry={reload} />;

  if (loading || !data) {
    return (
      <div aria-busy="true" className="max-w-[880px] space-y-4">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  return <GeralForm config={data} onSaved={reload} />;
}

function GeralForm({ config, onSaved }: { config: AdminConfig; onSaved: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(config), mode: "onBlur" });

  useEffect(() => reset(toValues(config)), [config, reset]);
  useUnsavedGuard(isDirty && !isSubmitting);

  function onInvalid(errs: FieldErrors<Values>) {
    const first = (Object.keys(errs) as (keyof Values)[])[0];
    if (first) setFocus(first);
    toast.error("Revise os campos destacados.");
  }

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null);
    const patch: Partial<AdminConfig> = {};
    for (const key of Object.keys(dirtyFields) as (keyof Values)[]) {
      if (key === "minMembersToShow") patch.minMembersToShow = Number(v.minMembersToShow);
      else if (key === "notifyOnNews") patch.notifyOnNews = v.notifyOnNews;
      else patch[key] = v[key].trim();
    }
    if (!Object.keys(patch).length) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }
    try {
      await api<AdminConfig>("/admin/config", { method: "PUT", body: patch });
      toast.success("Configurações salvas.");
      onSaved();
    } catch (err) {
      setServerError(errorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, onInvalid);

  const saving = isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-[880px]">
      <FormError message={serverError} />

      <div className="mt-4 rounded-lg bg-surface p-5 shadow-card md:p-6">
        <h2 className="text-h3 text-fg">Links legais e de suporte</h2>
        <p className="text-body-sm text-fg-subtle">Usados no app e no site do colecionador.</p>

        <SettingsRow label="Termos de uso" hint="URL completa (https://…)." error={errors.termsUrl?.message} field={register("termsUrl")} placeholder="https://tosave.cloud/termos" disabled={saving} />
        <SettingsRow label="Política de privacidade" hint="URL completa (https://…)." error={errors.privacyUrl?.message} field={register("privacyUrl")} placeholder="https://tosave.cloud/privacidade" disabled={saving} />
        <SettingsRow
          label="Recuperação de senha"
          hint="URL de callback do Appwrite (appwrite-callback-…://…)."
          error={errors.passwordRecoveryUrl?.message}
          field={register("passwordRecoveryUrl")}
          placeholder="appwrite-callback-…://recuperar-senha"
          disabled={saving}
        />
        <SettingsRow
          label="E-mail de suporte"
          hint="Aparece nos contatos do app."
          error={errors.supportEmail?.message}
          field={register("supportEmail")}
          placeholder="suporte@tosave.cloud"
          type="email"
          disabled={saving}
          last
        />
      </div>

      <div className="mt-4 rounded-lg bg-surface p-5 shadow-card md:p-6">
        <h2 className="text-h3 text-fg">Versão do app</h2>
        <p className="text-body-sm text-fg-subtle">Controla o aviso de atualização obrigatória.</p>

        <SettingsRow
          label="Versão mínima"
          hint="Vazio esconde o aviso de atualização."
          error={errors.minAppVersion?.message}
          field={register("minAppVersion")}
          placeholder="1.4.0"
          disabled={saving}
          last
        />
      </div>

      <div className="mt-4 rounded-lg bg-surface p-5 shadow-card md:p-6">
        <h2 className="text-h3 text-fg">Site institucional</h2>
        <p className="text-body-sm text-fg-subtle">Controla o que aparece em tosave.cloud.</p>

        <SettingsRow
          label="Mínimo de membros para exibir no site"
          hint="Abaixo desse total, a contagem de colecionadores fica escondida na home."
          error={errors.minMembersToShow?.message}
          field={register("minMembersToShow")}
          placeholder="100"
          inputMode="numeric"
          disabled={saving}
          last
        />
      </div>

      <div className="mt-4 rounded-lg bg-surface p-5 shadow-card md:p-6">
        <h2 className="text-h3 text-fg">Notificações</h2>
        <p className="text-body-sm text-fg-subtle">Avisos automáticos enviados pelo próprio servidor.</p>

        <div className="flex items-start justify-between gap-4 py-4">
          <div>
            <label htmlFor="notifyOnNews" className="font-medium text-fg">
              Notificar todos ao publicar notícia
            </label>
            <p className="mt-1 text-body-sm text-fg-subtle">Manda push e caixa de entrada pra toda a comunidade quando uma notícia é publicada.</p>
          </div>
          <Controller
            control={control}
            name="notifyOnNews"
            render={({ field }) => (
              <Switch id="notifyOnNews" checked={field.value} disabled={saving} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <ActionBar dirty={isDirty} saving={saving} saveLabel="Salvar" onCancel={() => reset(toValues(config))} />
    </form>
  );
}

function SettingsRow({
  label,
  hint,
  error,
  field,
  placeholder,
  type = "text",
  inputMode,
  disabled,
  last,
}: {
  label: string;
  hint?: string;
  error?: string;
  field: UseFormRegisterReturn;
  placeholder?: string;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
  last?: boolean;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={cn("grid gap-2 py-4 md:grid-cols-[1fr_320px] md:gap-4", !last && "border-b border-border")}>
      <div>
        <label htmlFor={id} className="font-medium text-fg">
          {label}
        </label>
        {hint ? <p className="text-body-sm text-fg-subtle">{hint}</p> : null}
      </div>
      <div>
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? msgId : undefined}
          className={fieldClass}
          {...field}
        />
        {error ? (
          <p id={msgId} className="mt-1 text-caption text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
