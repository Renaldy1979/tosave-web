import type { Metadata } from "next";
import { SerieFormLoader } from "../serie-form-loader";

export const metadata: Metadata = { title: "Nova série" };

export default function NewSeriePage() {
  return <SerieFormLoader serieId={null} />;
}
