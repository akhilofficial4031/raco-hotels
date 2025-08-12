import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const role = sqliteTable(
  "role",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // e.g., "admin", "staff", "guest", future custom ones
    name: text("name").notNull(),
    // human-readable
    displayName: text("display_name"),
  },
  (t) => ({
    uqRoleName: uniqueIndex("uq_role_name").on(t.name),
    idxRoleName: index("idx_role_name").on(t.name),
  }),
);

export const permission = sqliteTable(
  "permission",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // canonical key like "users.read"
    key: text("key").notNull(),
    description: text("description"),
  },
  (t) => ({
    uqPermKey: uniqueIndex("uq_permission_key").on(t.key),
    idxPermKey: index("idx_permission_key").on(t.key),
  }),
);
