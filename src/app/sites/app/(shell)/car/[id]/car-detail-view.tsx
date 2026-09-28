"use client";

import { ArrowLeft, Calendar, Car, Hash, Layers, type LucideIcon, Palette, Ruler, Share2, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CarCard } from "@/components/app/car-card";
import { QuantityStepper } from "@/components/app/quantity-stepper";
import { CarThumb } from "@/components/admin/car-thumb";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { ApiError } from "@/lib/api";
import { getCarById, listRelatedInSerie } from "@/lib/app-catalog";
import type { CarDetail, OwnedCar } from "@/lib/app-types";
import { useCollectionMutations } from "@/lib/collection-summary";

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <Icon size={18} strokeWidth={1.75} className="shrink-0 text-fg-subtle" aria-hidden />
      <span className="w-28 shrink-0 text-body-sm text-fg-muted">{label}</span>
      <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-fg">{children}</span>
    </div>
  );
}

async function shareCar(car: CarDetail) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/car/${car.id}` : "";
  const text = `${car.title} · ${car.serieTitle}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: car.title, text, url });
    } catch {
      // usuário cancelou o compartilhamento — sem erro.
    }
    return;
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado.");
  }
}

type LoadState = "loading" | "ok" | "not-found" | "error";

export function CarDetailView({ id }: { id: string }) {
  const { toggle, setQuantity } = useCollectionMutations();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [related, setRelated] = useState<OwnedCar[]>([]);

  const load = useCallback(() => {
    setLoadState("loading");
    getCarById(id)
      .then((detail) => {
        setCar(detail);
        setLoadState("ok");
      })
      .catch((err) => {
        setLoadState(err instanceof ApiError && err.status === 404 ? "not-found" : "error");
      });
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!car) return;
    listRelatedInSerie(car.serieId, car.id, 8)
      .then(setRelated)
      .catch(() => setRelated([]));
  }, [car]);

  if (loadState === "loading") {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
        <div className="skeleton h-5 w-16" />
        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-lg" />
          <div className="space-y-3">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-9 w-3/4" />
            <div className="skeleton h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <EmptyState kind="no-cars" description="Esse carro pode ter sido removido do catálogo." action={<ButtonLink href="/">Voltar ao início</ButtonLink>} />
      </div>
    );
  }

  if (loadState === "error" || !car) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <ErrorState onRetry={load} />
      </div>
    );
  }

  const quantity = car.quantity;
  const inCollection = quantity > 0;
  const eyebrow = [car.brandName, car.year, car.scale].filter(Boolean).join(" · ");

  const applyQuantity = (q: number) => setCar((prev) => (prev ? { ...prev, quantity: q, owned: q > 0 } : prev));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5 pb-28 sm:px-5 md:px-6 lg:px-8 lg:py-8 lg:pb-8">
      <Link href="/buscar" className="inline-flex items-center gap-1.5 text-body-sm text-fg-muted hover:text-fg">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
        Voltar
      </Link>

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div className="min-w-0 lg:sticky lg:top-8">
          <CarThumb fileId={car.imageFileId} alt={car.title} size="full" iconSize={64} priority className="aspect-square rounded-lg sm:aspect-video lg:aspect-square" />
        </div>

        <div className="min-w-0">
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
                <QuantityStepper variant="secondary" quantity={quantity} onChange={(next) => setQuantity(car.id, next, applyQuantity)} className="h-11 px-1.5 text-body" />
                <span className="text-body-sm text-fg-muted">na sua coleção</span>
              </>
            ) : (
              <Button size="lg" onClick={() => toggle(car.id, quantity, applyQuantity)}>
                Adicionar à coleção
              </Button>
            )}
            <Button variant="secondary" size="lg" leftIcon={Share2} className="ml-auto" onClick={() => void shareCar(car)}>
              Compartilhar
            </Button>
          </div>

          {car.description ? (
            <div className="mt-8">
              <h2 className="text-h2 text-fg">Sobre</h2>
              <p className="mt-2 text-body-lg text-fg-muted">{car.description}</p>
            </div>
          ) : null}

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

          {car.attributes.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-h2 text-fg">Atributos</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {car.attributes.map((attr) => (
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
        <div className="mt-10 min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-h2 text-fg">Mais da série</h2>
            <Link href={`/series/${car.serieId}`} className="text-body-sm font-medium text-primary-text hover:underline">
              Ver tudo
            </Link>
          </div>
          <div className="flex min-w-0 gap-3 overflow-x-auto pb-1">
            {related.map((item) => (
              <div key={item.id} className="w-[160px] shrink-0">
                <CarCard
                  car={item}
                  isFavorite={item.quantity > 0}
                  onToggleFavorite={() =>
                    toggle(item.id, item.quantity, (q) => setRelated((prev) => prev.map((c) => (c.id === item.id ? { ...c, quantity: q, owned: q > 0 } : c))))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        {inCollection ? (
          <div className="flex items-center justify-center gap-3">
            <QuantityStepper variant="secondary" quantity={quantity} onChange={(next) => setQuantity(car.id, next, applyQuantity)} />
            <span className="text-body-sm text-fg-muted">na sua coleção</span>
          </div>
        ) : (
          <Button fullWidth size="lg" onClick={() => toggle(car.id, quantity, applyQuantity)}>
            Adicionar à coleção
          </Button>
        )}
      </div>
    </div>
  );
}
