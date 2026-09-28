import type { Metadata } from "next";
import { SeriesView } from "./series-view";

export const metadata: Metadata = {
  title: "Séries",
  robots: { index: false, follow: false },
};

export default function SeriesPage() {
  return <SeriesView />;
}
