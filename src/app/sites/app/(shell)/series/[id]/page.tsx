import type { Metadata } from "next";
import { MOCK_SERIES } from "../../../_mock/data";
import { SerieDetailView } from "./serie-detail-view";

export async function generateMetadata({ params }: PageProps<"/sites/app/series/[id]">): Promise<Metadata> {
  const { id } = await params;
  const serie = MOCK_SERIES.find((s) => s.id === id);
  return { title: serie?.title ?? "Série", robots: { index: false, follow: false } };
}

export default async function SerieDetailPage({ params }: PageProps<"/sites/app/series/[id]">) {
  const { id } = await params;
  return <SerieDetailView id={id} />;
}
