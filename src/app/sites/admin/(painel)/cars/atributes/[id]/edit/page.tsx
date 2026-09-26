import type { Metadata } from "next";
import { AttributeFormLoader } from "../../attribute-form-loader";

export const metadata: Metadata = { title: "Editar atributo" };

export default async function EditAttributePage({ params }: PageProps<"/sites/admin/cars/atributes/[id]/edit">) {
  const { id } = await params;
  return <AttributeFormLoader key={id} attributeId={id} />;
}
