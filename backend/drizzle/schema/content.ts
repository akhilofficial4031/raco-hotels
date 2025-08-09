import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";

// Basic CMS blocks for homepage/about/sections
export const contentBlock = sqliteTable(
  "content_block",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id").references(() => hotel.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    page: text("page").notNull(), // home, about, etc
    section: text("section").notNull(), // hero, banner, featured, etc
    title: text("title"),
    body: text("body"), // markdown or html
    mediaUrl: text("media_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: integer("is_visible").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    contentPageIdx: index("idx_content_page").on(t.page),
    contentSectionIdx: index("idx_content_section").on(t.section),
    contentHotelIdx: index("idx_content_hotel").on(t.hotelId),
  }),
);
