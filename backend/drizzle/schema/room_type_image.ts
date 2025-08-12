import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

import { roomType } from "./room_type";

export const roomTypeImage = sqliteTable(
  "room_type_image",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomType.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    roomImageRoomIdx: index("idx_room_image_room").on(t.roomTypeId),
  }),
);
