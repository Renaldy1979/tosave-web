import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const USER_ROLES = ["ADMIN", "COLLECTOR"] as const;
export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export const BRAND_STATES = ["ativa", "descontinuada", "em análise"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type BrandState = (typeof BRAND_STATES)[number];

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    role: text("role", { enum: USER_ROLES }).notNull().default("COLLECTOR"),
    status: text("status", { enum: USER_STATUSES }).notNull().default("ACTIVE"),
    expoPushToken: text("expo_push_token"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    index("users_role_idx").on(t.role),
  ],
);

export const brands = sqliteTable(
  "brands",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    // Situação editorial da marca; independente de `active` (visibilidade no site).
    state: text("state", { enum: BRAND_STATES }).notNull().default("ativa"),
    image: text("image"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("brands_name_unique").on(t.name)],
);

export const series = sqliteTable(
  "series",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    imagem: text("imagem"),
    // Não exclusivo: várias séries podem ser destaque na home.
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: createdAt(),
  },
  (t) => [index("series_is_default_idx").on(t.isDefault)],
);

export const attributes = sqliteTable(
  "attributes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("attributes_title_unique").on(t.title)],
);

export const cars = sqliteTable(
  "cars",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    brandId: integer("brand_id").references(() => brands.id, {
      onDelete: "restrict",
    }),
    serieId: integer("serie_id").references(() => series.id, {
      onDelete: "restrict",
    }),
    // Texto para preservar zeros à esquerda (ex.: "001").
    collector: text("collector"),
    // Nome da cor ou hexadecimal.
    color: text("color"),
    imagemFull: text("imagem_full"),
    imagemThumb: text("imagem_thumb"),
    // Apenas para a carga manual em lote.
    imagemURLOriginal: text("imagem_url_original"),
    imagemCheck: integer("imagem_check", { mode: "boolean" })
      .notNull()
      .default(false),
    // Ex.: "8/10".
    seriePosition: text("serie_position"),
    toy: text("toy"),
    year: integer("year"),
    // Ex.: "1/64".
    scale: text("scale"),
    createdAt: createdAt(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("cars_brand_idx").on(t.brandId),
    index("cars_serie_idx").on(t.serieId),
    index("cars_toy_idx").on(t.toy),
    index("cars_year_idx").on(t.year),
    index("cars_title_idx").on(t.title),
  ],
);

export const carImages = sqliteTable(
  "car_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    carId: integer("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("car_images_car_position_idx").on(t.carId, t.position)],
);

export const collections = sqliteTable(
  "collections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    carId: integer("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("collections_user_car_unique").on(t.userId, t.carId),
    index("collections_car_idx").on(t.carId),
  ],
);

export const carsAttributes = sqliteTable(
  "cars_attributes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    carId: integer("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    attributeId: integer("attribute_id")
      .notNull()
      .references(() => attributes.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("cars_attributes_car_attribute_unique").on(
      t.carId,
      t.attributeId,
    ),
    index("cars_attributes_attribute_idx").on(t.attributeId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  collections: many(collections),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  cars: many(cars),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  cars: many(cars),
}));

export const attributesRelations = relations(attributes, ({ many }) => ({
  carsAttributes: many(carsAttributes),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  brand: one(brands, { fields: [cars.brandId], references: [brands.id] }),
  serie: one(series, { fields: [cars.serieId], references: [series.id] }),
  images: many(carImages),
  collections: many(collections),
  carsAttributes: many(carsAttributes),
}));

export const carImagesRelations = relations(carImages, ({ one }) => ({
  car: one(cars, { fields: [carImages.carId], references: [cars.id] }),
}));

export const collectionsRelations = relations(collections, ({ one }) => ({
  user: one(users, { fields: [collections.userId], references: [users.id] }),
  car: one(cars, { fields: [collections.carId], references: [cars.id] }),
}));

export const carsAttributesRelations = relations(
  carsAttributes,
  ({ one }) => ({
    car: one(cars, { fields: [carsAttributes.carId], references: [cars.id] }),
    attribute: one(attributes, {
      fields: [carsAttributes.attributeId],
      references: [attributes.id],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Serie = typeof series.$inferSelect;
export type NewSerie = typeof series.$inferInsert;
export type Attribute = typeof attributes.$inferSelect;
export type NewAttribute = typeof attributes.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
export type CarImage = typeof carImages.$inferSelect;
export type NewCarImage = typeof carImages.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CarAttribute = typeof carsAttributes.$inferSelect;
export type NewCarAttribute = typeof carsAttributes.$inferInsert;
