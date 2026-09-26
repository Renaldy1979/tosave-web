"use client";

import { Car } from "lucide-react";
import { useState } from "react";
import { carImageUrl } from "@/lib/appwrite";
import { cn } from "@/lib/cn";

/** Thumb do carro no "palco" (design-system §13); sem imagem, silhueta `Car`. */
export function CarThumb({
  fileId,
  alt,
  size = "grid",
  className,
  iconSize = 20,
  priority = false,
}: {
  fileId: string | null;
  alt: string;
  size?: "grid" | "full";
  className?: string;
  iconSize?: number;
  /** Primeiros itens acima da dobra: sem `loading="lazy"` (componentes.md §6). */
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = carImageUrl(fileId, size);
  const showImage = src && failedSrc !== src;
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-card-stage", className)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview do Appwrite já vem redimensionado
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      ) : (
        <Car size={iconSize} strokeWidth={1.75} className="text-fg-subtle/40" aria-hidden />
      )}
    </div>
  );
}
