import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

import { booking } from "./booking";

export const bookingCancellationOtp = sqliteTable(
  "booking_cancellation_otp",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "cascade" }),
    bookingReference: text("booking_reference").notNull(),
    otpCode: text("otp_code").notNull(),
    customerEmail: text("customer_email").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  },
  (table) => ({
    referenceIdx: index("idx_booking_cancellation_otp_reference").on(
      table.bookingReference,
    ),
    expiresIdx: index("idx_booking_cancellation_otp_expires").on(
      table.expiresAt,
    ),
  }),
);
