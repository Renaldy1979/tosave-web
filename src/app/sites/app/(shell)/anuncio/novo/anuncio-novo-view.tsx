"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { createTradeListingMock } from "@/app/sites/app/_mock/trade";
import { CarThumb } from "@/components/admin/car-thumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { fieldClass, Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented";
import { errorMessage } from "@/lib/api";
import { getCarById, listCars } from "@/lib/app-catalog";
import type { CarItem, TradeType } from "@/lib/app-types";
import { useMe } from "@/lib/auth";
import { getCollectionPage } from "@/lib/collection";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const MAX_DESIRED = 20;

function PickerSheet({ open, onClose, title, footer, children }: { open: boolean; onClose: () => void; title: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 animate-fade-in bg-overlay/70 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-60 flex h-[85dvh] flex-col rounded-t-xl border border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-modal focus:outline-none
            sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:h-[70dvh] sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:pb-0"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="text-h3 text-fg">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="Fechar" className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-3 hover:text-fg">
                <X size={20} strokeWidth={1.75} />
              </button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">{children}</div>
          {footer ? <div className="shrink-0 border-t border-border px-5 py-4">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CarPickerRow({ car, selected, onClick }: { car: CarItem; selected?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md p-2 text-left transition duration-fast hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CarThumb fileId={car.imageFileId} alt={car.title} iconSize={18} className="size-12 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium text-fg">{car.title}</p>
        <p className="truncate text-caption text-fg-subtle">{car.serieTitle}</p>
      </div>
      {selected ? <span className="shrink-0 text-caption font-medium text-primary-text">Selecionado</span> : null}
    </button>
  );
}

export function AnuncioNovoView() {
  const router = useRouter();
  const me = useMe();
  const searchParams = useSearchParams();
  const preselectCarId = searchParams.get("carId");

  const [offeredCar, setOfferedCar] = useState<CarItem | null>(null);
  const [loadingOffered, setLoadingOffered] = useState(Boolean(preselectCarId));
  const [offeredPickerOpen, setOfferedPickerOpen] = useState(false);

  useEffect(() => {
    if (!preselectCarId) return;
    let alive = true;
    getCarById(preselectCarId)
      .then((car) => {
        if (alive) setOfferedCar(car);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoadingOffered(false);
      });
    return () => {
      alive = false;
    };
  }, [preselectCarId]);

  const [type, setType] = useState<TradeType>("TRADE");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [desiredCars, setDesiredCars] = useState<CarItem[]>([]);
  const [desiredPickerOpen, setDesiredPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleDesired = useCallback((car: CarItem) => {
    setDesiredCars((cur) => {
      if (cur.some((c) => c.id === car.id)) return cur.filter((c) => c.id !== car.id);
      if (cur.length >= MAX_DESIRED) return cur;
      return [...cur, car];
    });
  }, []);

  const hasPhone = Boolean(me.phone);

  const handleSubmit = async () => {
    setFormError(null);
    if (!offeredCar) {
      setFormError("Escolha o carro que vai anunciar.");
      return;
    }
    let priceValue: number | undefined;
    if (type === "SALE") {
      priceValue = Number(price.replace(",", "."));
      if (!priceValue || priceValue <= 0) {
        setFormError("Informe um preço válido.");
        return;
      }
    }
    setSubmitting(true);
    try {
      const listing = await createTradeListingMock(me.id, me.name, {
        carSnapshot: offeredCar,
        type,
        price: priceValue,
        desiredCars: type === "TRADE" ? desiredCars : undefined,
        description: description.trim() || undefined,
      });
      toast.success("Anúncio publicado.");
      router.replace(`/anuncio/${listing.id}`);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPhone) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <EmptyState
          kind="no-content"
          description="Cadastre um telefone/WhatsApp antes de anunciar — é assim que quem se interessar fala com você."
          action={<ButtonLink href="/perfil">Cadastrar telefone</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <ButtonLink href="/troca" variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2">
        Voltar
      </ButtonLink>
      <h1 className="mt-2 text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Anunciar</h1>

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Carro anunciado</p>
          {loadingOffered ? (
            <Skeleton className="h-16 rounded-lg" />
          ) : offeredCar ? (
            <button
              type="button"
              onClick={() => setOfferedPickerOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left transition duration-fast hover:bg-surface-3/50"
            >
              <CarThumb fileId={offeredCar.imageFileId} alt={offeredCar.title} iconSize={22} className="size-14 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold text-fg">{offeredCar.title}</p>
                <p className="truncate text-caption text-fg-subtle">{offeredCar.serieTitle}</p>
              </div>
              <span className="shrink-0 text-body-sm font-medium text-primary-text">Trocar</span>
            </button>
          ) : (
            <Button variant="outline" leftIcon={Plus} onClick={() => setOfferedPickerOpen(true)}>
              Escolher carro da coleção
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Tipo</p>
          <SegmentedControl
            value={type}
            onChange={setType}
            options={[
              { value: "TRADE", label: "Troca" },
              { value: "SALE", label: "Venda" },
            ]}
          />
        </div>

        {type === "SALE" ? (
          <Input label="Preço (R$)" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="50,00" />
        ) : null}

        {type === "TRADE" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-condensed text-eyebrow text-fg-subtle uppercase">Carros desejados (opcional)</p>
              <p className="text-caption text-fg-subtle">
                {desiredCars.length}/{MAX_DESIRED}
              </p>
            </div>
            <Button variant="outline" leftIcon={Plus} onClick={() => setDesiredPickerOpen(true)}>
              Buscar no catálogo
            </Button>
            {desiredCars.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {desiredCars.map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => toggleDesired(car)}
                    className="flex h-8 items-center gap-1 rounded-sm bg-surface-3 px-2 text-body-sm text-fg transition duration-fast hover:bg-surface-3/70"
                  >
                    {car.title}
                    <X size={14} strokeWidth={1.75} className="text-fg-muted" aria-hidden />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="anuncio-desc" className="block text-body-sm font-medium text-fg">
            Descrição (opcional)
          </label>
          <textarea
            id="anuncio-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Detalhes da troca ou venda"
            className={`${fieldClass} h-auto min-h-[96px] py-3`}
          />
        </div>

        {formError ? (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3.5 py-3 text-body-sm text-danger">
            {formError}
          </p>
        ) : null}

        <Button fullWidth size="lg" loading={submitting} onClick={() => void handleSubmit()}>
          Publicar anúncio
        </Button>
      </div>

      <OfferedCarPicker
        open={offeredPickerOpen}
        onClose={() => setOfferedPickerOpen(false)}
        onSelect={(car) => {
          setOfferedCar(car);
          setOfferedPickerOpen(false);
        }}
      />
      <DesiredCarsPicker
        open={desiredPickerOpen}
        onClose={() => setDesiredPickerOpen(false)}
        excludeId={offeredCar?.id}
        selectedIds={desiredCars.map((c) => c.id)}
        onToggle={toggleDesired}
      />
    </div>
  );
}

function OfferedCarPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (car: CarItem) => void }) {
  const [term, setTerm] = useState("");
  const search = useDebouncedValue(term.trim(), 300);
  const [items, setItems] = useState<CarItem[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setState("loading");
    getCollectionPage({ q: search, limit: 60 })
      .then((page) => {
        if (!alive) return;
        setItems(page.items.map((item) => item.car));
        setState("ok");
      })
      .catch(() => {
        if (alive) setState("error");
      });
    return () => {
      alive = false;
    };
  }, [open, search]);

  return (
    <PickerSheet open={open} onClose={onClose} title="Escolher carro">
      <div className="sticky -top-3 z-10 -mx-5 mb-2 bg-surface px-5 pb-2">
        <div className="relative">
          <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            aria-label="Buscar na coleção"
            placeholder="Buscar na coleção"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={`${fieldClass} pl-10`}
          />
        </div>
      </div>
      {state === "loading" ? (
        <div className="space-y-1">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))}
        </div>
      ) : state === "error" ? (
        <ErrorState compact />
      ) : items.length === 0 ? (
        <EmptyState kind="no-cars" size="sm" description="Nenhuma miniatura na sua coleção." />
      ) : (
        <div className="space-y-0.5">
          {items.map((car) => (
            <CarPickerRow key={car.id} car={car} onClick={() => onSelect(car)} />
          ))}
        </div>
      )}
    </PickerSheet>
  );
}

function DesiredCarsPicker({
  open,
  onClose,
  excludeId,
  selectedIds,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  excludeId?: string;
  selectedIds: string[];
  onToggle: (car: CarItem) => void;
}) {
  const [term, setTerm] = useState("");
  const search = useDebouncedValue(term.trim(), 300);
  const [items, setItems] = useState<CarItem[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setState("loading");
    listCars({ q: search }, null, 60)
      .then((page) => {
        if (!alive) return;
        setItems(page.items.filter((car) => car.id !== excludeId));
        setState("ok");
      })
      .catch(() => {
        if (alive) setState("error");
      });
    return () => {
      alive = false;
    };
  }, [open, search, excludeId]);

  return (
    <PickerSheet
      open={open}
      onClose={onClose}
      title="Carros desejados"
      footer={
        <Button fullWidth onClick={onClose}>
          Concluir
        </Button>
      }
    >
      <div className="sticky -top-3 z-10 -mx-5 mb-2 bg-surface px-5 pb-2">
        <div className="relative">
          <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            aria-label="Buscar no catálogo"
            placeholder="Buscar no catálogo"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={`${fieldClass} pl-10`}
          />
        </div>
      </div>
      {state === "loading" ? (
        <div className="space-y-1">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))}
        </div>
      ) : state === "error" ? (
        <ErrorState compact />
      ) : items.length === 0 ? (
        <EmptyState kind="no-cars" size="sm" />
      ) : (
        <div className="space-y-0.5">
          {items.map((car) => (
            <CarPickerRow key={car.id} car={car} selected={selectedIds.includes(car.id)} onClick={() => onToggle(car)} />
          ))}
        </div>
      )}
    </PickerSheet>
  );
}
