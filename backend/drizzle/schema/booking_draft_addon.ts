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
import { bookingDraft } from "./booking_draft";
import { roomType } from "./room_type";

export const bookingDraftAddon = sqliteTable(
  "booking_draft_addon",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingDraftId: integer("booking_draft_id")
      .notNull()
      .references(() => bookingDraft.id, {
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
    unitPriceCents: integer("unit_price_cents").notNull().default(0),
    totalPriceCents: integer("total_price_cents").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("INR"),
    taxAmountCents: integer("tax_amount_cents").notNull().default(0),
    discountAmountCents: integer("discount_amount_cents").notNull().default(0),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    bookingDraftAddonUq: uniqueIndex("uq_booking_draft_addon").on(
      t.bookingDraftId,
      t.roomTypeId,
      t.addonId,
    ),
    bookingDraftAddonBookingIdx: index("idx_booking_draft_addon_booking").on(
      t.bookingDraftId,
    ),
    bookingDraftAddonRoomTypeIdx: index("idx_booking_draft_addon_room_type").on(
      t.roomTypeId,
    ),
    bookingDraftAddonAddonIdx: index("idx_booking_draft_addon_addon").on(
      t.addonId,
    ),
    bookingDraftAddonTotalIdx: index("idx_booking_draft_addon_total").on(
      t.totalPriceCents,
    ),
    bookingDraftAddonQuantityCheck: check(
      "ck_booking_draft_addon_quantity",
      sql`${t.quantity} > 0`,
    ),
    bookingDraftAddonPriceCheck: check(
      "ck_booking_draft_addon_price",
      sql`${t.unitPriceCents} >= 0 AND ${t.totalPriceCents} >= 0`,
    ),
    bookingDraftAddonTaxCheck: check(
      "ck_booking_draft_addon_tax",
      sql`${t.taxAmountCents} >= 0`,
    ),
  }),
);
