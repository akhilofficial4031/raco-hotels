import { and, count, desc, eq, like } from "drizzle-orm";

import { taxFee as taxFeeTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type { DatabaseTaxFee } from "../types";

export interface TaxFeeFilters {
  hotelId?: number;
  isActive?: number;
  name?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CreateTaxFeeData extends Partial<DatabaseTaxFee> {
  hotelId: number;
  name: string;
  type: "percent" | "fixed";
  value: number;
  scope: string;
}

export type UpdateTaxFeeData = Partial<CreateTaxFeeData>;

export class TaxFeeRepository {
  static async findAll(
    db: D1Database,
    filters: TaxFeeFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ items: DatabaseTaxFee[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (filters.hotelId)
      conditions.push(eq(taxFeeTable.hotelId, filters.hotelId));
    if (typeof filters.isActive === "number")
      conditions.push(eq(taxFeeTable.isActive, filters.isActive));
    if (filters.name)
      conditions.push(like(taxFeeTable.name, `%${filters.name}%`));

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(taxFeeTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const rows = await database
      .select()
      .from(taxFeeTable)
      .where(whereClause)
      .orderBy(desc(taxFeeTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { items: rows as any, total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseTaxFee | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(taxFeeTable)
      .where(eq(taxFeeTable.id, id))
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async create(
    db: D1Database,
    data: CreateTaxFeeData,
  ): Promise<DatabaseTaxFee> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(taxFeeTable)
      .values({
        ...data,
        includedInPrice: data.includedInPrice ?? 0,
        isActive: data.isActive ?? 1,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as any;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateTaxFeeData,
  ): Promise<DatabaseTaxFee | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(taxFeeTable)
      .set(payload as any)
      .where(eq(taxFeeTable.id, id))
      .returning();
    return (rows[0] as any) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(taxFeeTable)
      .where(eq(taxFeeTable.id, id))
      .returning();
    return rows.length > 0;
  }
}
