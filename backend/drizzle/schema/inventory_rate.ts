import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { roomType } from "./room_type";

export const roomInventory = sqliteTable(
  "room_inventory",
  {
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomType.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    date: text("date").notNull(),
    availableRooms: integer("available_rooms").notNull().default(0),
    overbookLimit: integer("overbook_limit").notNull().default(0),
    closed: integer("closed").notNull().default(0),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roomTypeId, t.date] }),
    roomInventoryDateIdx: index("idx_room_inventory_date").on(t.date),
  }),
);
