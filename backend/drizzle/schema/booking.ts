import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";
import { ratePlan } from "./policy_rate";
import { roomType } from "./room";
import { promoCode } from "./tax_promo";
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
    status: text("status").notNull().default("reserved"),
    source: text("source").notNull().default("web"),
    checkInDate: text("check_in_date").notNull(),
    checkOutDate: text("check_out_date").notNull(),
    numAdults: integer("num_adults").notNull().default(1),
    numChildren: integer("num_children").notNull().default(0),
    totalAmountCents: integer("total_amount_cents").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("USD"),
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
    bookingStatusIdx: index("idx_booking_status").on(t.status),
    bookingDatesIdx: index("idx_booking_dates").on(
      t.checkInDate,
      t.checkOutDate,
    ),
    bookingAmountIdx: index("idx_booking_total_amount").on(t.totalAmountCents),
  }),
);

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

export const payment = sqliteTable(
  "payment",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => booking.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    amountCents: integer("amount_cents").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("USD"),
    status: text("status").notNull().default("pending"),
    method: text("method").notNull().default("card"),
    processor: text("processor").notNull().default("manual"),
    processorPaymentId: text("processor_payment_id"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    paymentBookingIdx: index("idx_payment_booking").on(t.bookingId),
    paymentStatusIdx: index("idx_payment_status").on(t.status),
    paymentProcessorUq: uniqueIndex("uq_payment_processor_id").on(
      t.processor,
      t.processorPaymentId,
    ),
  }),
);

export const refund = sqliteTable(
  "refund",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    paymentId: integer("payment_id")
      .notNull()
      .references(() => payment.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    amountCents: integer("amount_cents").notNull().default(0),
    status: text("status").notNull().default("pending"),
    processorRefundId: text("processor_refund_id"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    refundPaymentIdx: index("idx_refund_payment").on(t.paymentId),
    refundProcessorUq: uniqueIndex("uq_refund_processor_id").on(
      t.processorRefundId,
    ),
  }),
);
