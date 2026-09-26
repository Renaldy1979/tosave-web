import type { Metadata } from "next";
import { SerieFormLoader } from "../../serie-form-loader";

export const metadata: Metadata = { title: "Editar série" };

export default async function EditSeriePage({ params }: PageProps<"/sites/admin/series/[id]/edit">) {
  const { id } = await params;
  return <SerieFormLoader key={id} serieId={id} />;
}
