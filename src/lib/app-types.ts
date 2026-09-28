/** Tipos do app do colecionador (`backendToSave/docs/API-V2.md`). */

export type Page<T> = { items: T[]; total: number | null; nextCursor: string | null };

export type CarItem = {
  id: string;
  title: string;
  description: string;
  brandId: string;
  brandName: string;
  serieId: string;
  serieTitle: string;
  seriePosition: string | null;
  seriePositionNum: number | null;
  collector: string;
  color: string;
  toy: string;
  year: number;
  scale: string;
  imageFileId: string | null;
  attributeIds: string[];
};

export type OwnedCar = CarItem & { owned: boolean; quantity: number };

export type CarDetail = OwnedCar & {
  brand: { id: string; name: string };
  serie: { id: string; title: string; description: string; imageFileId: string | null; isDefault: boolean; carCount: number };
  attributes: { id: string; title: string; description: string }[];
  images: unknown[];
};

export type Serie = {
  id: string;
  title: string;
  description: string;
  isDefault: boolean;
  imageFileId: string | null;
  carCount: number;
  owned: number;
};

export type Summary = { totalItems: number; totalModels: number; duplicates: number };

export type CollectionItem = { id: string; userId: string; carId: string; quantity: number; createdAt: string };

export type CollectionItemWithCar = CollectionItem & { car: OwnedCar };

export type CollectionMutation = { item: CollectionItem | null; summary: Summary };

export type Brand = { id: string; name: string; state: "ativa" | "descontinuada" | "em_analise"; active: boolean; imageFileId: string | null; carCount: number };

export type Attribute = { id: string; title: string; description: string };
