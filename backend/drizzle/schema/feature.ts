import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";

export const feature = sqliteTable(
  "feature",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isVisible: integer("is_visible", { mode: "boolean" })
      .notNull()
      .default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    featureCodeUq: uniqueIndex("uq_feature_code").on(t.code),
    featureNameIdx: index("idx_feature_name").on(t.name),
    featureVisibleIdx: index("idx_feature_visible").on(t.isVisible),
  }),
);

export const hotelFeature = sqliteTable(
  "hotel_feature",
  {
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    featureId: integer("feature_id")
      .notNull()
      .references(() => feature.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.hotelId, t.featureId] }),
  }),
);
