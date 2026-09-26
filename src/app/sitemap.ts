import type { MetadataRoute } from "next";
import { loadShowcase } from "@/lib/public-api";
import { slugify } from "@/lib/slug";

const BASE_URL = "https://tosave.cloud";
const MAX_CARS = 500;
const PAGE_SIZE = 100;

/** Até 500 carros da vitrine (páginas de 100), para não crescer sem limite. */
async function loadAllShowcaseSlugs(): Promise<{ id: string; slug: string }[]> {
  const items: { id: string; slug: string }[] = [];
  let cursor: string | null = null;
  while (items.length < MAX_CARS) {
    const page = await loadShowcase({ limit: PAGE_SIZE, cursor }, { revalidate: 300 });
    items.push(...page.items.map((c) => ({ id: c.id, slug: slugify(c.title) })));
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/vitrine`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];
  try {
    const cars = await loadAllShowcaseSlugs();
    const carEntries: MetadataRoute.Sitemap = cars.map(({ id, slug }) => ({
      url: `${BASE_URL}/carros/${id}-${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    return [...staticEntries, ...carEntries];
  } catch {
    return staticEntries;
  }
}
