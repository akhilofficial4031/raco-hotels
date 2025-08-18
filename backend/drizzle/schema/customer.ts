import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

export const customer = sqliteTable(
  "customer",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    alternatePhone: text("alternate_phone"),
    dateOfBirth: text("date_of_birth"), // YYYY-MM-DD format
    gender: text("gender"), // male, female, other
    nationality: text("nationality"),
    idType: text("id_type"), // passport, driver_license, national_id, etc.
    idNumber: text("id_number"),

    // Address fields
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    country: text("country"),
    postalCode: text("postal_code"),

    // Preferences and notes
    dietaryPreferences: text("dietary_preferences"), // JSON string for multiple preferences
    specialRequests: text("special_requests"), // JSON string for requests
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),

    // Loyalty and marketing
    loyaltyNumber: text("loyalty_number"),
    marketingOptIn: integer("marketing_opt_in").notNull().default(0), // 0 = no, 1 = yes

    // System fields
    source: text("source").notNull().default("web"), // web, front_office, phone, email, mobile_app
    status: text("status").notNull().default("active"), // active, inactive, blocked
    notes: text("notes"), // Internal notes by staff

    // Timestamps
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    lastBookingAt: text("last_booking_at"), // Track when customer last made a booking
  },
  (t) => ({
    customerEmailUq: uniqueIndex("uq_customer_email").on(t.email),
    customerEmailIdx: index("idx_customer_email").on(t.email),
    customerPhoneIdx: index("idx_customer_phone").on(t.phone),
    customerNameIdx: index("idx_customer_name").on(t.fullName),
    customerStatusIdx: index("idx_customer_status").on(t.status),
    customerSourceIdx: index("idx_customer_source").on(t.source),
    customerLastBookingIdx: index("idx_customer_last_booking").on(
      t.lastBookingAt,
    ),

    // Check constraints
    customerGenderCheck: check(
      "ck_customer_gender",
      sql`${t.gender} IN ('male','female','other') OR ${t.gender} IS NULL`,
    ),
    customerStatusCheck: check(
      "ck_customer_status",
      sql`${t.status} IN ('active','inactive','blocked')`,
    ),
    customerSourceCheck: check(
      "ck_customer_source",
      sql`${t.source} IN ('web','front_office','phone','email','mobile_app')`,
    ),
    customerMarketingOptInCheck: check(
      "ck_customer_marketing_opt_in",
      sql`${t.marketingOptIn} IN (0,1)`,
    ),
  }),
);
