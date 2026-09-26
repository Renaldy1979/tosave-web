import type { Metadata } from "next";
import { AttributeFormLoader } from "../attribute-form-loader";

export const metadata: Metadata = { title: "Novo atributo" };

export default function NewAttributePage() {
  return <AttributeFormLoader attributeId={null} />;
}
