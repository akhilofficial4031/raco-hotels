import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";
import { roomType } from "./room_type";

export const cancellationPolicy = sqliteTable(
  "cancellation_policy",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    freeCancelUntilHours: integer("free_cancel_until_hours"),
    penaltyType: text("penalty_type"),
    penaltyValue: integer("penalty_value"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    cancelPolicyHotelIdx: index("idx_cancel_policy_hotel").on(t.hotelId),
  }),
);
