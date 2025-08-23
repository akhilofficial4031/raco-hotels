import { and, count, desc, eq, like, or } from "drizzle-orm";

import { addon as addonTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseAddon,
  PaginationParams,
  CreateAddonData,
  UpdateAddonData,
} from "../types";

export class AddonRepository {
  static async findAll(
    db: D1Database,
    search: string = "",
    filters: {
      category?: string;
      isActive?: number;
      unitType?: string;
    } = {},
    pagination: PaginationParams = {},
  ): Promise<{ addons: DatabaseAddon[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions = [] as any[];

    // Apply search filter
    if (search) {
      conditions.push(
        or(
          like(addonTable.name, `%${search}%`),
          like(addonTable.slug, `%${search}%`),
          like(addonTable.description, `%${search}%`),
        ),
      );
    }

    // Apply category filter
    if (filters.category) {
      conditions.push(eq(addonTable.category, filters.category));
    }

    // Apply active status filter
    if (filters.isActive !== undefined) {
      conditions.push(eq(addonTable.isActive, filters.isActive));
    }

    // Apply unit type filter
    if (filters.unitType) {
      conditions.push(eq(addonTable.unitType, filters.unitType));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await database
      .select({ count: count() })
      .from(addonTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get paginated results
    const rows = await database
      .select()
      .from(addonTable)
      .where(whereClause)
      .orderBy(desc(addonTable.sortOrder), desc(addonTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { addons: rows as DatabaseAddon[], total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseAddon | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(addonTable)
      .where(eq(addonTable.id, id))
      .limit(1);
    return (rows[0] as DatabaseAddon) || null;
  }

  static async findBySlug(
    db: D1Database,
    slug: string,
  ): Promise<DatabaseAddon | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(addonTable)
      .where(eq(addonTable.slug, slug))
      .limit(1);
    return (rows[0] as DatabaseAddon) || null;
  }

  static async create(
    db: D1Database,
    data: CreateAddonData,
  ): Promise<DatabaseAddon> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(addonTable)
      .values({
        ...data,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as DatabaseAddon;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateAddonData,
  ): Promise<DatabaseAddon | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(addonTable)
      .set(payload as any)
      .where(eq(addonTable.id, id))
      .returning();
    return (rows[0] as DatabaseAddon) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(addonTable)
      .where(eq(addonTable.id, id))
      .returning();
    return rows.length > 0;
  }

  static async findByCategory(
    db: D1Database,
    category: string,
  ): Promise<DatabaseAddon[]> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(addonTable)
      .where(eq(addonTable.category, category))
      .orderBy(desc(addonTable.sortOrder), desc(addonTable.createdAt));
    return rows as DatabaseAddon[];
  }

  static async findActiveAddons(db: D1Database): Promise<DatabaseAddon[]> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(addonTable)
      .where(eq(addonTable.isActive, 1))
      .orderBy(desc(addonTable.sortOrder), desc(addonTable.createdAt));
    return rows as DatabaseAddon[];
  }
}
