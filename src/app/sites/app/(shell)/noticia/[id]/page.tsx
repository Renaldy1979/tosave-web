import type { Metadata } from "next";
import { NoticiaDetailView } from "./noticia-detail-view";

export const metadata: Metadata = {
  title: "Notícia",
  robots: { index: false, follow: false },
};

export default async function NoticiaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoticiaDetailView id={id} />;
}
