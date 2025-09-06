import {
  and,
  count,
  desc,
  eq,
  like,
  gte,
  isNull,
  lte,
  or,
  lt,
} from "drizzle-orm";

import { promoCode as promoCodeTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabasePromoCode,
  PromoCodeFilters,
  PaginationParams,
  CreatePromoCodeData,
  UpdatePromoCodeData,
} from "../types";

export class PromoCodeRepository {
  static async findAll(
    db: D1Database,
    filters: PromoCodeFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ items: DatabasePromoCode[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (filters.hotelId)
      conditions.push(eq(promoCodeTable.hotelId, filters.hotelId));

    if (filters.status) {
      const now = new Date().toISOString();
      if (filters.status === "active") {
        conditions.push(eq(promoCodeTable.isActive, 1));
        conditions.push(
          or(
            isNull(promoCodeTable.startDate),
            lte(promoCodeTable.startDate, now),
          ),
        );
        conditions.push(
          or(isNull(promoCodeTable.endDate), gte(promoCodeTable.endDate, now)),
        );
      } else if (filters.status === "past") {
        conditions.push(
          or(eq(promoCodeTable.isActive, 0), lt(promoCodeTable.endDate, now)),
        );
      }
    }

    if (filters.code)
      conditions.push(like(promoCodeTable.code, `%${filters.code}%`));

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(promoCodeTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const rows = await database
      .select()
      .from(promoCodeTable)
      .where(whereClause)
      .orderBy(desc(promoCodeTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { items: rows as any, total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabasePromoCode | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(promoCodeTable)
      .where(eq(promoCodeTable.id, id))
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async findValidCode(
    db: D1Database,
    hotelId: number,
    code: string,
  ): Promise<DatabasePromoCode | null> {
    const database = getDb(db);
    const currentDate = new Date().toISOString();
    const rows = await database
      .select()
      .from(promoCodeTable)
      .where(
        and(
          eq(promoCodeTable.hotelId, hotelId),
          eq(promoCodeTable.code, code),
          eq(promoCodeTable.isActive, 1),
          or(
            isNull(promoCodeTable.startDate),
            lte(promoCodeTable.startDate, currentDate),
          ),
          or(
            isNull(promoCodeTable.endDate),
            gte(promoCodeTable.endDate, currentDate),
          ),
        ),
      )
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async create(
    db: D1Database,
    data: CreatePromoCodeData,
  ): Promise<DatabasePromoCode> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(promoCodeTable)
      .values({
        ...data,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        minNights: data.minNights ?? null,
        minAmountCents: data.minAmountCents ?? null,
        maxDiscountCents: data.maxDiscountCents ?? null,
        usageLimit: data.usageLimit ?? null,
        usageCount: data.usageCount ?? 0,
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
    data: UpdatePromoCodeData,
  ): Promise<DatabasePromoCode | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(promoCodeTable)
      .set(payload as any)
      .where(eq(promoCodeTable.id, id))
      .returning();
    return (rows[0] as any) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(promoCodeTable)
      .where(eq(promoCodeTable.id, id))
      .returning();
    return rows.length > 0;
  }

  static async deactivateExpired(db: D1Database): Promise<number> {
    const database = getDb(db);
    const nowISO = new Date().toISOString();

    const result = await database
      .update(promoCodeTable)
      .set({ isActive: 0, updatedAt: nowISO })
      .where(
        and(eq(promoCodeTable.isActive, 1), lt(promoCodeTable.endDate, nowISO)),
      )
      .returning({ id: promoCodeTable.id });

    return result.length;
  }
}
