"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Check, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/admin/admin-shell";
import { ActionBar, FormError, FormSection, RequiredLabel, Textarea } from "@/components/admin/form-parts";
import { ImageUpload, useObjectUrl } from "@/components/admin/image-upload";
import { SeriePicker } from "@/components/admin/serie-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, fieldClass } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import type { AdminAttribute, AdminBrand, AdminCar, CarInput } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { carImageUrl } from "@/lib/appwrite";
import { cn } from "@/lib/cn";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

const MAX_IMAGE_MB = 10;

const optional = (max: number, label: string) =>
  z.string().trim().max(max, `${label}: até ${max} caracteres.`);

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome da miniatura.").max(200, "Nome: até 200 caracteres."),
  serie: z.object({ id: z.string(), name: z.string() }).nullable().refine((s) => Boolean(s), "Escolha a série."),
  brandId: z.string(),
  collector: optional(20, "Nº de coleção"),
  seriePosition: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d+\s*\/\s*\d+$/.test(v), "Use o formato N/M (ex.: 8/10)."),
  toy: optional(50, "Código toy"),
  year: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}$/.test(v), "Ano com 4 dígitos (ex.: 2024)."),
  scale: z.string().trim().min(1, "Informe a escala.").max(20, "Escala: até 20 caracteres."),
  colorModel: optional(200, "Cor"),
  description: optional(2000, "Descrição"),
  attributeIds: z.array(z.string()),
});

type Values = z.infer<typeof schema>;

function toValues(car: AdminCar | null): Values {
  return {
    name: car?.name ?? "",
    serie: car ? { id: car.serieId, name: car.serieName } : null,
    brandId: car?.brandId ?? "",
    collector: car?.collector ?? "",
    seriePosition: car?.seriePosition ?? "",
    toy: car?.toy ?? "",
    year: car?.year ?? "",
    scale: car?.scale ?? "1:64",
    colorModel: car?.colorModel ?? "",
    description: car?.description ?? "",
    attributeIds: car?.attributeIds ?? [],
  };
}

const nullIfEmpty = (v: string) => (v.trim() === "" ? null : v.trim());

function toInput(v: Values): CarInput {
  return {
    name: v.name.trim(),
    serieId: v.serie!.id,
    brandId: nullIfEmpty(v.brandId),
    collector: nullIfEmpty(v.collector),
    seriePosition: nullIfEmpty(v.seriePosition),
    toy: nullIfEmpty(v.toy),
    year: nullIfEmpty(v.year),
    scale: v.scale.trim(),
    colorModel: nullIfEmpty(v.colorModel),
    description: nullIfEmpty(v.description),
    attributeIds: v.attributeIds,
  };
}

const FIELD_ORDER: (keyof Values)[] = [
  "name",
  "serie",
  "brandId",
  "collector",
  "seriePosition",
  "toy",
  "year",
  "scale",
  "colorModel",
  "description",
];

function uploadImage(carId: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return api<AdminCar>(`/admin/cars/${carId}/image`, { method: "POST", body });
}

type CarFormProps = {
  car: AdminCar | null;
  brands: AdminBrand[];
  attributes: AdminAttribute[];
};

export function CarForm({ car: initialCar, brands, attributes }: CarFormProps) {
  const router = useRouter();
  const isEdit = initialCar !== null;
  const [car, setCar] = useState(initialCar);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  // Imagem: na criação fica local até salvar; na edição sobe na hora.
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
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(initialCar), mode: "onBlur" });

  const dirty = isDirty || pendingFile !== null;
  useUnsavedGuard(dirty && !isSubmitting);

  const values = useWatch({ control }) as Values;
  const imageSrc = pendingUrl ?? carImageUrl(car?.imageFileId, "full");

  // Marcas ativas + a marca atual do carro, mesmo se inativa (para não perder o valor).
  const brandOptions = brands.filter((b) => b.active || b.id === initialCar?.brandId);
  const currentBrandMissing = initialCar?.brandId && !brands.some((b) => b.id === initialCar.brandId);

  function onInvalid(errs: FieldErrors<Values>) {
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) setFocus(first);
    toast.error("Revise os campos destacados.");
  }

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null);
    const input = toInput(v);
    try {
      if (!isEdit) {
        const created = await api<AdminCar>("/admin/cars", { method: "POST", body: input });
        if (pendingFile) {
          try {
            await uploadImage(created.id, pendingFile);
          } catch (err) {
            toast.error(`Miniatura cadastrada, mas a imagem não subiu: ${errorMessage(err)}`);
            reset(toValues(created));
            setPendingFile(null);
            router.push(`/cars/${created.id}/edit`);
            return;
          }
        }
        toast.success("Miniatura cadastrada.");
        reset(toValues(created));
        setPendingFile(null);
        router.push("/cars");
        return;
      }
      // Edição: só o que mudou (uma marca desativada não pode ser regravada).
      const patch: Partial<CarInput> = {};
      for (const key of Object.keys(dirtyFields) as (keyof Values)[]) {
        if (key === "serie") patch.serieId = input.serieId;
        else (patch as Record<string, unknown>)[key] = input[key as keyof CarInput];
      }
      if (!Object.keys(patch).length) {
        toast.info("Nenhuma alteração para salvar.");
        return;
      }
      const updated = await api<AdminCar>(`/admin/cars/${car!.id}`, { method: "PUT", body: patch });
      setCar(updated);
      reset(toValues(updated));
      toast.success("Alterações salvas.");
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
      const updated = await uploadImage(car!.id, file);
      setCar(updated);
      toast.success("Imagem atualizada.");
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
      const updated = await api<AdminCar>(`/admin/cars/${car!.id}/image`, { method: "DELETE" });
      setCar(updated);
      setConfirmRemoveImage(false);
      toast.success("Imagem removida.");
    } catch (err) {
      setImageError(errorMessage(err));
      setConfirmRemoveImage(false);
    } finally {
      setImageBusy(false);
    }
  }

  function cancel() {
    if (dirty) setConfirmLeave(true);
    else router.push("/cars");
  }

  const saving = isSubmitting;
  const requiredDone = [values.name.trim() !== "", values.serie !== null].filter(Boolean).length;
  const sec2Invalid = !!(errors.name || errors.serie || errors.brandId || errors.collector || errors.seriePosition || errors.toy || errors.year);
  const sec3Invalid = !!(errors.scale || errors.colorModel || errors.description);

  return (
    <>
      <PageHeader
        title={isEdit ? car!.name : "Nova miniatura"}
        breadcrumb={
          <>
            Catálogo /{" "}
            <Link href="/cars" className="hover:text-fg">
              Miniaturas
            </Link>{" "}
            / {isEdit ? "Editar" : "Nova"}
          </>
        }
      />

      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-4 lg:col-span-8 lg:space-y-6">
            <p className="text-caption text-fg-subtle">
              <span className="text-flame">*</span> obrigatório
            </p>
            <FormError message={serverError} />

            <FormSection n={1} title="Imagem" description="Foto principal usada nos cards e no detalhe do app.">
              <ImageUpload
                src={imageSrc}
                alt={values.name || "Imagem da miniatura"}
                maxMb={MAX_IMAGE_MB}
                busy={imageBusy}
                error={imageError}
                disabled={saving}
                onSelect={replaceImage}
                onRemove={pendingFile || car?.imageFileId ? () => (isEdit ? setConfirmRemoveImage(true) : removeImage()) : undefined}
                hint={
                  <span className="flex items-center gap-1.5">
                    <Info size={14} aria-hidden />
                    {isEdit
                      ? "A troca é salva na hora. As versões menores para os cards são geradas automaticamente."
                      : "A imagem sobe junto com o cadastro. As versões menores são geradas automaticamente."}
                  </span>
                }
              />
            </FormSection>

            <FormSection n={2} title="Identificação" invalid={sec2Invalid}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={<RequiredLabel>Nome</RequiredLabel>} error={errors.name?.message} className="sm:col-span-2">
                  {({ id, describedBy }) => (
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={errors.name ? true : undefined}
                      className={fieldClass}
                      placeholder="'71 Datsun 510 Wagon"
                      disabled={saving}
                      {...register("name")}
                    />
                  )}
                </Field>
                <Field label={<RequiredLabel>Série</RequiredLabel>} error={errors.serie?.message}>
                  {({ id, describedBy }) => (
                    <Controller
                      control={control}
                      name="serie"
                      render={({ field }) => (
                        <SeriePicker
                          id={id}
                          describedBy={describedBy}
                          invalid={!!errors.serie}
                          value={field.value}
                          disabled={saving}
                          onChange={(s) => {
                            field.onChange(s);
                            field.onBlur();
                          }}
                        />
                      )}
                    />
                  )}
                </Field>
                <Field label="Marca" error={errors.brandId?.message}>
                  {({ id, describedBy }) => (
                    <NativeSelect id={id} aria-describedby={describedBy} disabled={saving} {...register("brandId")}>
                      <option value="">Sem marca</option>
                      {currentBrandMissing ? <option value={initialCar!.brandId!}>{initialCar!.brand ?? initialCar!.brandId}</option> : null}
                      {brandOptions.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                          {b.active ? "" : " (inativa)"}
                        </option>
                      ))}
                    </NativeSelect>
                  )}
                </Field>
                <MonoField label="Nº de coleção" placeholder="001" error={errors.collector?.message} disabled={saving} {...register("collector")} />
                <MonoField label="Posição na série" placeholder="8/10" error={errors.seriePosition?.message} disabled={saving} {...register("seriePosition")} />
                <MonoField label="Código toy" placeholder="HKJ42" error={errors.toy?.message} disabled={saving} {...register("toy")} />
                <MonoField
                  label="Ano"
                  placeholder="2024"
                  inputMode="numeric"
                  maxLength={4}
                  error={errors.year?.message}
                  disabled={saving}
                  {...register("year")}
                />
              </div>
            </FormSection>

            <FormSection n={3} title="Detalhes" invalid={sec3Invalid}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MonoField
                  label={<RequiredLabel>Escala</RequiredLabel>}
                  placeholder="1:64"
                  error={errors.scale?.message}
                  disabled={saving}
                  {...register("scale")}
                />
                <Field label="Cor" error={errors.colorModel?.message} hint="Como está no banco (o app traduz na exibição).">
                  {({ id, describedBy }) => (
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={errors.colorModel ? true : undefined}
                      className={fieldClass}
                      placeholder="Vermelho metálico"
                      disabled={saving}
                      {...register("colorModel")}
                    />
                  )}
                </Field>
                <Field label="Descrição" error={errors.description?.message} className="sm:col-span-2">
                  {({ id, describedBy }) => (
                    <Textarea id={id} aria-describedby={describedBy} invalid={!!errors.description} disabled={saving} {...register("description")} />
                  )}
                </Field>
                <div className="sm:col-span-2">
                  <p className="mb-1.5 text-body-sm font-medium text-fg">Atributos</p>
                  {attributes.length ? (
                    <Controller
                      control={control}
                      name="attributeIds"
                      render={({ field }) => (
                        <div role="group" aria-label="Atributos" className="flex flex-wrap gap-2">
                          {attributes.map((a) => {
                            const on = field.value.includes(a.id);
                            return (
                              <button
                                key={a.id}
                                type="button"
                                aria-pressed={on}
                                title={a.description ?? undefined}
                                disabled={saving}
                                onClick={() => field.onChange(on ? field.value.filter((x) => x !== a.id) : [...field.value, a.id])}
                                className={cn(
                                  "inline-flex h-9 items-center gap-1.5 rounded-sm border px-3 text-body-sm transition duration-fast",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  on
                                    ? "border-primary/60 bg-primary-soft text-primary-text"
                                    : "border-border-strong text-fg-muted hover:border-fg-subtle hover:text-fg"
                                )}
                              >
                                {on ? <Check size={14} aria-hidden /> : null}
                                {a.title}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  ) : (
                    <p className="text-body-sm text-fg-subtle">Nenhum conteúdo disponível.</p>
                  )}
                </div>
              </div>
            </FormSection>
          </div>

          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-8 space-y-3">
              <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Pré-visualização</p>
              <PreviewCard
                imageSrc={pendingUrl ?? carImageUrl(car?.imageFileId, "grid")}
                name={values.name}
                brand={brands.find((b) => b.id === values.brandId)?.name ?? (values.brandId ? initialCar?.brand ?? null : null)}
                year={values.year}
                serie={values.serie?.name ?? null}
                toy={values.toy}
                collector={values.collector}
                position={values.seriePosition}
              />
              <p className="flex items-center gap-1.5 text-body-sm text-fg-muted">
                Campos obrigatórios: {requiredDone} de 2
                {requiredDone === 2 ? <Check size={14} className="text-success" aria-hidden /> : null}
              </p>
            </div>
          </aside>
        </div>

        <ActionBar
          dirty={dirty}
          saving={saving}
          disabled={imageBusy}
          saveLabel={isEdit ? "Salvar alterações" : "Salvar miniatura"}
          onCancel={cancel}
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
          router.push("/cars");
        }}
      >
        As alterações feitas neste formulário serão perdidas.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmRemoveImage}
        onOpenChange={setConfirmRemoveImage}
        title="Remover imagem?"
        confirmLabel="Remover"
        loading={imageBusy}
        onConfirm={() => void removeImage()}
      >
        A miniatura <strong className="text-fg">{car?.name}</strong> ficará sem foto no app.
      </ConfirmDialog>
    </>
  );
}

type MonoFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "label"> & { label: React.ReactNode; error?: string };

/** Código com zeros à esquerda preservados (sempre texto, nunca number). */
const MonoField = ({ ref, label, error, ...props }: MonoFieldProps & { ref?: React.Ref<HTMLInputElement> }) => (
  <Field label={label} error={error}>
    {({ id, describedBy }) => (
      <input
        ref={ref}
        id={id}
        type="text"
        autoComplete="off"
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass, "font-mono")}
        {...props}
      />
    )}
  </Field>
);

function PreviewCard({
  imageSrc,
  name,
  brand,
  year,
  serie,
  toy,
  collector,
  position,
}: {
  imageSrc: string | null;
  name: string;
  brand: string | null;
  year: string;
  serie: string | null;
  toy: string;
  collector: string;
  position: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="relative aspect-card bg-card-stage">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview local ou do Appwrite
          <img src={imageSrc} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Car size={48} strokeWidth={1.5} className="text-fg-subtle/40" aria-hidden />
          </div>
        )}
        {collector.trim() ? (
          <span className="absolute top-2 left-2 inline-flex h-6 items-center rounded-xs bg-accent-soft px-2 font-mono text-caption text-accent">
            #{collector.trim()}
          </span>
        ) : null}
        {position.trim() ? (
          <span className="absolute right-2 bottom-2 inline-flex h-6 items-center rounded-xs bg-black/50 px-2 font-mono text-caption text-white backdrop-blur">
            {position.trim()}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-4">
        <p className="font-condensed text-eyebrow text-fg-subtle uppercase">{[brand, year.trim()].filter(Boolean).join(" · ") || "Marca · ano"}</p>
        <p className="line-clamp-2 min-h-[2lh] font-semibold text-fg">{name.trim() || "Nome da miniatura"}</p>
        <div className="flex items-center justify-between gap-2 text-body-sm">
          <span className="truncate text-fg-muted">{serie ?? "Série"}</span>
          {toy.trim() ? <span className="shrink-0 font-mono text-fg-subtle">{toy.trim()}</span> : null}
        </div>
      </div>
    </div>
  );
}
