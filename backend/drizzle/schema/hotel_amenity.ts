import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { amenity } from "./amenity";
import { hotel } from "./hotel";

export const hotelAmenity = sqliteTable(
  "hotel_amenity",
  {
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    amenityId: integer("amenity_id")
      .notNull()
      .references(() => amenity.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.hotelId, t.amenityId] }),
  }),
);
