import type { Metadata } from "next";
import { Suspense } from "react";
import { CarsList } from "./cars-list";

export const metadata: Metadata = { title: "Miniaturas" };

export default function CarsPage() {
  return (
    <Suspense>
      <CarsList />
    </Suspense>
  );
}
