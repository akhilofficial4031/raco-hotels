import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";

export const promoCode = sqliteTable(
  "promo_code",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    code: text("code").notNull(),
    type: text("type").notNull(), // percent | fixed
    value: integer("value").notNull().default(0),
    startDate: text("start_date"),
    endDate: text("end_date"),
    minNights: integer("min_nights"),
    minAmountCents: integer("min_amount_cents"),
    maxDiscountCents: integer("max_discount_cents"),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").notNull().default(0),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    promoCodeUq: uniqueIndex("uq_promo_code").on(t.hotelId, t.code),
    promoActiveIdx: index("idx_promo_active").on(t.isActive),
    promoDateIdx: index("idx_promo_date").on(t.startDate, t.endDate),
  }),
);
