import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

import { addon } from "./addon";
import { booking } from "./booking";
import { roomType } from "./room_type";

export const bookingAddon = sqliteTable(
  "booking_addon",
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
    addonId: integer("addon_id")
      .notNull()
      .references(() => addon.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    quantity: integer("quantity").notNull().default(1),
    priceCents: integer("price_cents").notNull().default(0),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    bookingAddonUq: uniqueIndex("uq_booking_addon").on(
      t.bookingId,
      t.roomTypeId,
      t.addonId,
    ),
    bookingAddonBookingIdx: index("idx_booking_addon_booking").on(t.bookingId),
    bookingAddonRoomTypeIdx: index("idx_booking_addon_room_type").on(
      t.roomTypeId,
    ),
    bookingAddonAddonIdx: index("idx_booking_addon_addon").on(t.addonId),

    bookingAddonQuantityCheck: check(
      "ck_booking_addon_quantity",
      sql`${t.quantity} > 0`,
    ),
  }),
);
