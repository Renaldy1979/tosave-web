"use client";

import { api } from "./api";
import type { Page, TradeListing, TradeStatus, TradeType } from "./app-types";

/** Clube da Troca — rotas `/v2/trade*` (`backendToSave/docs/API-V2.md`). */

export function listTrade(query: { type?: TradeType; q?: string; cursor?: string | null; limit?: number }, signal?: AbortSignal): Promise<Page<TradeListing>> {
  return api<Page<TradeListing>>("/v2/trade", {
    query: { type: query.type, q: query.q?.trim() || undefined, cursor: query.cursor, limit: query.limit ?? 20 },
    signal,
  });
}

export function listMyTrade(query: { status?: TradeStatus; cursor?: string | null; limit?: number }, signal?: AbortSignal): Promise<Page<TradeListing>> {
  return api<Page<TradeListing>>("/v2/trade/mine", { query: { status: query.status, cursor: query.cursor, limit: query.limit ?? 20 }, signal });
}

export function getTradeById(id: string, signal?: AbortSignal): Promise<TradeListing> {
  return api<TradeListing>(`/v2/trade/${encodeURIComponent(id)}`, { signal });
}

export type CreateTradeInput = {
  carId: string;
  type: TradeType;
  price?: number;
  desiredCarIds?: string[];
  description?: string;
};

export function createTradeListing(input: CreateTradeInput): Promise<TradeListing> {
  return api<TradeListing>("/v2/trade", {
    method: "POST",
    body: {
      carId: input.carId,
      type: input.type,
      price: input.type === "SALE" ? input.price : undefined,
      desiredCarIds: input.type === "TRADE" ? input.desiredCarIds : undefined,
      description: input.description,
    },
  });
}

/** Só para anúncios de terceiros — o dono já vê o próprio telefone (`useMe()`). */
export function revealTradeContact(id: string): Promise<{ phone: string | null }> {
  return api<{ phone: string | null }>(`/v2/trade/${encodeURIComponent(id)}/contact`, { method: "POST" });
}

export function completeTradeListing(id: string): Promise<TradeListing> {
  return api<TradeListing>(`/v2/trade/${encodeURIComponent(id)}/complete`, { method: "PUT" });
}

export function cancelTradeListing(id: string): Promise<TradeListing> {
  return api<TradeListing>(`/v2/trade/${encodeURIComponent(id)}`, { method: "DELETE" });
}
