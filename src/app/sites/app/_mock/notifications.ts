/**
 * Notificações de exemplo (lote 5b fase A). Mesmo formato de `GET /v2/notifications`
 * (`backendToSave/docs/API-V2.md`) — a fase B troca este arquivo por
 * `src/lib/notifications.ts` chamando a API de verdade.
 */

import type { NotificationItem, Page } from "@/lib/app-types";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Tem gente interessada no seu anúncio",
    body: "Alguém revelou o contato do seu anúncio do Custom Camaro.",
    read: false,
    type: "trade_interest",
    targetId: "trade-1",
    createdAt: hoursAgo(1),
  },
  {
    id: "notif-2",
    title: "Achamos uma troca pra você",
    body: "Um colecionador está oferecendo um carro que está na sua lista de desejados.",
    read: false,
    type: "trade_match",
    targetId: "trade-3",
    createdAt: hoursAgo(5),
  },
  {
    id: "notif-3",
    title: "Nova série \"JDM Legends\" chega à vitrine",
    body: "Oito lançamentos inspirados nos clássicos japoneses dos anos 90.",
    read: false,
    type: "news",
    targetId: "news-1",
    createdAt: hoursAgo(22),
  },
  {
    id: "notif-4",
    title: "Encontro de colecionadores em São Paulo",
    body: "Neste sábado, das 10h às 16h, no Parque Ibirapuera.",
    read: true,
    type: "admin_broadcast",
    targetId: null,
    createdAt: hoursAgo(80),
  },
  {
    id: "notif-5",
    title: "Clube da Troca: já são mais de 500 anúncios ativos",
    body: "A comunidade está usando o Clube da Troca para trocar e vender miniaturas repetidas.",
    read: true,
    type: "news",
    targetId: "news-2",
    createdAt: hoursAgo(130),
  },
  {
    id: "notif-6",
    title: "Tem gente interessada no seu anúncio",
    body: "Alguém revelou o contato do seu anúncio do '67 Mustang Fastback.",
    read: true,
    type: "trade_interest",
    targetId: "trade-2",
    createdAt: hoursAgo(200),
  },
  {
    id: "notif-7",
    title: "Atualize o app para a versão mais recente",
    body: "Correções de estabilidade e melhorias no catálogo de miniaturas.",
    read: true,
    type: "news",
    targetId: "news-4",
    createdAt: hoursAgo(260),
  },
];

export function listNotificationsMock(query: { cursor?: string | null; limit?: number }): Promise<Page<NotificationItem>> {
  const limit = query.limit ?? 20;
  const start = query.cursor ? Number(query.cursor) : 0;
  const items = MOCK_NOTIFICATIONS.slice(start, start + limit);
  const nextCursor = start + limit < MOCK_NOTIFICATIONS.length ? String(start + limit) : null;
  return delay({ items, total: MOCK_NOTIFICATIONS.length, nextCursor });
}

export function unreadNotificationsCountMock(): Promise<{ count: number }> {
  return delay({ count: MOCK_NOTIFICATIONS.filter((n) => !n.read).length }, 150);
}

export function markNotificationReadMock(_id: string): Promise<{ success: true }> {
  return delay({ success: true }, 150);
}

export function markAllNotificationsReadMock(): Promise<{ success: true }> {
  return delay({ success: true }, 150);
}

/** `type`/`targetId` → rota (mesma lógica do toque no push, `notifications/routing.ts` do app mobile). */
export function notificationRoute(type: string, targetId: string | null): string | null {
  if (type === "news" && targetId) return `/noticia/${targetId}`;
  if ((type === "trade_match" || type === "trade_interest") && targetId) return `/anuncio/${targetId}`;
  return null;
}
