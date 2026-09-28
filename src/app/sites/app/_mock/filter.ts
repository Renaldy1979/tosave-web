import { MOCK_CARS, type MockCar } from "./data";

export type CarFilters = {
  q: string;
  years: number[];
  serieId: string | null;
  brandId: string | null;
  attributeIds: string[];
};

export const EMPTY_FILTERS: CarFilters = { q: "", years: [], serieId: null, brandId: null, attributeIds: [] };

export const ALL_YEARS = Array.from(new Set(MOCK_CARS.map((c) => c.year))).sort((a, b) => b - a);

export function hasActiveFilter(filters: CarFilters): boolean {
  return Boolean(filters.q.trim() || filters.years.length || filters.serieId || filters.brandId || filters.attributeIds.length);
}

export function filterCars(cars: MockCar[], filters: CarFilters): MockCar[] {
  const q = filters.q.trim().toLowerCase();
  return cars.filter((car) => {
    if (q) {
      const matchesTitle = car.title.toLowerCase().includes(q);
      const matchesToy = car.toy.toLowerCase().startsWith(q);
      const matchesCollector = car.collector.toLowerCase() === q.replace(/^#/, "");
      if (!matchesTitle && !matchesToy && !matchesCollector) return false;
    }
    if (filters.years.length && !filters.years.includes(car.year)) return false;
    if (filters.serieId && car.serieId !== filters.serieId) return false;
    if (filters.brandId && car.brandId !== filters.brandId) return false;
    if (filters.attributeIds.length && !filters.attributeIds.every((id) => car.attributeIds.includes(id))) return false;
    return true;
  });
}
