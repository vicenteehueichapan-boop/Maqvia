import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const providers = sqliteTable("providers", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().unique(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  whatsapp: text("whatsapp").notNull(),
  contactEmail: text("contact_email").notNull().default(""),
  comuna: text("comuna").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
export const equipment = sqliteTable(
  "equipment",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => providers.id),
    title: text("title").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    images: text("images").notNull().default("[]"),
    operator: text("operator").notNull().default("no"),
    delivery: text("delivery").notNull().default("no"),
    priceKind: text("price_kind").notNull().default("consult"),
    priceAmount: integer("price_amount"),
    priceUnit: text("price_unit").notNull().default("day"),
    services: text("services").notNull().default("[]"),
    sector: text("sector").notNull().default(""),
    locationPrecision: text("location_precision").notNull().default("none"),
    presentationVariant: text("presentation_variant").notNull().default("editorial"),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_equipment_provider_id").on(table.providerId),
    index("idx_equipment_category").on(table.category),
  ],
);
export const favorites = sqliteTable(
  "favorites",
  {
    userId: text("user_id").notNull(),
    equipmentId: text("equipment_id")
      .notNull()
      .references(() => equipment.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.equipmentId] }),
    index("idx_favorites_equipment_id").on(table.equipmentId),
  ],
);
