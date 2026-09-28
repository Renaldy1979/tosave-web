"use client";

import { ArrowLeft, Calendar, Car, Hash, Layers, type LucideIcon, Palette, Ruler, Share2, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { CarCard } from "@/components/app/car-card";
import { QuantityStepper } from "@/components/app/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { MOCK_ATTRIBUTES, MOCK_CARS } from "../../../_mock/data";
import { useCollectionStore } from "../../../_mock/collection-store";

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <Icon size={18} strokeWidth={1.75} className="shrink-0 text-fg-subtle" aria-hidden />
      <span className="w-28 shrink-0 text-body-sm text-fg-muted">{label}</span>
      <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-fg">{children}</span>
    </div>
  );
}

export function CarDetailView({ id }: { id: string }) {
  const collection = useCollectionStore();
  const car = MOCK_CARS.find((c) => c.id === id);

  const related = useMemo(() => (car ? MOCK_CARS.filter((c) => c.serieId === car.serieId && c.id !== car.id).slice(0, 8) : []), [car]);

  if (!car) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <EmptyState
          kind="no-cars"
          description="Esse carro pode ter sido removido do catálogo."
          action={<ButtonLink href="/">Voltar ao início</ButtonLink>}
        />
      </div>
    );
  }

  const quantity = collection.quantityOf(car.id);
  const inCollection = quantity > 0;
  const attributes = MOCK_ATTRIBUTES.filter((a) => car.attributeIds.includes(a.id));
  const eyebrow = [car.brandName, car.year, car.scale].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5 pb-28 sm:px-5 md:px-6 lg:px-8 lg:py-8 lg:pb-8">
      <Link href="/buscar" className="inline-flex items-center gap-1.5 text-body-sm text-fg-muted hover:text-fg">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
        Voltar
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-8">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-card-stage sm:aspect-video lg:aspect-square">
            <Car size={64} strokeWidth={1.5} className="text-fg-subtle/40" aria-hidden />
          </div>
        </div>

        <div>
          <p className="font-condensed text-eyebrow text-fg-subtle uppercase">{eyebrow}</p>
          <h1 className="mt-1 font-display text-display-xl font-extrabold text-fg italic">{car.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Link href={`/series/${car.serieId}`}>
              <Badge variant="primary">{car.serieTitle}</Badge>
            </Link>
            {car.seriePosition ? <Badge variant="neutral">{car.seriePosition}</Badge> : null}
          </div>

          <div className="mt-5 flex items-center gap-2">
            {inCollection ? (
              <>
                <QuantityStepper
                  variant="secondary"
                  quantity={quantity}
                  onChange={(next) => collection.setQuantity(car.id, next)}
                  className="h-11 px-1.5 text-body"
                />
                <span className="text-body-sm text-fg-muted">na sua coleção</span>
              </>
            ) : (
              <Button size="lg" onClick={() => collection.toggle(car.id)}>
                Adicionar à coleção
              </Button>
            )}
            <Button variant="secondary" size="lg" leftIcon={Share2} className="ml-auto">
              Compartilhar
            </Button>
          </div>

          <div className="mt-8">
            <h2 className="text-h2 text-fg">Sobre</h2>
            <p className="mt-2 text-body-lg text-fg-muted">{car.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-h2 text-fg">Ficha técnica</h2>
            <div className="mt-2">
              <InfoRow icon={Tag} label="Marca">
                {car.brandName}
              </InfoRow>
              <InfoRow icon={Hash} label="Código">
                <span className="font-mono">{car.toy}</span>
              </InfoRow>
              <InfoRow icon={Calendar} label="Ano">
                {car.year}
              </InfoRow>
              <InfoRow icon={Layers} label="Série">
                {car.serieTitle}
              </InfoRow>
              <InfoRow icon={Ruler} label="Escala">
                <span className="font-mono">{car.scale}</span>
              </InfoRow>
              {car.color ? (
                <InfoRow icon={Palette} label="Cor">
                  {car.color}
                </InfoRow>
              ) : null}
            </div>
          </div>

          {attributes.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-h2 text-fg">Atributos</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {attributes.map((attr) => (
                  <Badge key={attr.id} variant="accent" icon={Sparkles}>
                    {attr.title}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-h2 text-fg">Mais da série</h2>
            <Link href={`/series/${car.serieId}`} className="text-body-sm font-medium text-primary-text hover:underline">
              Ver tudo
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {related.map((item) => (
              <div key={item.id} className="w-[160px] shrink-0">
                <CarCard car={item} isFavorite={collection.quantityOf(item.id) > 0} onToggleFavorite={() => collection.toggle(item.id)} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        {inCollection ? (
          <div className="flex items-center justify-center gap-3">
            <QuantityStepper variant="secondary" quantity={quantity} onChange={(next) => collection.setQuantity(car.id, next)} />
            <span className="text-body-sm text-fg-muted">na sua coleção</span>
          </div>
        ) : (
          <Button fullWidth size="lg" onClick={() => collection.toggle(car.id)}>
            Adicionar à coleção
          </Button>
        )}
      </div>
    </div>
  );
}
