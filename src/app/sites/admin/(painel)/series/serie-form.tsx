"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Info, Layers } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/admin/admin-shell";
import { ActionBar, FormError, FormSection, RequiredLabel, Textarea } from "@/components/admin/form-parts";
import { ImageUpload, useObjectUrl } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, fieldClass } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AdminSerie } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { serieLogoUrl } from "@/lib/appwrite";
import { invalidateCatalog } from "@/lib/catalog";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

const MAX_LOGO_MB = 5;

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome da série.").max(200, "Nome: até 200 caracteres."),
  description: z.string().trim().max(2000, "Descrição: até 2000 caracteres."),
  isDefault: z.boolean(),
});

type Values = z.infer<typeof schema>;

function toValues(serie: AdminSerie | null): Values {
  return { name: serie?.name ?? "", description: serie?.description ?? "", isDefault: serie?.isDefault ?? false };
}

const nullIfEmpty = (v: string) => (v.trim() === "" ? null : v.trim());

function uploadLogo(serieId: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return api<AdminSerie>(`/admin/series/${serieId}/logo`, { method: "POST", body });
}

export function SerieForm({ serie: initialSerie, featuredCount }: { serie: AdminSerie | null; featuredCount: number }) {
  const router = useRouter();
  const isEdit = initialSerie !== null;
  const [serie, setSerie] = useState(initialSerie);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const pendingUrl = useObjectUrl(pendingFile);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [confirmRemoveImage, setConfirmRemoveImage] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(initialSerie), mode: "onBlur" });

  const dirty = isDirty || pendingFile !== null;
  useUnsavedGuard(dirty && !isSubmitting);

  const values = useWatch({ control }) as Values;
  const imageSrc = pendingUrl ?? serieLogoUrl(serie?.imageFileId);

  function onInvalid(errs: FieldErrors<Values>) {
    if (errs.name) setFocus("name");
    else if (errs.description) setFocus("description");
    toast.error("Revise os campos destacados.");
  }

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null);
    const input = { name: v.name.trim(), description: nullIfEmpty(v.description), isDefault: v.isDefault };
    try {
      if (!isEdit) {
        const created = await api<AdminSerie>("/admin/series", { method: "POST", body: input });
        if (pendingFile) {
          try {
            await uploadLogo(created.id, pendingFile);
          } catch (err) {
            toast.error(`Série cadastrada, mas o logo não subiu: ${errorMessage(err)}`);
            invalidateCatalog();
            router.push(`/series/${created.id}/edit`);
            return;
          }
        }
        invalidateCatalog();
        toast.success("Série salva.");
        router.push("/series");
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
      const updated = await api<AdminSerie>(`/admin/series/${serie!.id}`, { method: "PUT", body: patch });
      setSerie(updated);
      reset(toValues(updated));
      invalidateCatalog();
      toast.success("Série salva.");
      router.push("/series");
    } catch (err) {
      setServerError(errorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, onInvalid);

  async function replaceImage(file: File) {
    if (!isEdit) {
      setPendingFile(file);
      setImageError(null);
      return;
    }
    setImageBusy(true);
    setImageError(null);
    try {
      const updated = await uploadLogo(serie!.id, file);
      setSerie(updated);
      invalidateCatalog();
      toast.success("Logo atualizado.");
    } catch (err) {
      setImageError(errorMessage(err));
    } finally {
      setImageBusy(false);
    }
  }

  async function removeImage() {
    if (!isEdit) {
      setPendingFile(null);
      return;
    }
    setImageBusy(true);
    setImageError(null);
    try {
      const updated = await api<AdminSerie>(`/admin/series/${serie!.id}/logo`, { method: "DELETE" });
      setSerie(updated);
      invalidateCatalog();
      setConfirmRemoveImage(false);
      toast.success("Logo removido.");
    } catch (err) {
      setImageError(errorMessage(err));
      setConfirmRemoveImage(false);
    } finally {
      setImageBusy(false);
    }
  }

  async function handleDelete() {
    if (!serie) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/series/${serie.id}`, { method: "DELETE" });
      invalidateCatalog();
      toast.success("Série excluída.");
      router.push("/series");
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function cancel() {
    if (dirty) setConfirmLeave(true);
    else router.push("/series");
  }

  const saving = isSubmitting;

  return (
    <>
      <PageHeader
        title={isEdit ? serie!.name : "Nova série"}
        breadcrumb={
          <>
            Catálogo /{" "}
            <Link href="/series" className="hover:text-fg">
              Séries
            </Link>{" "}
            / {isEdit ? "Editar" : "Nova"}
          </>
        }
      />

      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <p className="mb-2 text-body-sm font-medium text-fg">Logo</p>
            <ImageUpload
              src={imageSrc}
              alt={values.name || "Logo da série"}
              maxMb={MAX_LOGO_MB}
              aspect="square"
              fit="contain"
              busy={imageBusy}
              error={imageError}
              disabled={saving}
              onSelect={replaceImage}
              onRemove={pendingFile || serie?.imageFileId ? () => (isEdit ? setConfirmRemoveImage(true) : removeImage()) : undefined}
              hint={
                <span className="flex items-center gap-1.5">
                  <Info size={14} aria-hidden />
                  150×150 com transparência (PNG ou WebP).
                </span>
              }
            />
          </div>

          <div className="space-y-4 lg:col-span-7">
            <p className="text-caption text-fg-subtle">
              <span className="text-flame">*</span> obrigatório
            </p>
            <FormError message={serverError} />

            <FormSection n={1} title="Dados" invalid={!!(errors.name || errors.description)}>
              <div className="space-y-4">
                <Field label={<RequiredLabel>Nome</RequiredLabel>} error={errors.name?.message}>
                  {({ id, describedBy }) => (
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={errors.name ? true : undefined}
                      className={fieldClass}
                      placeholder="HW J-Imports"
                      disabled={saving}
                      {...register("name")}
                    />
                  )}
                </Field>
                <Field label="Descrição" error={errors.description?.message}>
                  {({ id, describedBy }) => (
                    <Textarea id={id} aria-describedby={describedBy} invalid={!!errors.description} disabled={saving} {...register("description")} />
                  )}
                </Field>
              </div>
            </FormSection>

            <FormSection n={2} title="Destaque">
              <div className="flex items-start justify-between gap-4 rounded-md bg-surface-2 p-4">
                <div>
                  <label htmlFor="isDefault" className="flex items-center gap-1.5 font-medium text-fg">
                    Destacar na página inicial
                  </label>
                  <p className="mt-1 text-body-sm text-fg-subtle">
                    Séries em destaque aparecem no hero da home. Hoje: {featuredCount} série{featuredCount === 1 ? "" : "s"} em destaque.
                  </p>
                </div>
                <Controller
                  control={control}
                  name="isDefault"
                  render={({ field }) => (
                    <Switch id="isDefault" checked={field.value} disabled={saving} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </FormSection>

            {isEdit ? (
              <Link
                href={`/cars?serieId=${serie!.id}`}
                className="flex items-center gap-1.5 text-body-sm font-medium text-primary-text hover:underline"
              >
                <Layers size={16} aria-hidden /> Ver miniaturas desta série ({serie!.carCount})
                <ArrowRight size={14} aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>

        <ActionBar
          dirty={dirty}
          saving={saving}
          disabled={imageBusy}
          saveLabel={isEdit ? "Salvar alterações" : "Salvar série"}
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

      <ConfirmDialog open={confirmLeave} onOpenChange={setConfirmLeave} title="Descartar alterações?" confirmLabel="Descartar" onConfirm={() => {
        setConfirmLeave(false);
        reset();
        setPendingFile(null);
        router.push("/series");
      }}>
        As alterações feitas neste formulário serão perdidas.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(o) => !deleting && setConfirmDelete(o)}
        title="Excluir série?"
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      >
        <p>
          <strong className="text-fg">{serie?.name}</strong> será excluída.
        </p>
        {serie?.carCount ? (
          <p className="mt-1">
            Ela possui <strong className="text-fg">{serie.carCount} miniaturas</strong> vinculadas.
          </p>
        ) : null}
        {deleteError ? (
          <p role="alert" className="mt-2 text-danger">
            {deleteError}
          </p>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmRemoveImage}
        onOpenChange={setConfirmRemoveImage}
        title="Remover logo?"
        confirmLabel="Remover"
        loading={imageBusy}
        onConfirm={() => void removeImage()}
      >
        A série <strong className="text-fg">{serie?.name}</strong> ficará sem logo.
      </ConfirmDialog>
    </>
  );
}
