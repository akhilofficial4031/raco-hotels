import { and, count, desc, eq, like } from "drizzle-orm";

import { amenity as amenityTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseAmenity,
  PaginationParams,
  CreateAmenityData,
  UpdateAmenityData,
} from "../types";

export class AmenityRepository {
  static async findAll(
    db: D1Database,
    search: string = "",
    pagination: PaginationParams = {},
  ): Promise<{ amenities: DatabaseAmenity[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions = [] as any[];

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(amenityTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    if (search) {
      conditions.push(like(amenityTable.name, `%${search}%`));
    }

    const rows = await database
      .select()
      .from(amenityTable)
      .where(whereClause)
      .orderBy(desc(amenityTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { amenities: rows as DatabaseAmenity[], total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseAmenity | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(amenityTable)
      .where(eq(amenityTable.id, id))
      .limit(1);
    return (rows[0] as DatabaseAmenity) || null;
  }

  static async create(
    db: D1Database,
    data: CreateAmenityData,
  ): Promise<DatabaseAmenity> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(amenityTable)
      .values({
        ...data,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as DatabaseAmenity;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateAmenityData,
  ): Promise<DatabaseAmenity | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(amenityTable)
      .set(payload as any)
      .where(eq(amenityTable.id, id))
      .returning();
    return (rows[0] as DatabaseAmenity) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(amenityTable)
      .where(eq(amenityTable.id, id))
      .returning();
    return rows.length > 0;
  }
}
