import type { Metadata } from "next";
import { Suspense } from "react";
import { loadPublicStats, loadShowcase, type Page, type CarItem, type PublicStats } from "@/lib/public-api";
import { VitrineView } from "./vitrine-view";

// Renderiza a cada visita: a curadoria da vitrine no painel aparece na hora (o ISR não renovava no container).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vitrine",
  description: "Os destaques da comunidade ToSave: Hot Wheels e Matchbox raros, organizados por série e marca.",
};

export default async function VitrinePage() {
  const [stats, firstPage] = await Promise.all([
    loadPublicStats({ revalidate: 0 }).catch((): PublicStats | null => null),
    loadShowcase({ limit: 24 }, { revalidate: 0 }).catch((): Page<CarItem> | null => null),
  ]);

  return (
    // `useSearchParams` (filtros na URL) exige um limite de Suspense para o prerender estático.
    <Suspense>
      <VitrineView totalCars={stats?.totalCars ?? null} initialPage={firstPage} />
    </Suspense>
  );
}
