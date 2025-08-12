import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const amenity = sqliteTable(
  "amenity",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    icon: text("icon"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    amenityCodeUq: uniqueIndex("uq_amenity_code").on(t.code),
    amenityNameIdx: index("idx_amenity_name").on(t.name),
  }),
);
