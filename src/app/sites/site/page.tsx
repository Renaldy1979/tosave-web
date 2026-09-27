import { Car, Layers, Share2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CarCard } from "@/components/site/car-card";
import { ButtonLink } from "@/components/ui/button";
import { serieLogoUrl } from "@/lib/storage-url";
import { APP_URL } from "@/lib/env";
import { marketingNumber } from "@/lib/marketing-number";
import { loadFeaturedSeries, loadPublicStats, loadShowcase, type CarItem, type PublicFeaturedSerie, type PublicStats } from "@/lib/public-api";

// Renderiza a cada visita: a curadoria da vitrine no painel aparece na hora (o ISR não renovava no container).
export const dynamic = "force-dynamic";

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Car,
    title: "Monte sua garagem digital",
    description: "Cadastre cada Hot Wheels e Matchbox da sua coleção, com foto, código (toy) e quantidade.",
  },
  {
    icon: Layers,
    title: "Organize por série, marca e ano",
    description: "Filtre por atributos e encontre qualquer miniatura em segundos, do jeito que você coleciona.",
  },
  {
    icon: Share2,
    title: "Compartilhe com a comunidade",
    description: "Mostre sua garagem para outros colecionadores direto pelo WhatsApp.",
  },
];

async function loadHomeData() {
  const [stats, showcase, series] = await Promise.all([
    loadPublicStats({ revalidate: 0 }).catch((): PublicStats | null => null),
    loadShowcase({ limit: 8 }, { revalidate: 0 }).catch((): { items: CarItem[] } => ({ items: [] })),
    loadFeaturedSeries({ revalidate: 0 }).catch((): PublicFeaturedSerie[] => []),
  ]);
  return { stats, showcaseItems: showcase.items, series };
}

export default async function SiteHomePage() {
  const { stats, showcaseItems, series } = await loadHomeData();

  return (
    <>
      <section className="ink relative overflow-hidden border-b border-white/5">
        <div aria-hidden className="absolute inset-0 bg-hero-glow" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-5 md:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-24">
          <div className="lg:col-span-6">
            <p className="font-condensed text-eyebrow text-primary-text uppercase">Uma comunidade viva</p>
            <h1 className="mt-3 max-w-lg font-display text-display-2xl font-extrabold text-fg italic">
              Sua garagem em escala <span className="bg-flame bg-clip-text text-transparent">1:64</span>.
            </h1>
            <p className="mt-5 max-w-md text-body-lg text-fg-muted">
              Milhares de miniaturas esperando por você. Organize sua garagem, descubra raridades e faça parte da
              comunidade ToSave.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`${APP_URL}/cadastro`} variant="flame" size="lg">
                Criar minha coleção
              </ButtonLink>
              <ButtonLink href={`${APP_URL}/entrar`} variant="ghost" size="lg">
                Entrar
              </ButtonLink>
            </div>
            {stats ? (
              <p className="mt-8 text-body-sm text-fg-subtle">
                <span className="font-mono text-fg">{marketingNumber(stats.totalCars)}</span> miniaturas esperando por
                você · <span className="font-mono text-fg">{marketingNumber(stats.totalSeries)}</span> séries
                {stats.totalMembers !== null ? (
                  <>
                    {" "}· <span className="font-mono text-fg">{marketingNumber(stats.totalMembers)}</span> colecionadores
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto max-w-md">
              <span aria-hidden className="absolute inset-8 rounded-xl shadow-glow" />
              <Image
                src="/brand/logo-car.png"
                alt="Silhueta da marca ToSave"
                width={644}
                height={185}
                priority
                className="relative w-full -rotate-3 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-[1440px] px-4 py-16 sm:px-5 md:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-h1 text-fg italic">Como funciona</h2>
          <p className="mt-3 text-body-lg text-fg-muted">Três passos para organizar sua garagem e fazer parte da comunidade ToSave.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="relative rounded-lg bg-surface p-6 shadow-card">
              <div className="flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary-text">
                <Icon size={22} strokeWidth={1.75} aria-hidden />
              </div>
              <span className="mt-4 block font-mono text-caption text-fg-subtle">0{i + 1}</span>
              <h3 className="mt-1 text-h3 text-fg">{title}</h3>
              <p className="mt-1.5 text-body-sm text-fg-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {stats ? (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
            <div className={`grid grid-cols-2 gap-4 ${stats.totalMembers !== null ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
              {[
                { icon: Car, label: "Miniaturas", value: stats.totalCars },
                { icon: Layers, label: "Séries", value: stats.totalSeries },
                ...(stats.totalMembers !== null ? [{ icon: Users, label: "Colecionadores", value: stats.totalMembers }] : []),
                { icon: Car, label: "Itens colecionados", value: stats.totalCollected },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <div className="mx-auto flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary-text">
                    <Icon size={22} strokeWidth={1.75} aria-hidden />
                  </div>
                  <p className="mt-3 font-display text-[1.5rem] leading-tight font-extrabold text-fg italic md:text-display-lg">
                    {marketingNumber(value)}
                  </p>
                  <p className="text-body-sm text-fg-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showcaseItems.length ? (
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-5 md:px-6 lg:px-8 lg:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-h1 text-fg italic">Destaques da vitrine</h2>
              <p className="mt-1 text-body text-fg-muted">Uma amostra do que está esperando por você na comunidade ToSave.</p>
            </div>
            <Link href="/vitrine" className="hidden shrink-0 text-body-sm font-medium text-primary-text hover:underline sm:block">
              Ver vitrine completa →
            </Link>
          </div>
          <ul role="list" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-6">
            {showcaseItems.map((car) => (
              <li key={car.id}>
                <CarCard car={car} />
              </li>
            ))}
          </ul>
          <Link href="/vitrine" className="mt-6 block text-center text-body-sm font-medium text-primary-text hover:underline sm:hidden">
            Ver vitrine completa →
          </Link>
        </section>
      ) : null}

      {series.length ? (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-5 md:px-6 lg:px-8 lg:py-24">
            <h2 className="font-display text-h1 text-fg italic">Séries em destaque</h2>
            <ul role="list" className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {series.map((serie) => {
                const logo = serieLogoUrl(serie.imageFileId);
                return (
                  <li key={serie.id}>
                    <a
                      href={`${APP_URL}/cadastro`}
                      className="group flex flex-col items-center rounded-lg bg-bg p-5 text-center shadow-card transition duration-fast hover:shadow-card-hover"
                    >
                      <div className="flex size-16 items-center justify-center rounded-md bg-surface-2">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- preview do Appwrite já vem redimensionado
                          <img src={logo} alt="" className="size-12 object-contain" />
                        ) : (
                          <Layers size={28} strokeWidth={1.75} className="text-fg-subtle/40" aria-hidden />
                        )}
                      </div>
                      <p className="mt-3 line-clamp-2 text-body-sm font-semibold text-fg group-hover:text-primary-text">{serie.title}</p>
                      <p className="mt-0.5 font-mono text-caption text-fg-subtle">{marketingNumber(serie.carCount)} miniaturas</p>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-4 py-16 text-center sm:px-5 md:px-6 lg:px-8">
          <h2 className="max-w-xl font-display text-h1 text-fg italic">A comunidade está esperando por você.</h2>
          <p className="max-w-md text-body text-fg-muted">Leva menos de um minuto, é de graça, e sua garagem vai com você para onde for.</p>
          <ButtonLink href={`${APP_URL}/cadastro`} variant="flame" size="lg">
            Criar minha coleção
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
