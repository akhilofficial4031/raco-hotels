import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { payment } from "./payment";

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
