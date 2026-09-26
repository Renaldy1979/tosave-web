"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/admin/admin-shell";
import { ActionBar, FormError, FormSection } from "@/components/admin/form-parts";
import { LinkedCars } from "@/components/admin/linked-cars";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, fieldClass } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AdminBrand } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { invalidateCatalog } from "@/lib/catalog";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome da marca.").max(120, "Nome: até 120 caracteres."),
  active: z.boolean(),
});

type Values = z.infer<typeof schema>;

function toValues(brand: AdminBrand | null): Values {
  return { name: brand?.name ?? "", active: brand?.active ?? true };
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

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(initialBrand), mode: "onBlur" });

  useUnsavedGuard(isDirty && !isSubmitting);

  function onInvalid(errs: FieldErrors<Values>) {
    if (errs.name) setFocus("name");
    toast.error("Revise os campos destacados.");
  }

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null);
    const input = { name: v.name.trim(), active: v.active };
    try {
      if (!isEdit) {
        await api<AdminBrand>("/admin/brands", { method: "POST", body: input });
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
    if (isDirty) setConfirmLeave(true);
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

      <form onSubmit={onSubmit} noValidate className="max-w-[640px]">
        <div className="space-y-4">
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

              <div className="flex items-start justify-between gap-4 rounded-md bg-surface-2 p-4">
                <div>
                  <label htmlFor="active" className="font-medium text-fg">
                    Visível no site
                  </label>
                  <p className="mt-1 text-body-sm text-fg-subtle">Marcas ocultas não aparecem no catálogo público. As miniaturas continuam no catálogo.</p>
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

        {isEdit ? (
          <div className="mt-4">
            <LinkedCars title="Miniaturas desta marca" filterKey="brandId" filterValue={brand!.id} />
          </div>
        ) : null}

        <ActionBar
          dirty={isDirty}
          saving={saving}
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
    </>
  );
}
