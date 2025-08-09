import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { amenity } from "./amenity";
import { hotel } from "./hotel";

export const roomType = sqliteTable(
  "room_type",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    baseOccupancy: integer("base_occupancy").notNull().default(2),
    maxOccupancy: integer("max_occupancy").notNull().default(2),
    basePriceCents: integer("base_price_cents").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("USD"),
    sizeSqft: integer("size_sqft"),
    bedType: text("bed_type"),
    smokingAllowed: integer("smoking_allowed").notNull().default(0),
    totalRooms: integer("total_rooms").notNull().default(0),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    roomTypeHotelIdx: index("idx_room_type_hotel").on(t.hotelId),
    roomTypeSlugUq: uniqueIndex("uq_room_type_slug").on(t.hotelId, t.slug),
    roomTypePriceIdx: index("idx_room_type_price").on(t.basePriceCents),
    roomTypeActiveIdx: index("idx_room_type_active").on(t.isActive),
    roomTypeOccCheck: check(
      "ck_room_type_occupancy",
      sql`${t.maxOccupancy} >= ${t.baseOccupancy}`,
    ),
    roomTypePriceCheck: check(
      "ck_room_type_base_price",
      sql`${t.basePriceCents} >= 0`,
    ),
  }),
);

export const roomTypeAmenity = sqliteTable(
  "room_type_amenity",
  {
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomType.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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
    pk: primaryKey({ columns: [t.roomTypeId, t.amenityId] }),
  }),
);

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
