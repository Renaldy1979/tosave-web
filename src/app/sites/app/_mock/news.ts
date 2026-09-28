/**
 * Notícias de exemplo (lote 5b fase A). Mesmo formato de `GET /v2/news`
 * (`backendToSave/docs/API-V2.md`) — a fase B troca este arquivo pelas
 * chamadas reais em `src/lib/news.ts` sem mexer nas telas.
 */

import type { NewsItem, Page } from "@/lib/app-types";

function daysAgo(days: number, hours = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Nova série \"JDM Legends\" chega à vitrine",
    summary: "Oito lançamentos inspirados nos clássicos japoneses dos anos 90, com Skyline, Supra e RX-7.",
    content:
      "A partir desta semana, a série JDM Legends está disponível para toda a comunidade. São oito miniaturas inspiradas nos ícones do tuning japonês, incluindo o Nissan Skyline GT-R (R34), o Toyota Supra MK4 e o Mazda RX-7 FD. Confira o catálogo completo e comece a caçar as suas.",
    imageFileId: null,
    link: null,
    publishedAt: daysAgo(1),
  },
  {
    id: "news-2",
    title: "Clube da Troca: já são mais de 500 anúncios ativos",
    summary: "A comunidade está usando o Clube da Troca para trocar e vender miniaturas repetidas.",
    content:
      "Em menos de dois meses, o Clube da Troca já passou de 500 anúncios ativos. Lembre-se: cadastre seu telefone no Perfil para poder anunciar e receber contatos de outros colecionadores.",
    imageFileId: null,
    link: null,
    publishedAt: daysAgo(4),
  },
  {
    id: "news-3",
    title: "Encontro de colecionadores em São Paulo",
    summary: "Neste sábado, colecionadores de todo o estado se reúnem para trocas presenciais.",
    content:
      "O próximo encontro presencial acontece neste sábado, das 10h às 16h, no Parque Ibirapuera. Leve suas miniaturas repetidas para trocar e aproveite para conhecer outros membros do ToSave.",
    imageFileId: null,
    link: "https://tosave.cloud",
    publishedAt: daysAgo(6),
  },
  {
    id: "news-4",
    title: "Atualize o app para a versão mais recente",
    summary: "Correções de estabilidade e melhorias no catálogo de miniaturas.",
    content: "Disponibilizamos uma nova versão do app nas lojas, com correções de estabilidade e melhorias na busca do catálogo.",
    imageFileId: null,
    link: null,
    publishedAt: daysAgo(9),
  },
  {
    id: "news-5",
    title: "\"Muscle Mania\" completa: confira quem já fechou a série",
    summary: "Dez lançamentos clássicos do muscle car americano já estão disponíveis.",
    content:
      "A série Muscle Mania chegou ao seu décimo e último lançamento. Quem já tem a série completa pode conferir o selo \"Completa\" na tela de Estatísticas.",
    imageFileId: null,
    link: null,
    publishedAt: daysAgo(13),
  },
  {
    id: "news-6",
    title: "Dica: como funciona o Super Treasure Hunt",
    summary: "Entenda a diferença entre T-Hunt e Super T-Hunt no catálogo do ToSave.",
    content:
      "Miniaturas com o atributo Super T-Hunt têm pintura especial e pneus de borracha real, e são bem mais raras que os T-Hunt comuns. Use o filtro de atributos na busca para caçar as suas.",
    imageFileId: null,
    link: null,
    publishedAt: daysAgo(18),
  },
  {
    id: "news-7",
    title: "Manutenção programada concluída",
    summary: "O app ficou fora do ar por 20 minutos na madrugada de terça-feira.",
    content: "Concluímos a manutenção programada dos servidores. Nenhum dado de coleção foi afetado.",
    imageFileId: null,
    link: null,
    publishedAt: daysAgo(24),
  },
];

export function listNewsMock(query: { cursor?: string | null; limit?: number }): Promise<Page<NewsItem>> {
  const limit = query.limit ?? 20;
  const start = query.cursor ? Number(query.cursor) : 0;
  const items = MOCK_NEWS.slice(start, start + limit);
  const nextCursor = start + limit < MOCK_NEWS.length ? String(start + limit) : null;
  return delay({ items, total: MOCK_NEWS.length, nextCursor });
}

export function getNewsByIdMock(id: string): Promise<NewsItem | null> {
  return delay(MOCK_NEWS.find((n) => n.id === id) ?? null);
}
