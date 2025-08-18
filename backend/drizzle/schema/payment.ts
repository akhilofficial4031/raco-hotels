import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { booking } from "./booking";

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
    currencyCode: text("currency_code").notNull().default("INR"),
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
