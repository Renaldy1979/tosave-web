import type { Metadata } from "next";
import { BrandFormLoader } from "../../brand-form-loader";

export const metadata: Metadata = { title: "Editar marca" };

export default async function EditBrandPage({ params }: PageProps<"/sites/admin/brands/[id]/edit">) {
  const { id } = await params;
  return <BrandFormLoader key={id} brandId={id} />;
}
