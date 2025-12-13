import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

import { attraction } from "./attraction";

export const inquiry = sqliteTable(
  "inquiry",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    date: text("date").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("pending"), // 'pending' | 'addressed' | 'confirmed'
    remarks: text("remarks"),
    attractionId: integer("attraction_id").references(() => attraction.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    inquiryStatusIdx: index("idx_inquiry_status").on(t.status),
    inquiryDateIdx: index("idx_inquiry_date").on(t.date),
    inquiryCreatedIdx: index("idx_inquiry_created").on(t.createdAt),
    inquiryPhoneIdx: index("idx_inquiry_phone").on(t.phone),
    inquiryAttractionIdx: index("idx_inquiry_attraction").on(t.attractionId),
  }),
);
