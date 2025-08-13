import { and, count, desc, eq, like } from "drizzle-orm";

import { review as reviewTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type { DatabaseReview } from "../types";

export interface ReviewFilters {
  hotelId?: number;
  status?: string;
  search?: string; // title/body search
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CreateReviewData extends Partial<DatabaseReview> {
  hotelId: number;
  rating: number;
}

export type UpdateReviewData = Partial<CreateReviewData>;

export class ReviewRepository {
  static async findAll(
    db: D1Database,
    filters: ReviewFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ reviews: DatabaseReview[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (filters.hotelId)
      conditions.push(eq(reviewTable.hotelId, filters.hotelId));
    if (filters.status) conditions.push(eq(reviewTable.status, filters.status));
    if (filters.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(like((reviewTable as any).title, pattern));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(reviewTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const rows = await database
      .select()
      .from(reviewTable)
      .where(whereClause)
      .orderBy(desc((reviewTable as any).createdAt))
      .limit(limit)
      .offset(offset);

    return { reviews: rows as any, total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseReview | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(reviewTable)
      .where(eq(reviewTable.id, id))
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async create(
    db: D1Database,
    data: CreateReviewData,
  ): Promise<DatabaseReview> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(reviewTable)
      .values({
        ...data,
        title: data.title ?? null,
        body: data.body ?? null,
        status: data.status ?? "pending",
        publishedAt: data.publishedAt ?? null,
        createdAt: nowIso,
      } as any)
      .returning();
    return created as any;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateReviewData,
  ): Promise<DatabaseReview | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data }).filter(([, v]) => v !== undefined),
    );
    const rows = await database
      .update(reviewTable)
      .set(payload as any)
      .where(eq(reviewTable.id, id))
      .returning();
    return (rows[0] as any) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(reviewTable)
      .where(eq(reviewTable.id, id))
      .returning();
    return rows.length > 0;
  }
}
