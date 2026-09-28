"use client";

import { Layers } from "lucide-react";
import { useState } from "react";
import { serieLogoUrl } from "@/lib/appwrite";
import { cn } from "@/lib/cn";

/** Logo da série (bucket `series-logos`, 150×150 com transparência): `object-contain`, sem imagem, silhueta `Layers`. */
export function SerieLogo({ fileId, alt, className, iconSize = 32 }: { fileId: string | null; alt: string; className?: string; iconSize?: number }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = serieLogoUrl(fileId);
  const showImage = src && failedSrc !== src;
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-card-stage", className)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview do Appwrite já vem redimensionado
        <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className="size-full object-contain p-3" />
      ) : (
        <Layers size={iconSize} strokeWidth={1.5} className="text-fg-subtle/40" aria-hidden />
      )}
    </div>
  );
}
