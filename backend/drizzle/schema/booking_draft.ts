import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";
import { ratePlan } from "./rate_plan";
import { roomType } from "./room_type";

// Guest draft bookings for unauthenticated users
export const bookingDraft = sqliteTable(
  "booking_draft",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id").notNull(),
    referenceCode: text("reference_code").notNull(),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, {
        onDelete: "restrict",
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
    status: text("status").notNull().default("draft"),
    checkInDate: text("check_in_date").notNull(),
    checkOutDate: text("check_out_date").notNull(),
    numAdults: integer("num_adults").notNull().default(1),
    numChildren: integer("num_children").notNull().default(0),
    petsCount: integer("pets_count"),
    baseAmountCents: integer("base_amount_cents").notNull().default(0),
    taxAmountCents: integer("tax_amount_cents").notNull().default(0),
    feeAmountCents: integer("fee_amount_cents").notNull().default(0),
    discountAmountCents: integer("discount_amount_cents").notNull().default(0),
    totalAmountCents: integer("total_amount_cents").notNull().default(0),
    balanceDueCents: integer("balance_due_cents").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("INR"),
    promoCode: text("promo_code"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    addOnsJson: text("add_ons_json"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    bookingDraftSessionUq: uniqueIndex("uq_booking_draft_session").on(
      t.sessionId,
    ),
    bookingDraftHotelIdx: index("idx_booking_draft_hotel").on(t.hotelId),
    bookingDraftDatesIdx: index("idx_booking_draft_dates").on(
      t.checkInDate,
      t.checkOutDate,
    ),
  }),
);
