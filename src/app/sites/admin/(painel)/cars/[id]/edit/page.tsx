import type { Metadata } from "next";
import { CarFormLoader } from "../../car-form-loader";

export const metadata: Metadata = { title: "Editar miniatura" };

export default async function EditCarPage({ params }: PageProps<"/sites/admin/cars/[id]/edit">) {
  const { id } = await params;
  return <CarFormLoader key={id} carId={id} />;
}
