"use client";

import { api } from "./api";
import type { NotificationItem, Page } from "./app-types";

/** Notificações — rotas `/v2/notifications*` (`backendToSave/docs/API-V2.md`). */

export function listNotifications(query: { cursor?: string | null; limit?: number }, signal?: AbortSignal): Promise<Page<NotificationItem>> {
  return api<Page<NotificationItem>>("/v2/notifications", { query: { cursor: query.cursor, limit: query.limit ?? 20 }, signal });
}

export function getUnreadNotificationsCount(signal?: AbortSignal): Promise<{ count: number }> {
  return api<{ count: number }>("/v2/notifications/unread-count", { signal });
}

export function markNotificationRead(id: string): Promise<{ success: true }> {
  return api<{ success: true }>(`/v2/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
}

export function markAllNotificationsRead(): Promise<{ success: true }> {
  return api<{ success: true }>("/v2/notifications/read-all", { method: "PATCH" });
}

/** `type`/`targetId` → rota (mesma lógica do toque no push, `notifications/routing.ts` do app mobile). */
export function notificationRoute(type: string, targetId: string | null): string | null {
  if (type === "news" && targetId) return `/noticia/${targetId}`;
  if ((type === "trade_match" || type === "trade_interest") && targetId) return `/anuncio/${targetId}`;
  return null;
}
