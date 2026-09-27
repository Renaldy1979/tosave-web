import type { Metadata } from "next";
import { NewsFormLoader } from "../news-form-loader";

export const metadata: Metadata = { title: "Nova notícia" };

export default function NewNewsPage() {
  return <NewsFormLoader newsId={null} />;
}
