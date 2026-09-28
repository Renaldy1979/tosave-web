"use client";

import { api } from "./api";
import type { CollectionItemWithCar, CollectionMutation, Page, Summary } from "./app-types";

/** Coleção do usuário — rotas `/v2/collection` (`backendToSave/docs/API-V2.md`). */

export type CollectionSort = "recent" | "name" | "year" | "quantity";

export function getCollectionPage(
  query: { q?: string; duplicatesOnly?: boolean; sort?: CollectionSort; cursor?: string | null; limit?: number },
  signal?: AbortSignal
): Promise<Page<CollectionItemWithCar>> {
  return api<Page<CollectionItemWithCar>>("/v2/collection", {
    query: {
      q: query.q?.trim() || undefined,
      duplicatesOnly: query.duplicatesOnly || undefined,
      sort: query.sort ?? "recent",
      cursor: query.cursor,
      limit: query.limit ?? 20,
    },
    signal,
  });
}

export function getCollectionSummary(signal?: AbortSignal): Promise<Summary> {
  return api<Summary>("/v2/collection/summary", { signal });
}

export function addToCollection(carId: string): Promise<CollectionMutation> {
  return api<CollectionMutation>(`/v2/collection/${encodeURIComponent(carId)}/add`, { method: "POST" });
}

export function setCollectionQuantity(carId: string, quantity: number): Promise<CollectionMutation> {
  return api<CollectionMutation>(`/v2/collection/${encodeURIComponent(carId)}`, {
    method: "PUT",
    body: { quantity: Math.max(0, Math.min(99, Math.floor(quantity))) },
  });
}

export function removeFromCollection(carId: string): Promise<CollectionMutation> {
  return api<CollectionMutation>(`/v2/collection/${encodeURIComponent(carId)}`, { method: "DELETE" });
}
