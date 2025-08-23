import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

import { addon } from "./addon";
import { roomType } from "./room_type";

export const roomTypeAddon = sqliteTable(
  "room_type_addon",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomType.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    addonId: integer("addon_id")
      .notNull()
      .references(() => addon.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    priceCents: integer("price_cents").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("INR"),
    maxQuantity: integer("max_quantity"), // null means unlimited
    minQuantity: integer("min_quantity").notNull().default(0),
    isAvailable: integer("is_available").notNull().default(1),
    specialInstructions: text("special_instructions"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    roomTypeAddonUq: uniqueIndex("uq_room_type_addon").on(
      t.roomTypeId,
      t.addonId,
    ),
    roomTypeAddonRoomIdx: index("idx_room_type_addon_room").on(t.roomTypeId),
    roomTypeAddonAddonIdx: index("idx_room_type_addon_addon").on(t.addonId),
    roomTypeAddonAvailableIdx: index("idx_room_type_addon_available").on(
      t.isAvailable,
    ),
    roomTypeAddonPriceIdx: index("idx_room_type_addon_price").on(t.priceCents),
    roomTypeAddonPriceCheck: check(
      "ck_room_type_addon_price",
      sql`${t.priceCents} >= 0`,
    ),
    roomTypeAddonQuantityCheck: check(
      "ck_room_type_addon_quantity",
      sql`${t.minQuantity} >= 0 AND (${t.maxQuantity} IS NULL OR ${t.maxQuantity} >= ${t.minQuantity})`,
    ),
  }),
);
