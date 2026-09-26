"use client";

import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/** Confere tipo e tamanho antes de enviar (o backend devolve 415/413). */
export function validateImage(file: File, maxMb: number): string | null {
  if (!ACCEPT.includes(file.type)) return "Formato não suportado. Use JPG, PNG ou WebP.";
  if (file.size > maxMb * 1024 * 1024) return `Arquivo muito grande. Máximo de ${maxMb} MB.`;
  return null;
}

type ImageUploadProps = {
  /** URL da imagem atual (ou do arquivo local escolhido). */
  src: string | null;
  alt: string;
  maxMb: number;
  busy?: boolean;
  error?: string | null;
  onSelect: (file: File) => void;
  onRemove?: () => void;
  aspect?: "card" | "square";
  fit?: "cover" | "contain";
  hint?: ReactNode;
  disabled?: boolean;
};

/** Dropzone com preview, trocar e remover (componentes.md §13, ImageUpload). */
export function ImageUpload({
  src,
  alt,
  maxMb,
  busy,
  error,
  onSelect,
  onRemove,
  aspect = "card",
  fit = "cover",
  hint,
  disabled,
}: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const shownError = localError ?? error ?? null;

  function pick(file: File | undefined) {
    if (!file) return;
    const problem = validateImage(file, maxMb);
    setLocalError(problem);
    if (!problem) onSelect(file);
  }

  const open = () => !disabled && !busy && inputRef.current?.click();

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && !busy) pick(e.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative overflow-hidden rounded-lg border-2 border-dashed bg-surface-2 transition duration-fast",
          aspect === "card" ? "aspect-card" : "aspect-square",
          src ? "border-transparent bg-card-stage" : "border-border-strong",
          dragOver && "border-primary bg-primary-soft/40",
          shownError && "border-danger"
        )}
      >
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- preview local (blob) ou do Appwrite */}
            <img src={src} alt={alt} className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain p-4")} />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={open}
                disabled={disabled || busy}
                className="flex h-9 items-center gap-1.5 rounded-md bg-black/55 px-3 text-body-sm text-white backdrop-blur-md hover:bg-black/70 disabled:opacity-50"
              >
                <RefreshCw size={15} aria-hidden /> Trocar
              </button>
              {onRemove ? (
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={disabled || busy}
                  aria-label="Remover imagem"
                  className="flex size-9 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur-md hover:bg-black/70 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className={cn(
              "flex size-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center",
              (disabled || busy) && "pointer-events-none"
            )}
          >
            <ImagePlus size={32} strokeWidth={1.5} className="text-fg-subtle" aria-hidden />
            <span className="text-body-sm text-fg-muted">
              Arraste uma imagem ou <span className="font-semibold text-primary-text">clique para enviar</span>
            </span>
            <span className="text-caption text-fg-subtle">JPG, PNG ou WebP · até {maxMb} MB</span>
          </label>
        )}
        {busy ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-overlay/50 text-white">
            <Loader2 size={24} className="animate-spin" aria-hidden />
            <span className="text-body-sm">Enviando…</span>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 animate-pulse bg-flame" />
          </div>
        ) : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          disabled={disabled || busy}
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {shownError ? (
        <p role="alert" className="text-caption text-danger">
          {shownError}
        </p>
      ) : hint ? (
        <div className="text-caption text-fg-subtle">{hint}</div>
      ) : null}
    </div>
  );
}

/** URL local (blob) de um arquivo escolhido, liberada ao trocar/desmontar. */
export function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  return url;
}
