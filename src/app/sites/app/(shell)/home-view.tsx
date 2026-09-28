"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { CarCard } from "@/components/app/car-card";
import { SeriesCard } from "@/components/app/series-card";
import { MOCK_CARS, MOCK_SERIES, MOCK_USER, carCountBySerie, ownedCountBySerie } from "../_mock/data";
import { useCollectionStore } from "../_mock/collection-store";

const featuredSeries = MOCK_SERIES.filter((s) => s.isDefault);

export function HomeView() {
  const collection = useCollectionStore();
  const firstName = MOCK_USER.name.split(" ")[0];

  return (
    <div>
      <div className="ink relative overflow-hidden px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pt-10">
        <span aria-hidden className="absolute inset-0 bg-hero-glow" />
        <div className="relative mx-auto max-w-[1280px]">
          <p className="text-body-sm text-ink-fg/60">Olá, {firstName}</p>
          <h1 className="mt-0.5 font-display text-h1 text-fg italic lg:text-display-lg">O que vamos garimpar hoje?</h1>

          <Link
            href="/buscar"
            className="mt-4 flex h-13 items-center gap-2.5 rounded-md border border-white/10 bg-white/5 px-3.5 text-body text-fg-subtle backdrop-blur transition duration-fast hover:border-white/20 hover:bg-white/10 lg:max-w-md"
          >
            <Search size={18} strokeWidth={1.75} aria-hidden />
            Buscar por nome ou código
          </Link>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-condensed text-eyebrow text-ink-fg/60 uppercase">Séries em destaque</p>
              <Link href="/series" className="text-body-sm font-medium text-primary-text hover:underline">
                Ver tudo
              </Link>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" style={{ scrollSnapType: "x mandatory" }}>
              {featuredSeries.map((serie) => (
                <div key={serie.id} style={{ scrollSnapAlign: "start" }}>
                  <SeriesCard
                    id={serie.id}
                    title={serie.title}
                    description={serie.description}
                    carCount={carCountBySerie(serie.id)}
                    ownedCount={ownedCountBySerie(serie.id, collection.quantities)}
                    featured
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-5 md:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Miniaturas</p>
          <p className="text-body-sm text-fg-subtle">{collection.summary.totalModels} na sua coleção</p>
        </div>
        <div className="grid grid-cols-2 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
          {MOCK_CARS.map((car, i) => (
            <CarCard
              key={car.id}
              car={car}
              priority={i < 4}
              isFavorite={collection.quantityOf(car.id) > 0}
              onToggleFavorite={() => collection.toggle(car.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
