import type { Metadata } from "next";
import { SerieDetailView } from "./serie-detail-view";

export const metadata: Metadata = {
  title: "Série",
  robots: { index: false, follow: false },
};

export default async function SerieDetailPage({ params }: PageProps<"/sites/app/series/[id]">) {
  const { id } = await params;
  return <SerieDetailView id={id} />;
}
