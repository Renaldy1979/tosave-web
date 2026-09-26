import type { Metadata } from "next";
import { AttributesList } from "./attributes-list";

export const metadata: Metadata = { title: "Atributos" };

export default function AttributesPage() {
  return <AttributesList />;
}
