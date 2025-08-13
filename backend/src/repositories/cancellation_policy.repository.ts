import { and, count, desc, eq } from "drizzle-orm";

import { cancellationPolicy as cancellationPolicyTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseCancellationPolicy,
  PaginationParams,
  CreateCancellationPolicyData,
  UpdateCancellationPolicyData,
} from "../types";

export class CancellationPolicyRepository {
  static async findAll(
    db: D1Database,
    filters: { hotelId?: number } = {},
    pagination: PaginationParams = {},
  ): Promise<{ policies: DatabaseCancellationPolicy[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (filters.hotelId !== undefined) {
      conditions.push(eq(cancellationPolicyTable.hotelId, filters.hotelId));
    }
    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(cancellationPolicyTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const rows = await database
      .select()
      .from(cancellationPolicyTable)
      .where(whereClause)
      .orderBy(desc(cancellationPolicyTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { policies: rows as DatabaseCancellationPolicy[], total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseCancellationPolicy | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(cancellationPolicyTable)
      .where(eq(cancellationPolicyTable.id, id))
      .limit(1);
    return (rows[0] as DatabaseCancellationPolicy) || null;
  }

  static async create(
    db: D1Database,
    data: CreateCancellationPolicyData,
  ): Promise<DatabaseCancellationPolicy> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(cancellationPolicyTable)
      .values({
        ...data,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as DatabaseCancellationPolicy;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateCancellationPolicyData,
  ): Promise<DatabaseCancellationPolicy | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(cancellationPolicyTable)
      .set(payload as any)
      .where(eq(cancellationPolicyTable.id, id))
      .returning();
    return (rows[0] as DatabaseCancellationPolicy) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(cancellationPolicyTable)
      .where(eq(cancellationPolicyTable.id, id))
      .returning();
    return rows.length > 0;
  }
}
