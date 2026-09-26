import type { Metadata } from "next";
import { BrandFormLoader } from "../brand-form-loader";

export const metadata: Metadata = { title: "Nova marca" };

export default function NewBrandPage() {
  return <BrandFormLoader brandId={null} />;
}
