import type { Metadata } from "next";
import { BrandsList } from "./brands-list";

export const metadata: Metadata = { title: "Marcas" };

export default function BrandsPage() {
  return <BrandsList />;
}
