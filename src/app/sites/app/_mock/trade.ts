/**
 * Clube da Troca de exemplo (lote 5b fase A). Mesmo formato das rotas
 * `/v2/trade*` (`backendToSave/docs/API-V2.md`) — a fase B troca este
 * arquivo por `src/lib/trade.ts` chamando a API de verdade.
 *
 * "Meus anúncios" usa o id/nome do usuário logado de verdade (`useMe()`,
 * já real desde o lote 5a) para os botões de dono funcionarem na prévia.
 */

import type { CarItem, Page, TradeListing, TradeStatus, TradeType } from "@/lib/app-types";
import { findMockCar } from "./cars";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const MOCK_USER_PHONES: Record<string, string | null> = {
  "mock-user-1": "5511988881234",
  "mock-user-2": null,
  "mock-user-3": "5521977775566",
};

let nextId = 1;
function newId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

const VITRINE: TradeListing[] = [
  {
    id: "trade-1",
    car: findMockCar("mock-car-1"),
    userId: "mock-user-1",
    userName: "Rafael Andrade",
    type: "TRADE",
    price: null,
    description: "Troco por qualquer JDM da lista de desejados. Miniatura sem uso, só saiu da caixa pra foto.",
    status: "ACTIVE",
    desiredCars: [findMockCar("mock-car-3"), findMockCar("mock-car-4")],
    hasContact: true,
    createdAt: daysAgo(1),
  },
  {
    id: "trade-2",
    car: findMockCar("mock-car-5"),
    userId: "mock-user-2",
    userName: "Bianca Souza",
    type: "SALE",
    price: 45,
    description: "Lamborghini Huracán Super Treasure Hunt, lacrado.",
    status: "ACTIVE",
    desiredCars: [],
    hasContact: false,
    createdAt: daysAgo(2),
  },
  {
    id: "trade-3",
    car: findMockCar("mock-car-3"),
    userId: "mock-user-3",
    userName: "Diego Martins",
    type: "TRADE",
    price: null,
    description: "",
    status: "ACTIVE",
    desiredCars: [findMockCar("mock-car-1")],
    hasContact: true,
    createdAt: daysAgo(3),
  },
  {
    id: "trade-4",
    car: findMockCar("mock-car-6"),
    userId: "mock-user-1",
    userName: "Rafael Andrade",
    type: "SALE",
    price: 30,
    description: "Repetido na coleção, valor negociável.",
    status: "ACTIVE",
    desiredCars: [],
    hasContact: true,
    createdAt: daysAgo(4),
  },
  {
    id: "trade-5",
    car: findMockCar("mock-car-2"),
    userId: "mock-user-2",
    userName: "Bianca Souza",
    type: "TRADE",
    price: null,
    description: "Aceito propostas de qualquer série de muscle car.",
    status: "ACTIVE",
    desiredCars: [],
    hasContact: false,
    createdAt: daysAgo(6),
  },
  {
    id: "trade-6",
    car: findMockCar("mock-car-8"),
    userId: "mock-user-3",
    userName: "Diego Martins",
    type: "SALE",
    price: 25,
    description: "",
    status: "ACTIVE",
    desiredCars: [],
    hasContact: true,
    createdAt: daysAgo(8),
  },
];

let myListings: TradeListing[] | null = null;

function ensureMyListings(currentUserId: string, currentUserName: string): TradeListing[] {
  if (!myListings) {
    myListings = [
      {
        id: "trade-mine-1",
        car: findMockCar("mock-car-7"),
        userId: currentUserId,
        userName: currentUserName,
        type: "SALE",
        price: 35,
        description: "Vendo por causa de repetida na coleção.",
        status: "ACTIVE",
        desiredCars: [],
        hasContact: true,
        createdAt: daysAgo(2),
      },
      {
        id: "trade-mine-2",
        car: findMockCar("mock-car-4"),
        userId: currentUserId,
        userName: currentUserName,
        type: "TRADE",
        price: null,
        description: "Troca fechada com outro colecionador.",
        status: "COMPLETED",
        desiredCars: [findMockCar("mock-car-2")],
        hasContact: true,
        createdAt: daysAgo(12),
      },
      {
        id: "trade-mine-3",
        car: findMockCar("mock-car-6"),
        userId: currentUserId,
        userName: currentUserName,
        type: "TRADE",
        price: null,
        description: "",
        status: "CANCELLED",
        desiredCars: [],
        hasContact: true,
        createdAt: daysAgo(18),
      },
    ];
  }
  return myListings;
}

export function listTradeMock(query: { type?: TradeType; q?: string; cursor?: string | null; limit?: number }): Promise<Page<TradeListing>> {
  const limit = query.limit ?? 20;
  let items = VITRINE.filter((t) => t.status === "ACTIVE");
  if (query.type) items = items.filter((t) => t.type === query.type);
  const q = query.q?.trim().toLowerCase();
  if (q) items = items.filter((t) => t.car.title.toLowerCase().includes(q) || t.car.toy.toLowerCase().includes(q));
  const start = query.cursor ? Number(query.cursor) : 0;
  const page = items.slice(start, start + limit);
  const nextCursor = start + limit < items.length ? String(start + limit) : null;
  return delay({ items: page, total: items.length, nextCursor });
}

export function listMyTradeMock(
  currentUserId: string,
  currentUserName: string,
  query: { status?: TradeStatus; cursor?: string | null; limit?: number }
): Promise<Page<TradeListing>> {
  const limit = query.limit ?? 20;
  let items = ensureMyListings(currentUserId, currentUserName);
  if (query.status) items = items.filter((t) => t.status === query.status);
  const start = query.cursor ? Number(query.cursor) : 0;
  const page = items.slice(start, start + limit);
  const nextCursor = start + limit < items.length ? String(start + limit) : null;
  return delay({ items: page, total: items.length, nextCursor });
}

export function getTradeByIdMock(id: string, currentUserId: string, currentUserName: string): Promise<TradeListing | null> {
  const all = [...VITRINE, ...ensureMyListings(currentUserId, currentUserName)];
  return delay(all.find((t) => t.id === id) ?? null);
}

/** Só para anúncios de terceiros — o dono já vê o próprio telefone (`useMe()`). */
export function revealTradeContactMock(id: string): Promise<{ phone: string | null }> {
  const listing = VITRINE.find((t) => t.id === id);
  return delay({ phone: listing ? (MOCK_USER_PHONES[listing.userId] ?? null) : null }, 400);
}

export function completeTradeListingMock(id: string): Promise<TradeListing> {
  const list = myListings ?? [];
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return Promise.reject(new Error("Anúncio não encontrado."));
  list[idx] = { ...list[idx], status: "COMPLETED" };
  return delay(list[idx], 300);
}

export function cancelTradeListingMock(id: string): Promise<TradeListing> {
  const list = myListings ?? [];
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return Promise.reject(new Error("Anúncio não encontrado."));
  list[idx] = { ...list[idx], status: "CANCELLED" };
  return delay(list[idx], 300);
}

export type CreateTradeInput = {
  carSnapshot: CarItem;
  type: TradeType;
  price?: number;
  desiredCars?: CarItem[];
  description?: string;
};

export function createTradeListingMock(currentUserId: string, currentUserName: string, input: CreateTradeInput): Promise<TradeListing> {
  const listing: TradeListing = {
    id: newId("trade-mine"),
    car: input.carSnapshot,
    userId: currentUserId,
    userName: currentUserName,
    type: input.type,
    price: input.type === "SALE" ? (input.price ?? null) : null,
    description: input.description?.trim() ?? "",
    status: "ACTIVE",
    desiredCars: input.type === "TRADE" ? (input.desiredCars ?? []) : [],
    hasContact: true,
    createdAt: new Date().toISOString(),
  };
  ensureMyListings(currentUserId, currentUserName).unshift(listing);
  return delay(listing, 400);
}
