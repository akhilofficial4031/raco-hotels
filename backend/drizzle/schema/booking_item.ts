import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { booking } from "./booking";
import { ratePlan } from "./rate_plan";
import { roomType } from "./room_type";

export const bookingItem = sqliteTable(
  "booking_item",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => booking.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomType.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    ratePlanId: integer("rate_plan_id").references(() => ratePlan.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    date: text("date").notNull(),
    priceCents: integer("price_cents").notNull().default(0),
    taxAmountCents: integer("tax_amount_cents").notNull().default(0),
    feeAmountCents: integer("fee_amount_cents").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    bookingItemUq: uniqueIndex("uq_booking_item").on(
      t.bookingId,
      t.roomTypeId,
      t.date,
    ),
    bookingItemBookingIdx: index("idx_booking_item_booking").on(t.bookingId),
    bookingItemDateIdx: index("idx_booking_item_date").on(t.date),
  }),
);
