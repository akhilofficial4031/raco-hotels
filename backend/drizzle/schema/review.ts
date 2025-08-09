import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  check,
} from "drizzle-orm/sqlite-core";

import { booking } from "./booking";
import { hotel } from "./hotel";
import { user } from "./user";

export const review = sqliteTable(
  "review",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: integer("user_id").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    bookingId: integer("booking_id").references(() => booking.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body"),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    publishedAt: text("published_at"),
  },
  (t) => ({
    reviewHotelIdx: index("idx_review_hotel").on(t.hotelId),
    reviewStatusIdx: index("idx_review_status").on(t.status),
    reviewRatingIdx: index("idx_review_rating").on(t.rating),
    reviewRatingCheck: check(
      "ck_review_rating",
      sql`${t.rating} >= 1 AND ${t.rating} <= 5`,
    ),
  }),
);
