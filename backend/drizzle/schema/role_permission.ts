import { sqliteTable, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const rolePermission = sqliteTable(
  "role_permission",
  {
    roleId: integer("role_id").notNull(),
    permissionId: integer("permission_id").notNull(),
  },
  (t) => ({
    uqRolePerm: uniqueIndex("uq_role_permission").on(t.roleId, t.permissionId),
  }),
);
