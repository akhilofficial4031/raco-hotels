import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";

export const attraction = sqliteTable(
  "attraction",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    content: text("content", { mode: "json" }).notNull(), // JSON string of attraction content structure
    layout: text("layout").notNull().default("layout_1"), // Layout type: layout_1, layout_2, layout_3
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    attractionHotelIdx: index("idx_attraction_hotel").on(t.hotelId),
    attractionSlugIdx: index("idx_attraction_slug").on(t.slug),
    attractionNameIdx: index("idx_attraction_name").on(t.name),
  }),
);
