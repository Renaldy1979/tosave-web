import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsList } from "./news-list";

export const metadata: Metadata = { title: "Notícias" };

export default function NewsPage() {
  return (
    <Suspense>
      <NewsList />
    </Suspense>
  );
}
