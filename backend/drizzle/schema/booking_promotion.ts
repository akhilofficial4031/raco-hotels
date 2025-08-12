import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

import { booking } from "./booking";
import { promoCode } from "./promo_code";

export const bookingPromotion = sqliteTable("booking_promotion", {
  bookingId: integer("booking_id")
    .notNull()
    .references(() => booking.id, { onDelete: "cascade", onUpdate: "cascade" }),
  promoCodeId: integer("promo_code_id")
    .notNull()
    .references(() => promoCode.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  amountCents: integer("amount_cents").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
