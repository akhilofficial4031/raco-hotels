import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

import { bookingDraft } from "./booking_draft";

export const bookingDraftItem = sqliteTable(
  "booking_draft_item",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingDraftId: integer("booking_draft_id")
      .notNull()
      .references(() => bookingDraft.id, {
        onDelete: "cascade",
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
    draftItemDateIdx: index("idx_draft_item_date").on(t.date),
  }),
);
