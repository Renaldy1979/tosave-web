import type { ReactNode } from "react";

export type LegalSection = { id: string; title: string; body: ReactNode };

/** Container de leitura para páginas jurídicas (Termos, Privacidade): coluna estreita, tipografia do site. */
export function LegalPage({ title, updatedAt, intro, sections }: { title: string; updatedAt: string; intro?: ReactNode; sections: LegalSection[] }) {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-14 sm:px-5 md:px-6 lg:py-20">
      <h1 className="font-display text-h1 text-fg italic">{title}</h1>
      <p className="mt-2 text-body-sm text-fg-subtle">Última atualização: {updatedAt}</p>
      {intro ? <div className="mt-6 space-y-3 text-body text-fg-muted">{intro}</div> : null}
      <nav aria-label="Seções" className="mt-8 rounded-lg bg-surface p-4 shadow-card sm:p-5">
        <p className="text-eyebrow font-condensed text-fg-subtle uppercase">Nesta página</p>
        <ol className="mt-2 grid gap-1 text-body-sm sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primary-text hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20">
            <h2 className="text-h2 text-fg">{s.title}</h2>
            <div className="mt-3 space-y-3 text-body text-fg-muted [&_a]:text-primary-text [&_a:hover]:underline [&_li]:leading-relaxed [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
