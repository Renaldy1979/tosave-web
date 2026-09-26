import type { Metadata } from "next";
import { Suspense } from "react";
import { SeriesList } from "./series-list";

export const metadata: Metadata = { title: "Séries" };

export default function SeriesPage() {
  return (
    <Suspense>
      <SeriesList />
    </Suspense>
  );
}
