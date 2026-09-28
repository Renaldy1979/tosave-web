"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { ApiError } from "@/lib/api";
import { newsImageUrl } from "@/lib/appwrite";
import type { NewsItem } from "@/lib/app-types";
import { getNewsById } from "@/lib/news";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

type LoadState = "loading" | "ok" | "not-found" | "error";

export function NoticiaDetailView({ id }: { id: string }) {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const load = useCallback(() => {
    setLoadState("loading");
    getNewsById(id)
      .then((item) => {
        setNews(item);
        setLoadState("ok");
      })
      .catch((err: unknown) => {
        setNews(null);
        setLoadState(err instanceof ApiError && err.status === 404 ? "not-found" : "error");
      });
  }, [id]);

  useEffect(load, [load]);

  if (loadState === "loading") {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
        <div className="skeleton h-5 w-16" />
        <div className="mt-4 skeleton aspect-video w-full rounded-lg" />
        <div className="mt-4 space-y-3">
          <div className="skeleton h-3 w-1/4" />
          <div className="skeleton h-9 w-4/5" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <EmptyState kind="no-content" description="Essa notícia pode ter sido despublicada ou removida." action={<ButtonLink href="/noticias">Voltar às notícias</ButtonLink>} />
      </div>
    );
  }

  if (loadState === "error" || !news) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-5 md:px-6 lg:px-8">
        <ErrorState onRetry={load} />
      </div>
    );
  }

  const src = newsImageUrl(news.imageFileId, "full");

  return (
    <div className="mx-auto max-w-[760px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <Link href="/noticias" className="inline-flex items-center gap-1.5 text-body-sm text-fg-muted hover:text-fg">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
        Voltar
      </Link>

      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview do Appwrite já vem redimensionado
        <img src={src} alt="" className="mt-4 aspect-video w-full rounded-lg bg-card-stage object-cover" />
      ) : null}

      <p className="mt-4 font-condensed text-eyebrow text-fg-subtle uppercase">{dateFormatter.format(new Date(news.publishedAt))}</p>
      <h1 className="mt-1 font-display text-display-md text-fg italic sm:text-display-lg">{news.title}</h1>

      {news.content ? <p className="mt-5 text-body-lg whitespace-pre-wrap text-fg-muted">{news.content}</p> : null}

      {news.link ? (
        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-md border border-border-strong px-4 text-body font-medium text-fg transition duration-fast hover:border-primary hover:text-primary-text"
        >
          Abrir matéria
          <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
