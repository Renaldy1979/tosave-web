import type { Metadata } from "next";
import { MOCK_CARS } from "../../../_mock/data";
import { CarDetailView } from "./car-detail-view";

export async function generateMetadata({ params }: PageProps<"/sites/app/car/[id]">): Promise<Metadata> {
  const { id } = await params;
  const car = MOCK_CARS.find((c) => c.id === id);
  return { title: car?.title ?? "Carro", robots: { index: false, follow: false } };
}

export default async function CarDetailPage({ params }: PageProps<"/sites/app/car/[id]">) {
  const { id } = await params;
  return <CarDetailView id={id} />;
}
