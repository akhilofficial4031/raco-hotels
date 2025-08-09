import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable(
  "user",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    fullName: text("full_name"),
    phone: text("phone"),
    role: text("role").notNull().default("guest"),
    status: text("status").notNull().default("active"),
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
    userRoleCheck: check(
      "ck_user_role",
      sql`${t.role} IN ('guest','staff','admin')`,
    ),
    userStatusCheck: check(
      "ck_user_status",
      sql`${t.status} IN ('active','disabled')`,
    ),
  }),
);
