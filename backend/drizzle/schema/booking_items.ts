import { sqliteTable, integer, index, text } from "drizzle-orm/sqlite-core";

import { booking } from "./booking";
import { roomType } from "./room_type";
import { room } from "./room_unit";

export const bookingItems = sqliteTable(
  "booking_item",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => booking.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomType.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    roomId: integer("room_id")
      .notNull()
      .references(() => room.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    status: text("status").notNull().default("active"),
  },
  (t) => ({
    bookingItemBookingIdx: index("idx_booking_item_booking").on(t.bookingId),
    bookingItemRoomIdx: index("idx_booking_item_room").on(t.roomId),
  }),
);
