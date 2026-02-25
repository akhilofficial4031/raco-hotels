import { sqliteTable, integer, index } from "drizzle-orm/sqlite-core";

import { booking } from "./booking";

export const bookingChildren = sqliteTable(
  "booking_children",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "cascade", onUpdate: "cascade" }),
    age: integer("age").notNull(),
  },
  (t) => ({
    bookingChildrenBookingIdx: index("idx_booking_children_booking").on(
      t.bookingId,
    ),
  }),
);
