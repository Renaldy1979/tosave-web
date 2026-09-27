import type { Metadata } from "next";
import { NewsFormLoader } from "../../news-form-loader";

export const metadata: Metadata = { title: "Editar notícia" };

export default async function EditNewsPage({ params }: PageProps<"/sites/admin/news/[id]/edit">) {
  const { id } = await params;
  return <NewsFormLoader key={id} newsId={id} />;
}
