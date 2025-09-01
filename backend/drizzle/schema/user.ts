import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

import {
  UserStatus,
  USER_STATUS_VALUES,
} from "../../../shared/dist/types/user";

export const user = sqliteTable(
  "user",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    fullName: text("full_name"),
    phone: text("phone"),
    role: text("role").notNull().default("guest"),
    status: text("status").notNull().default(UserStatus.ACTIVE),

    // Link to customer record - required for guest users, null for staff/admin
    customerId: integer("customer_id"),

    // Authentication and session fields
    lastLoginAt: text("last_login_at"),
    passwordResetToken: text("password_reset_token"),
    passwordResetExpiresAt: text("password_reset_expires_at"),
    emailVerified: integer("email_verified").notNull().default(0), // 0 = no, 1 = yes
    emailVerificationToken: text("email_verification_token"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userEmailUq: uniqueIndex("uq_user_email").on(t.email),
    userEmailIdx: index("idx_user_email").on(t.email),
    userRoleIdx: index("idx_user_role").on(t.role),
    userCustomerIdx: index("idx_user_customer").on(t.customerId),
    userLastLoginIdx: index("idx_user_last_login").on(t.lastLoginAt),

    // Check constraints
    userRoleCheck: check(
      "ck_user_role",
      sql`${t.role} IN ('guest','staff','admin')`,
    ),
    userStatusCheck: check(
      "ck_user_status",
      sql`${t.status} IN (${sql.join(
        USER_STATUS_VALUES.map((s) => sql`${s}`),
        sql`, `,
      )})`,
    ),
    userEmailVerifiedCheck: check(
      "ck_user_email_verified",
      sql`${t.emailVerified} IN (0,1)`,
    ),
    // Guest users must have a customer_id, staff/admin should not
    userCustomerConstraint: check(
      "ck_user_customer_role",
      sql`(${t.role} = 'guest' AND ${t.customerId} IS NOT NULL) OR (${t.role} IN ('staff','admin') AND ${t.customerId} IS NULL)`,
    ),
  }),
);
