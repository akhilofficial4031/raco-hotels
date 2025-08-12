import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";

export const hotelImage = sqliteTable(
  "hotel_image",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    hotelImageHotelIdx: index("idx_hotel_image_hotel").on(t.hotelId),
  }),
);
