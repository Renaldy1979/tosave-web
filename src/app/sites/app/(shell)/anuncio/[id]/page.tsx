import type { Metadata } from "next";
import { AnuncioDetailView } from "./anuncio-detail-view";

export const metadata: Metadata = {
  title: "Anúncio",
  robots: { index: false, follow: false },
};

export default async function AnuncioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnuncioDetailView id={id} />;
}
