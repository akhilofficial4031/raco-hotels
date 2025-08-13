import { and, count, desc, eq, like } from "drizzle-orm";

import { feature as featureTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseFeature,
  PaginationParams,
  CreateFeatureData,
  UpdateFeatureData,
} from "../types";

export class FeatureRepository {
  static async findAll(
    db: D1Database,
    search: string = "",
    pagination: PaginationParams = {},
  ): Promise<{ features: DatabaseFeature[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions = [] as any[];

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(featureTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    if (search) {
      conditions.push(like(featureTable.name, `%${search}%`));
    }

    const rows = await database
      .select()
      .from(featureTable)
      .where(whereClause)
      .orderBy(desc(featureTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { features: rows as DatabaseFeature[], total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseFeature | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(featureTable)
      .where(eq(featureTable.id, id))
      .limit(1);
    return (rows[0] as DatabaseFeature) || null;
  }

  static async create(
    db: D1Database,
    data: CreateFeatureData,
  ): Promise<DatabaseFeature> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(featureTable)
      .values({
        ...data,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as DatabaseFeature;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateFeatureData,
  ): Promise<DatabaseFeature | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(featureTable)
      .set(payload as any)
      .where(eq(featureTable.id, id))
      .returning();
    return (rows[0] as DatabaseFeature) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(featureTable)
      .where(eq(featureTable.id, id))
      .returning();
    return rows.length > 0;
  }
}
