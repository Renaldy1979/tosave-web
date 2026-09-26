import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { carImageUrl } from "@/lib/storage-url";
import { loadPublicCar, PublicApiError } from "@/lib/public-api";
import { slugify } from "@/lib/slug";
import { CarDetailView } from "./car-detail-view";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_LEN = 36;

function splitIdSlug(idSlug: string): { id: string; slug: string } | null {
  const id = idSlug.slice(0, UUID_LEN);
  if (!UUID_RE.test(id)) return null;
  return { id, slug: idSlug.slice(UUID_LEN + 1) };
}

async function loadCarOrNotFound(id: string) {
  try {
    return await loadPublicCar(id);
  } catch (err) {
    if (err instanceof PublicApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps<"/sites/site/carros/[idSlug]">): Promise<Metadata> {
  const { idSlug } = await params;
  const parsed = splitIdSlug(idSlug);
  if (!parsed) notFound();
  const car = await loadCarOrNotFound(parsed.id);
  const title = car.title;
  const description = car.description.trim() || `${[car.brandName, car.year].filter(Boolean).join(" · ")} — ${car.serieTitle}`;
  const image = carImageUrl(car.imageFileId, "full");
  return {
    title,
    description,
    alternates: { canonical: `/carros/${car.id}-${slugify(car.title)}` },
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
  };
}

export default async function CarDetailPage({ params }: PageProps<"/sites/site/carros/[idSlug]">) {
  const { idSlug } = await params;
  const parsed = splitIdSlug(idSlug);
  if (!parsed) notFound();

  const car = await loadCarOrNotFound(parsed.id);
  const canonicalSlug = slugify(car.title);
  if (parsed.slug !== canonicalSlug) redirect(`/carros/${car.id}-${canonicalSlug}`);

  return <CarDetailView car={car} />;
}
