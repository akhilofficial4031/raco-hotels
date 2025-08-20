import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";
import { cancellationPolicy } from "./policy_rate";
import { roomType } from "./room_type";

export const ratePlan = sqliteTable(
  "rate_plan",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    roomTypeId: integer("room_type_id").references(() => roomType.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    mealPlan: text("meal_plan"),
    minStay: integer("min_stay"),
    maxStay: integer("max_stay"),
    advancePurchaseDays: integer("adv_purchase_days"),
    cancellationPolicyId: integer("cancellation_policy_id").references(
      () => cancellationPolicy.id,
      { onDelete: "set null", onUpdate: "cascade" },
    ),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    ratePlanUq: uniqueIndex("uq_rate_plan_code").on(t.hotelId, t.code),
    ratePlanHotelIdx: index("idx_rate_plan_hotel").on(t.hotelId),
    ratePlanRoomIdx: index("idx_rate_plan_room").on(t.roomTypeId),
  }),
);
