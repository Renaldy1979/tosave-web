import type { Metadata } from "next";
import { marketingNumber } from "@/lib/marketing-number";
import { loadPublicStats, loadShowcase, type Page, type CarItem, type PublicStats } from "@/lib/public-api";
import { VitrineView } from "./vitrine-view";

// Renderiza a cada visita: a curadoria da vitrine no painel aparece na hora (o ISR não renovava no container).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vitrine",
  description: "Hot Wheels e Matchbox raros esperando por você. Cadastre-se para ver a coleção completa da comunidade ToSave.",
};

export default async function VitrinePage() {
  const [stats, firstPage] = await Promise.all([
    loadPublicStats({ revalidate: 0 }).catch((): PublicStats | null => null),
    loadShowcase({ limit: 24 }, { revalidate: 0 }).catch((): Page<CarItem> | null => null),
  ]);

  // Formatado no servidor: o número exato do total nunca viaja até o cliente (nem no payload de hidratação).
  const totalCarsLabel = stats ? marketingNumber(stats.totalCars) : null;

  return <VitrineView totalCarsLabel={totalCarsLabel} initialPage={firstPage} />;
}
