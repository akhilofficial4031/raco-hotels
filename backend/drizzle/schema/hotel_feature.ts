import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { feature } from "./feature";
import { hotel } from "./hotel";

export const hotelFeature = sqliteTable(
  "hotel_feature",
  {
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    featureId: integer("feature_id")
      .notNull()
      .references(() => feature.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.hotelId, t.featureId] }),
  }),
);
