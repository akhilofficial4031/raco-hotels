import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

import { user } from "./user";

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorUserId: integer("actor_user_id").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id").notNull(),
    action: text("action").notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    auditEntityIdx: index("idx_audit_entity").on(t.entityType, t.entityId),
    auditActorIdx: index("idx_audit_actor").on(t.actorUserId),
    auditActionIdx: index("idx_audit_action").on(t.action),
  }),
);
