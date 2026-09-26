"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/admin/admin-shell";
import { ActionBar, FormError, FormSection, RequiredLabel, Textarea } from "@/components/admin/form-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, fieldClass } from "@/components/ui/input";
import type { AdminAttribute } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { invalidateCatalog } from "@/lib/catalog";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

const schema = z.object({
  title: z.string().trim().min(1, "Informe o nome do atributo.").max(80, "Nome: até 80 caracteres."),
  description: z.string().trim().max(500, "Descrição: até 500 caracteres."),
});

type Values = z.infer<typeof schema>;

function toValues(attribute: AdminAttribute | null): Values {
  return { title: attribute?.title ?? "", description: attribute?.description ?? "" };
}

const nullIfEmpty = (v: string) => (v.trim() === "" ? null : v.trim());

export function AttributeForm({ attribute: initialAttribute }: { attribute: AdminAttribute | null }) {
  const router = useRouter();
  const isEdit = initialAttribute !== null;
  const [attribute, setAttribute] = useState(initialAttribute);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(initialAttribute), mode: "onBlur" });

  useUnsavedGuard(isDirty && !isSubmitting);
  const { title } = useWatch({ control }) as Values;

  function onInvalid(errs: FieldErrors<Values>) {
    if (errs.title) setFocus("title");
    else if (errs.description) setFocus("description");
    toast.error("Revise os campos destacados.");
  }

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null);
    const input = { title: v.title.trim(), description: nullIfEmpty(v.description) };
    try {
      if (!isEdit) {
        await api<AdminAttribute>("/admin/attributes", { method: "POST", body: input });
        invalidateCatalog("attributes");
        toast.success("Atributo salvo.");
        router.push("/cars/atributes");
        return;
      }
      const patch: Partial<typeof input> = {};
      for (const key of Object.keys(dirtyFields) as (keyof Values)[]) {
        (patch as Record<string, unknown>)[key] = input[key as keyof typeof input];
      }
      if (!Object.keys(patch).length) {
        toast.info("Nenhuma alteração para salvar.");
        return;
      }
      const updated = await api<AdminAttribute>(`/admin/attributes/${attribute!.id}`, { method: "PUT", body: patch });
      setAttribute(updated);
      reset(toValues(updated));
      invalidateCatalog("attributes");
      toast.success("Atributo salvo.");
      router.push("/cars/atributes");
    } catch (err) {
      setServerError(errorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, onInvalid);

  async function handleDelete() {
    if (!attribute) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/attributes/${attribute.id}`, { method: "DELETE" });
      invalidateCatalog("attributes");
      toast.success("Atributo excluído.");
      router.push("/cars/atributes");
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function cancel() {
    if (isDirty) setConfirmLeave(true);
    else router.push("/cars/atributes");
  }

  const saving = isSubmitting;

  return (
    <>
      <PageHeader
        title={isEdit ? attribute!.title : "Novo atributo"}
        breadcrumb={
          <>
            Catálogo / Miniaturas /{" "}
            <Link href="/cars/atributes" className="hover:text-fg">
              Atributos
            </Link>{" "}
            / {isEdit ? "Editar" : "Novo"}
          </>
        }
      />

      <form onSubmit={onSubmit} noValidate className="max-w-[640px]">
        <FormError message={serverError} />

        <FormSection n={1} title="Dados" invalid={!!(errors.title || errors.description)}>
          <div className="space-y-4">
            <Field label={<RequiredLabel>Nome</RequiredLabel>} error={errors.title?.message}>
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={errors.title ? true : undefined}
                  className={fieldClass}
                  placeholder="Treasure Hunt"
                  disabled={saving}
                  {...register("title")}
                />
              )}
            </Field>
            <Field label="Descrição" error={errors.description?.message}>
              {({ id, describedBy }) => (
                <Textarea id={id} aria-describedby={describedBy} invalid={!!errors.description} disabled={saving} {...register("description")} />
              )}
            </Field>
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-fg">Pré-visualização</p>
              <Badge variant="accent" icon={Sparkles} size="md" className="font-sans">
                {title.trim() || "Nome do atributo"}
              </Badge>
            </div>
          </div>
        </FormSection>

        <ActionBar
          dirty={isDirty}
          saving={saving}
          saveLabel={isEdit ? "Salvar alterações" : "Salvar atributo"}
          onCancel={cancel}
          left={
            isEdit ? (
              <Button type="button" variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => setConfirmDelete(true)} disabled={saving}>
                Excluir
              </Button>
            ) : undefined
          }
        />
      </form>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Descartar alterações?"
        confirmLabel="Descartar"
        onConfirm={() => {
          setConfirmLeave(false);
          reset();
          router.push("/cars/atributes");
        }}
      >
        As alterações feitas neste formulário serão perdidas.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(o) => !deleting && setConfirmDelete(o)}
        title="Excluir atributo?"
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      >
        <p>
          <strong className="text-fg">{attribute?.title}</strong> será removido de {attribute?.carCount ?? 0} miniaturas.
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
