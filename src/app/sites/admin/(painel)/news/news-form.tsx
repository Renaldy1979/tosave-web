"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Newspaper, Radio, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/admin/admin-shell";
import { ActionBar, FormError, FormSection, RequiredLabel, Textarea } from "@/components/admin/form-parts";
import { ImageUpload, useObjectUrl } from "@/components/admin/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, fieldClass } from "@/components/ui/input";
import type { AdminNews, NewsInput } from "@/lib/admin-types";
import { api, errorMessage } from "@/lib/api";
import { newsImageUrl } from "@/lib/appwrite";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

const MAX_IMAGE_MB = 10;
const SUMMARY_MAX = 500;
const CONTENT_MAX = 20_000;

const schema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(200, "Título: até 200 caracteres."),
  summary: z.string().trim().max(SUMMARY_MAX, `Resumo: até ${SUMMARY_MAX} caracteres.`),
  content: z.string().trim().max(CONTENT_MAX, `Corpo: até ${CONTENT_MAX} caracteres.`),
  link: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.+/.test(v), "Link: use o formato esquema://…"),
});

type Values = z.infer<typeof schema>;

function toValues(news: AdminNews | null): Values {
  return {
    title: news?.title ?? "",
    summary: news?.summary ?? "",
    content: news?.content ?? "",
    link: news?.link ?? "",
  };
}

const nullIfEmpty = (v: string) => (v.trim() === "" ? null : v.trim());

function toInput(v: Values): NewsInput {
  return { title: v.title.trim(), summary: nullIfEmpty(v.summary), content: nullIfEmpty(v.content), link: nullIfEmpty(v.link) };
}

function uploadImage(newsId: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return api<AdminNews>(`/admin/news/${newsId}/image`, { method: "POST", body });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export function NewsForm({ news: initialNews }: { news: AdminNews | null }) {
  const router = useRouter();
  const isEdit = initialNews !== null;
  const [news, setNews] = useState(initialNews);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [publishBusy, setPublishBusy] = useState(false);

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
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(initialNews), mode: "onBlur" });

  const dirty = isDirty || pendingFile !== null;
  useUnsavedGuard(dirty && !isSubmitting);

  const values = useWatch({ control }) as Values;
  const imageSrc = pendingUrl ?? newsImageUrl(news?.imageFileId, "full");

  function onInvalid(errs: FieldErrors<Values>) {
    const first = (["title", "summary", "content", "link"] as const).find((k) => errs[k]);
    if (first) setFocus(first);
    toast.error("Revise os campos destacados.");
  }

  const onSubmit = handleSubmit(async (v) => {
    setServerError(null);
    const input = toInput(v);
    try {
      if (!isEdit) {
        const created = await api<AdminNews>("/admin/news", { method: "POST", body: input });
        if (pendingFile) {
          try {
            await uploadImage(created.id, pendingFile);
          } catch (err) {
            toast.error(`Notícia salva como rascunho, mas a imagem não subiu: ${errorMessage(err)}`);
            router.push(`/news/${created.id}/edit`);
            return;
          }
        }
        toast.success("Notícia salva como rascunho.");
        router.push(`/news/${created.id}/edit`);
        return;
      }
      const patch: Partial<NewsInput> = {};
      for (const key of Object.keys(dirtyFields) as (keyof Values)[]) (patch as Record<string, unknown>)[key] = input[key];
      if (!Object.keys(patch).length) {
        toast.info("Nenhuma alteração para salvar.");
        return;
      }
      const updated = await api<AdminNews>(`/admin/news/${news!.id}`, { method: "PUT", body: patch });
      setNews(updated);
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
      const updated = await uploadImage(news!.id, file);
      setNews(updated);
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
      const updated = await api<AdminNews>(`/admin/news/${news!.id}/image`, { method: "DELETE" });
      setNews(updated);
      setConfirmRemoveImage(false);
      toast.success("Imagem removida.");
    } catch (err) {
      setImageError(errorMessage(err));
      setConfirmRemoveImage(false);
    } finally {
      setImageBusy(false);
    }
  }

  async function togglePublish() {
    if (!news) return;
    setPublishBusy(true);
    try {
      const updated = await api<AdminNews>(`/admin/news/${news.id}/${news.published ? "unpublish" : "publish"}`, { method: "POST" });
      setNews(updated);
      toast.success(updated.published ? "Notícia publicada." : "Notícia despublicada.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPublishBusy(false);
    }
  }

  async function handleDelete() {
    if (!news) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`/admin/news/${news.id}`, { method: "DELETE" });
      toast.success("Notícia excluída.");
      router.push("/news");
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function cancel() {
    if (dirty) setConfirmLeave(true);
    else router.push("/news");
  }

  const saving = isSubmitting;

  return (
    <>
      <PageHeader
        title={isEdit ? news!.title : "Nova notícia"}
        breadcrumb={
          <>
            Comunidade /{" "}
            <Link href="/news" className="hover:text-fg">
              Notícias
            </Link>{" "}
            / {isEdit ? "Editar" : "Nova"}
          </>
        }
        actions={
          isEdit ? (
            <div className="flex items-center gap-2">
              <Badge variant={news!.published ? "success" : "outline"}>{news!.published ? "Publicada" : "Rascunho"}</Badge>
              <Button
                type="button"
                variant={news!.published ? "outline" : "primary"}
                leftIcon={Radio}
                loading={publishBusy}
                onClick={() => void togglePublish()}
              >
                {news!.published ? "Despublicar" : "Publicar"}
              </Button>
            </div>
          ) : undefined
        }
      />

      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-4 lg:col-span-8 lg:space-y-6">
            <p className="text-caption text-fg-subtle">
              <span className="text-flame">*</span> obrigatório
            </p>
            <FormError message={serverError} />

            <FormSection n={1} title="Conteúdo" invalid={!!(errors.title || errors.summary || errors.content)}>
              <div className="space-y-4">
                <Field label={<RequiredLabel>Título</RequiredLabel>} error={errors.title?.message}>
                  {({ id, describedBy }) => (
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={errors.title ? true : undefined}
                      className={fieldClass}
                      placeholder="Nova série chegou à vitrine"
                      disabled={saving}
                      {...register("title")}
                    />
                  )}
                </Field>
                <Field label="Resumo" error={errors.summary?.message} hint="Aparece no card da lista, no app.">
                  {({ id, describedBy }) => (
                    <div>
                      <Textarea
                        id={id}
                        aria-describedby={describedBy}
                        invalid={!!errors.summary}
                        disabled={saving}
                        className="min-h-[80px]"
                        {...register("summary")}
                      />
                      <p className="mt-1 text-right text-caption text-fg-subtle">
                        {values.summary.length}/{SUMMARY_MAX}
                      </p>
                    </div>
                  )}
                </Field>
                <Field label="Corpo" error={errors.content?.message} hint="Texto simples; as quebras de linha são preservadas.">
                  {({ id, describedBy }) => (
                    <div>
                      <Textarea
                        id={id}
                        aria-describedby={describedBy}
                        invalid={!!errors.content}
                        disabled={saving}
                        className="min-h-[240px]"
                        {...register("content")}
                      />
                      <p className="mt-1 text-right text-caption text-fg-subtle">
                        {values.content.length}/{CONTENT_MAX}
                      </p>
                    </div>
                  )}
                </Field>
                <Field label="Link externo" error={errors.link?.message} hint="Opcional. Abre fora do app.">
                  {({ id, describedBy }) => (
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={errors.link ? true : undefined}
                      className={fieldClass}
                      placeholder="https://…"
                      disabled={saving}
                      {...register("link")}
                    />
                  )}
                </Field>
              </div>
            </FormSection>

            <FormSection n={2} title="Imagem" description="Capa da notícia, em 16:9.">
              <ImageUpload
                src={imageSrc}
                alt={values.title || "Imagem da notícia"}
                maxMb={MAX_IMAGE_MB}
                aspect="wide"
                busy={imageBusy}
                error={imageError}
                disabled={saving}
                onSelect={replaceImage}
                onRemove={pendingFile || news?.imageFileId ? () => (isEdit ? setConfirmRemoveImage(true) : removeImage()) : undefined}
                hint={
                  <span className="flex items-center gap-1.5">
                    <Info size={14} aria-hidden />
                    {isEdit ? "A troca é salva na hora." : "A imagem sobe junto com o rascunho."}
                  </span>
                }
              />
            </FormSection>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-3">
              <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Prévia no app</p>
              <NewsCardPreview
                imageSrc={pendingUrl ?? newsImageUrl(news?.imageFileId, "grid")}
                title={values.title}
                summary={values.summary}
                publishedAt={news?.published ? news.publishedAt : null}
              />
            </div>
          </aside>
        </div>

        <ActionBar
          dirty={dirty}
          saving={saving}
          disabled={imageBusy}
          saveLabel={isEdit ? "Salvar alterações" : "Salvar rascunho"}
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
          router.push("/news");
        }}
      >
        As alterações feitas neste formulário serão perdidas.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(o) => !deleting && setConfirmDelete(o)}
        title="Excluir notícia?"
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      >
        <p>
          <strong className="text-fg">{news?.title}</strong> será excluída{news?.imageFileId ? ", junto com a imagem" : ""}.
        </p>
        {deleteError ? (
          <p role="alert" className="mt-2 text-danger">
            {deleteError}
          </p>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmRemoveImage}
        onOpenChange={setConfirmRemoveImage}
        title="Remover imagem?"
        confirmLabel="Remover"
        loading={imageBusy}
        onConfirm={() => void removeImage()}
      >
        A notícia <strong className="text-fg">{news?.title}</strong> ficará sem imagem.
      </ConfirmDialog>
    </>
  );
}

function NewsCardPreview({
  imageSrc,
  title,
  summary,
  publishedAt,
}: {
  imageSrc: string | null;
  title: string;
  summary: string;
  publishedAt: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="relative aspect-video bg-card-stage">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview local ou do Appwrite
          <img src={imageSrc} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Newspaper size={40} strokeWidth={1.5} className="text-fg-subtle/40" aria-hidden />
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <p className="text-caption text-fg-subtle">{publishedAt ? dateFormatter.format(new Date(publishedAt)) : "Rascunho"}</p>
        <p className="line-clamp-2 min-h-[2lh] font-semibold text-fg">{title.trim() || "Título da notícia"}</p>
        <p className="line-clamp-2 text-body-sm text-fg-muted">{summary.trim() || "Resumo da notícia."}</p>
      </div>
    </div>
  );
}
