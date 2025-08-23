import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

export const addon = sqliteTable(
  "addon",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"), // e.g., "bed", "food", "service", "amenity"
    unitType: text("unit_type").notNull().default("item"), // "item", "person", "night", "hour"
    isActive: integer("is_active").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    addonActiveIdx: index("idx_addon_active").on(t.isActive),
    addonCategoryIdx: index("idx_addon_category").on(t.category),
    addonSortIdx: index("idx_addon_sort").on(t.sortOrder),
  }),
);
