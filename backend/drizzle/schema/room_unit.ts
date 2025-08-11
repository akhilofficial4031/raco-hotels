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

// Physical room inventory for allocation at the property/frontdesk
export const room = sqliteTable(
  "room",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomType.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    roomNumber: text("room_number").notNull(), // e.g., "101", "101A"
    floor: text("floor"),
    description: text("description"),
    status: text("status").notNull().default("available"), // available | occupied | maintenance | out_of_order
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    roomHotelIdx: index("idx_room_hotel").on(t.hotelId),
    roomTypeIdx: index("idx_room_type").on(t.roomTypeId),
    roomStatusIdx: index("idx_room_status").on(t.status),
    roomNumberUq: uniqueIndex("uq_room_hotel_number").on(
      t.hotelId,
      t.roomNumber,
    ),
  }),
);
