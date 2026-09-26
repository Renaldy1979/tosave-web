import type { Metadata } from "next";
import { CarFormLoader } from "../car-form-loader";

export const metadata: Metadata = { title: "Nova miniatura" };

export default function NewCarPage() {
  return <CarFormLoader carId={null} />;
}
