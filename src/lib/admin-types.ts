/** Tipos das rotas `/admin/*` (backendToSave/docs/API-V2.md, seção Admin). */

export type Page<T> = { items: T[]; total: number | null; nextCursor: string | null };

export type AdminCar = {
  id: string;
  name: string;
  description: string | null;
  serieId: string;
  serieName: string;
  seriePosition: string | null;
  collector: string | null;
  colorModel: string | null;
  toy: string | null;
  year: string | null;
  brandId: string | null;
  brand: string | null;
  scale: string;
  imageFileId: string | null;
  attributeIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CarInput = {
  name: string;
  serieId: string;
  scale?: string;
  description?: string | null;
  seriePosition?: string | null;
  collector?: string | null;
  colorModel?: string | null;
  toy?: string | null;
  year?: string | null;
  brandId?: string | null;
  attributeIds?: string[];
};

export type AdminSerie = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  imageFileId: string | null;
  carCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminBrand = { id: string; name: string; active: boolean; carCount: number };

export type AdminAttribute = { id: string; title: string; description: string | null; carCount: number };

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "blocked";
  phoneNumber: string | null;
  collectionModels: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminConfig = {
  termsUrl: string;
  privacyUrl: string;
  supportEmail: string;
  passwordRecoveryUrl: string;
  minAppVersion: string;
  updatedAt: string;
};
