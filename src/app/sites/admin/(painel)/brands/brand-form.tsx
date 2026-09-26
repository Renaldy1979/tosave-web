"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/admin/admin-shell";
import { ActionBar, FormError, FormSection } from "@/components/admin/form-parts";
import { ImageUpload, useObjectUrl } from "@/components/admin/image-upload";
import { LinkedCars } from "@/components/admin/linked-cars";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, fieldClass } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import type { AdminBrand, BrandState } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { brandLogoUrl } from "@/lib/appwrite";
import { BRAND_STATE_OPTIONS } from "@/lib/brand-state";
import { invalidateCatalog } from "@/lib/catalog";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

const MAX_LOGO_MB = 5;
const STATES = ["ativa", "descontinuada", "em_analise"] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome da marca.").max(120, "Nome: até 120 caracteres."),
  state: z.enum(STATES),
  active: z.boolean(),
});

type Values = z.infer<typeof schema>;

function toValues(brand: AdminBrand | null): Values {
  return { name: brand?.name ?? "", state: brand?.state ?? "ativa", active: brand?.active ?? true };
}

function uploadLogo(brandId: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return api<AdminBrand>(`/admin/brands/${brandId}/logo`, { method: "POST", body });
}

export function BrandForm({ brand: initialBrand }: { brand: AdminBrand | null }) {
  const router = useRouter();
  const isEdit = initialBrand !== null;
  const [brand, setBrand] = useState(initialBrand);
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
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(initialBrand), mode: "onBlur" });

  const dirty = isDirty || pendingFile !== null;
  useUnsavedGuard(dirty && !isSubmitting);
  const imageSrc = pendingUrl ?? brandLogoUrl(brand?.imageFileId);

  function onInvalid(errs: FieldErrors<Values>) {
    if (errs.name) setFocus("name");
    toast.error("Revise os campos destacados.");
  }

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null);
    const input = { name: v.name.trim(), state: v.state, active: v.active };
    try {
      if (!isEdit) {
        const created = await api<AdminBrand>("/admin/brands", { method: "POST", body: input });
        if (pendingFile) {
          try {
            await uploadLogo(created.id, pendingFile);
          } catch (err) {
            toast.error(`Marca cadastrada, mas o logo não subiu: ${errorMessage(err)}`);
            invalidateCatalog("brands");
            router.push(`/brands/${created.id}/edit`);
            return;
          }
        }
        invalidateCatalog("brands");
        toast.success("Marca salva.");
        router.push("/brands");
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
      const updated = await api<AdminBrand>(`/admin/brands/${brand!.id}`, { method: "PUT", body: patch });
      setBrand(updated);
      reset(toValues(updated));
      invalidateCatalog("brands");
      toast.success("Marca salva.");
      router.push("/brands");
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
      const updated = await uploadLogo(brand!.id, file);
      setBrand(updated);
      invalidateCatalog("brands");
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
      const updated = await api<AdminBrand>(`/admin/brands/${brand!.id}/logo`, { method: "DELETE" });
      setBrand(updated);
      invalidateCatalog("brands");
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
    if (!brand) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/brands/${brand.id}`, { method: "DELETE" });
      invalidateCatalog("brands");
      toast.success("Marca excluída.");
      router.push("/brands");
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function cancel() {
    if (dirty) setConfirmLeave(true);
    else router.push("/brands");
  }

  const saving = isSubmitting;

  return (
    <>
      <PageHeader
        title={isEdit ? brand!.name : "Nova marca"}
        breadcrumb={
          <>
            Catálogo /{" "}
            <Link href="/brands" className="hover:text-fg">
              Marcas
            </Link>{" "}
            / {isEdit ? "Editar" : "Nova"}
          </>
        }
      />

      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-4">
            <p className="mb-2 text-body-sm font-medium text-fg">Logo</p>
            <ImageUpload
              src={imageSrc}
              alt={brand?.name || "Logo da marca"}
              maxMb={MAX_LOGO_MB}
              aspect="square"
              fit="contain"
              busy={imageBusy}
              error={imageError}
              disabled={saving}
              onSelect={replaceImage}
              onRemove={pendingFile || brand?.imageFileId ? () => (isEdit ? setConfirmRemoveImage(true) : removeImage()) : undefined}
              hint={
                <span className="flex items-center gap-1.5">
                  <Info size={14} aria-hidden />
                  150×150 com transparência (PNG ou WebP).
                </span>
              }
            />
          </div>

          <div className="space-y-4 lg:col-span-8">
            <FormError message={serverError} />

            <FormSection n={1} title="Dados" invalid={!!errors.name}>
              <div className="space-y-4">
                <Field label="Nome" error={errors.name?.message}>
                  {({ id, describedBy }) => (
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={errors.name ? true : undefined}
                      className={fieldClass}
                      placeholder="Hot Wheels"
                      disabled={saving}
                      {...register("name")}
                    />
                  )}
                </Field>

                <div>
                  <p className="mb-1.5 text-body-sm font-medium text-fg">Situação</p>
                  <Controller
                    control={control}
                    name="state"
                    render={({ field }) => (
                      <>
                        <SegmentedControl
                          className="hidden sm:inline-flex"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={saving}
                          options={BRAND_STATE_OPTIONS}
                        />
                        <NativeSelect
                          aria-label="Situação"
                          className="sm:hidden"
                          disabled={saving}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as BrandState)}
                        >
                          {BRAND_STATE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </NativeSelect>
                      </>
                    )}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-md bg-surface-2 p-4">
                  <div>
                    <label htmlFor="active" className="font-medium text-fg">
                      Visível no site
                    </label>
                    <p className="mt-1 text-body-sm text-fg-subtle">
                      Marcas ocultas não aparecem no catálogo público. A situação não muda.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="active"
                    render={({ field }) => <Switch id="active" checked={field.value} disabled={saving} onCheckedChange={field.onChange} />}
                  />
                </div>
              </div>
            </FormSection>
          </div>
        </div>

        {isEdit ? (
          <div className="mt-4">
            <LinkedCars title="Miniaturas desta marca" filterKey="brandId" filterValue={brand!.id} />
          </div>
        ) : null}

        <ActionBar
          dirty={dirty}
          saving={saving}
          disabled={imageBusy}
          saveLabel={isEdit ? "Salvar alterações" : "Salvar marca"}
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
          setPendingFile(null);
          router.push("/brands");
        }}
      >
        As alterações feitas neste formulário serão perdidas.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(o) => !deleting && setConfirmDelete(o)}
        title="Excluir marca?"
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      >
        <p>
          <strong className="text-fg">{brand?.name}</strong> será excluída.
        </p>
        {brand?.carCount ? (
          <p className="mt-1">
            Ela possui <strong className="text-fg">{brand.carCount} miniaturas</strong> vinculadas.
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
        A marca <strong className="text-fg">{brand?.name}</strong> ficará sem logo.
      </ConfirmDialog>
    </>
  );
}
