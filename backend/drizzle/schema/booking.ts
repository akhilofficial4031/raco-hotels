import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { customer } from "./customer";
import { hotel } from "./hotel";
import { user } from "./user";

export const booking = sqliteTable(
  "booking",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    referenceCode: text("reference_code").notNull(),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    userId: integer("user_id").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    customerId: integer("customer_id").references(() => customer.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    adminId: integer("admin_id").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    status: text("status").notNull().default("reserved"),
    source: text("source").notNull().default("web"),
    checkInDate: text("check_in_date").notNull(),
    checkOutDate: text("check_out_date").notNull(),
    numAdults: integer("num_adults").notNull().default(1),
    numChildren: integer("num_children").notNull().default(0),
    totalAmountCents: integer("total_amount_cents").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("INR"),
    taxAmountCents: integer("tax_amount_cents").notNull().default(0),
    feeAmountCents: integer("fee_amount_cents").notNull().default(0),
    discountAmountCents: integer("discount_amount_cents").notNull().default(0),
    balanceDueCents: integer("balance_due_cents").notNull().default(0),
    notes: text("notes"),
    cancelledAt: text("cancelled_at"),
    cancellationReason: text("cancellation_reason"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    bookingRefUq: uniqueIndex("uq_booking_reference_code").on(t.referenceCode),
    bookingHotelIdx: index("idx_booking_hotel").on(t.hotelId),
    bookingUserIdx: index("idx_booking_user").on(t.userId),
    bookingCustomerIdx: index("idx_booking_customer").on(t.customerId),
    bookingAdminIdx: index("idx_booking_admin").on(t.adminId),
    bookingStatusIdx: index("idx_booking_status").on(t.status),
    bookingDatesIdx: index("idx_booking_dates").on(
      t.checkInDate,
      t.checkOutDate,
    ),
    bookingAmountIdx: index("idx_booking_total_amount").on(t.totalAmountCents),
  }),
);
