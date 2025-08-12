import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { ratePlan } from "./rate_plan";
import { roomType } from "./room_type";

export const roomRate = sqliteTable(
  "room_rate",
  {
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomType.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    date: text("date").notNull(),
    ratePlanId: integer("rate_plan_id").references(() => ratePlan.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    priceCents: integer("price_cents").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("USD"),
    minStay: integer("min_stay"),
    maxStay: integer("max_stay"),
    closed: integer("closed").notNull().default(0),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roomTypeId, t.date, t.ratePlanId] }),
    roomRateDateIdx: index("idx_room_rate_date").on(t.date),
    roomRatePriceIdx: index("idx_room_rate_price").on(t.priceCents),
  }),
);
