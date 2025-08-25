import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
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
    status: text("status").notNull().default("active"), // active, inactive, blocked
    notes: text("notes"), // Internal notes by staff

    // Web user tracking - indicates if this customer has/had a user account
    hasUserAccount: integer("has_user_account").notNull().default(0), // 0 = no, 1 = yes
    firstBookingSource: text("first_booking_source").notNull().default("web"), // Track how they first booked

    // Customer analytics and tracking
    totalBookings: integer("total_bookings").notNull().default(0),
    totalSpentCents: integer("total_spent_cents").notNull().default(0), // Amount in cents to avoid decimal issues
    preferredPaymentMethod: text("preferred_payment_method"), // credit_card, cash, bank_transfer, etc.
    vipStatus: text("vip_status").default("regular"), // regular, silver, gold, platinum

    // Communication preferences
    preferredContactMethod: text("preferred_contact_method").default("email"), // email, phone, sms
    languagePreference: text("language_preference").default("en"), // ISO language codes
    timeZone: text("time_zone"), // Customer's timezone for booking confirmations

    // Timestamps
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    lastBookingAt: text("last_booking_at"), // Track when customer last made a booking
    lastContactAt: text("last_contact_at"), // Track last interaction with customer
  },
  (t) => ({
    // Remove unique constraint on email since customers can have same email as users
    customerEmailIdx: index("idx_customer_email").on(t.email),
    customerPhoneIdx: index("idx_customer_phone").on(t.phone),
    customerNameIdx: index("idx_customer_name").on(t.fullName),
    customerStatusIdx: index("idx_customer_status").on(t.status),
    customerFirstBookingSourceIdx: index(
      "idx_customer_first_booking_source",
    ).on(t.firstBookingSource),
    customerLastBookingIdx: index("idx_customer_last_booking").on(
      t.lastBookingAt,
    ),
    customerVipStatusIdx: index("idx_customer_vip_status").on(t.vipStatus),
    customerHasUserAccountIdx: index("idx_customer_has_user_account").on(
      t.hasUserAccount,
    ),
    customerTotalBookingsIdx: index("idx_customer_total_bookings").on(
      t.totalBookings,
    ),
    customerTotalSpentIdx: index("idx_customer_total_spent").on(
      t.totalSpentCents,
    ),

    // Composite indexes for common queries
    customerEmailPhoneIdx: index("idx_customer_email_phone").on(
      t.email,
      t.phone,
    ),
    customerStatusFirstBookingSourceIdx: index(
      "idx_customer_status_first_booking_source",
    ).on(t.status, t.firstBookingSource),

    // Check constraints
    customerGenderCheck: check(
      "ck_customer_gender",
      sql`${t.gender} IN ('male','female','other') OR ${t.gender} IS NULL`,
    ),
    customerStatusCheck: check(
      "ck_customer_status",
      sql`${t.status} IN ('active','inactive','blocked')`,
    ),
    customerFirstBookingSourceCheck: check(
      "ck_customer_first_booking_source",
      sql`${t.firstBookingSource} IN ('web','front_office','phone','email','mobile_app','walk_in')`,
    ),
    customerMarketingOptInCheck: check(
      "ck_customer_marketing_opt_in",
      sql`${t.marketingOptIn} IN (0,1)`,
    ),
    customerHasUserAccountCheck: check(
      "ck_customer_has_user_account",
      sql`${t.hasUserAccount} IN (0,1)`,
    ),
    customerVipStatusCheck: check(
      "ck_customer_vip_status",
      sql`${t.vipStatus} IN ('regular','silver','gold','platinum') OR ${t.vipStatus} IS NULL`,
    ),
    customerPreferredContactMethodCheck: check(
      "ck_customer_preferred_contact_method",
      sql`${t.preferredContactMethod} IN ('email','phone','sms') OR ${t.preferredContactMethod} IS NULL`,
    ),
    customerTotalBookingsCheck: check(
      "ck_customer_total_bookings",
      sql`${t.totalBookings} >= 0`,
    ),
    customerTotalSpentCheck: check(
      "ck_customer_total_spent",
      sql`${t.totalSpentCents} >= 0`,
    ),
  }),
);
