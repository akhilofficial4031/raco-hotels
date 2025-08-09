import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  real,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

export const hotel = sqliteTable(
  "hotel",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug"),
    description: text("description"),
    email: text("email"),
    phone: text("phone"),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    countryCode: text("country_code"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    timezone: text("timezone"),
    starRating: integer("star_rating"),
    checkInTime: text("check_in_time"),
    checkOutTime: text("check_out_time"),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    hotelNameIdx: index("idx_hotel_name").on(t.name),
    hotelSlugUq: uniqueIndex("uq_hotel_slug").on(t.slug),
    hotelCityIdx: index("idx_hotel_city").on(t.city),
    hotelCountryIdx: index("idx_hotel_country").on(t.countryCode),
    hotelActiveIdx: index("idx_hotel_active").on(t.isActive),
    hotelStarCheck: check(
      "ck_hotel_star_rating",
      sql`${t.starRating} IS NULL OR (${t.starRating} >= 1 AND ${t.starRating} <= 5)`,
    ),
  }),
);

export const hotelImage = sqliteTable(
  "hotel_image",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    hotelId: integer("hotel_id")
      .notNull()
      .references(() => hotel.id, { onDelete: "cascade", onUpdate: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    hotelImageHotelIdx: index("idx_hotel_image_hotel").on(t.hotelId),
  }),
);
