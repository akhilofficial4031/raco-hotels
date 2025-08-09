import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { hotel } from "./hotel";
import { roomType } from "./room";

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
