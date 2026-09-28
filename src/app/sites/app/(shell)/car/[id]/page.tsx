import type { Metadata } from "next";
import { CarDetailView } from "./car-detail-view";

export const metadata: Metadata = {
  title: "Carro",
  robots: { index: false, follow: false },
};

export default async function CarDetailPage({ params }: PageProps<"/sites/app/car/[id]">) {
  const { id } = await params;
  return <CarDetailView id={id} />;
}
