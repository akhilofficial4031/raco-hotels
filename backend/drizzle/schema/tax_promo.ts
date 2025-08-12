import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";

export const taxFee = sqliteTable(
  "tax_fee",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(), // percent | fixed
    value: integer("value").notNull().default(0), // percent 0..100 or cents
    scope: text("scope").notNull(), // per_stay | per_night | per_person
    includedInPrice: integer("included_in_price").notNull().default(0),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    taxHotelIdx: index("idx_tax_fee_hotel").on(t.hotelId),
  }),
);
