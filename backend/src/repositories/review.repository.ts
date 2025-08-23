import { and, count, desc, eq, like } from "drizzle-orm";

import {
  hotel as hotelTable,
  review as reviewTable,
  user as userTable,
} from "../../drizzle/schema";
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
  ): Promise<{
    reviews: any[];
    total: number;
    hotelName: string;
    userName: string;
  }> {
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

    // Single query to get total count
    const totalResult = await database
      .select({ count: count() })
      .from(reviewTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Single query with joins to get all data
    const rows = await database
      .select({
        id: reviewTable.id,
        hotelId: reviewTable.hotelId,
        userId: reviewTable.userId,
        bookingId: reviewTable.bookingId,
        rating: reviewTable.rating,
        title: reviewTable.title,
        body: reviewTable.body,
        status: reviewTable.status,
        createdAt: reviewTable.createdAt,
        publishedAt: reviewTable.publishedAt,
        hotelName: hotelTable.name,
        userName: userTable.fullName,
      })
      .from(reviewTable)
      .leftJoin(hotelTable, eq(reviewTable.hotelId, hotelTable.id))
      .leftJoin(userTable, eq(reviewTable.userId, userTable.id))
      .where(whereClause)
      .orderBy(desc((reviewTable as any).createdAt))
      .limit(limit)
      .offset(offset);

    // Since we're getting hotel and user data per review now, we can extract the first ones for backward compatibility
    const firstHotel = rows[0]?.hotelName;
    const firstUser = rows[0]?.userName;

    return {
      reviews: rows,
      total,
      hotelName: firstHotel || "",
      userName: firstUser || "",
    };
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
