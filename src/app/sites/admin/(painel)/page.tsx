"use client";

import { ArrowRight, Car, ImageOff, Layers, Plus, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/admin-shell";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import type { AdminCar, AdminSerie, AdminUser, Page } from "@/lib/admin-types";
import { api } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/use-api";

type Stats = { cars: number; series: number; users: number; noImage: number };

const nf = new Intl.NumberFormat("pt-BR");

async function loadStats(signal: AbortSignal): Promise<Stats> {
  const total = <T,>(path: string, query: Record<string, string | number> = {}) =>
    api<Page<T>>(path, { query: { ...query, limit: 1 }, signal }).then((p) => p.total ?? 0);
  const [cars, series, users, noImage] = await Promise.all([
    total<AdminCar>("/admin/cars"),
    total<AdminSerie>("/admin/series"),
    total<AdminUser>("/admin/users"),
    total<AdminCar>("/admin/cars", { hasImage: "false" }),
  ]);
  return { cars, series, users, noImage };
}

function StatCard({
  icon: Icon,
  label,
  value,
  hero,
  href,
  linkLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hero?: boolean;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-surface p-4 shadow-card md:p-5">
      {hero ? <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-flame" /> : null}
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-md",
          hero ? "bg-primary text-primary-fg" : "bg-primary-soft text-primary-text"
        )}
      >
        <Icon size={20} strokeWidth={1.75} aria-hidden />
      </div>
      <p className="mt-3 text-body-sm text-fg-muted">{label}</p>
      <p className="font-display text-[1.75rem] leading-tight font-extrabold text-fg italic md:text-display-lg">{nf.format(value)}</p>
      {href && linkLabel ? (
        <Link href={href} className="mt-2 inline-flex items-center gap-1 text-body-sm font-medium text-primary-text hover:underline">
          {linkLabel} <ArrowRight size={14} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const me = useMe();
  const { data, error, loading, reload } = useApi("stats", loadStats);
  const firstName = (me.name || "").split(" ")[0];

  return (
    <>
      <PageHeader
        title="Painel"
        actions={
          <ButtonLink href="/cars/new" leftIcon={Plus} size="sm" className="sm:h-11 sm:px-4 sm:text-body">
            Nova miniatura
          </ButtonLink>
        }
        description={firstName ? `Olá, ${firstName}. Visão geral do catálogo ToSave.` : "Visão geral do catálogo ToSave."} />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading || !data ? (
        <div aria-busy="true" className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard hero icon={Car} label="Miniaturas" value={data.cars} href="/cars" linkLabel="Ver todas" />
          <StatCard icon={Layers} label="Séries" value={data.series} />
          <StatCard icon={Users} label="Usuários" value={data.users} />
          <StatCard icon={ImageOff} label="Sem foto" value={data.noImage} href="/cars?hasImage=false" linkLabel="Ver sem foto" />
        </div>
      )}
    </>
  );
}
