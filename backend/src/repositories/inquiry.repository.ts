import { and, count, desc, eq, like, gte, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";

import * as schema from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseInquiry,
  InquiryFilters,
  PaginationParams,
  CreateInquiryData,
  UpdateInquiryData,
} from "../types";

export class InquiryRepository {
  /**
   * Find all inquiries with optional filters and pagination
   */
  static async findAll(
    db: D1Database,
    filters: InquiryFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ inquiries: DatabaseInquiry[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    // Status filter
    if (filters.status) {
      conditions.push(eq(schema.inquiry.status, filters.status));
    }

    // Search filter (name, phone, or message)
    if (filters.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(
        sql`(
          ${schema.inquiry.name} LIKE ${pattern} OR 
          ${schema.inquiry.phone} LIKE ${pattern} OR 
          ${schema.inquiry.message} LIKE ${pattern}
        )`,
      );
    }

    // Date range filters
    if (filters.dateFrom) {
      conditions.push(gte(schema.inquiry.date, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(schema.inquiry.date, filters.dateTo));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await database
      .select({ count: count() })
      .from(schema.inquiry)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get paginated results with attraction data
    const inquiries = await database
      .select({
        id: schema.inquiry.id,
        name: schema.inquiry.name,
        phone: schema.inquiry.phone,
        date: schema.inquiry.date,
        message: schema.inquiry.message,
        status: schema.inquiry.status,
        remarks: schema.inquiry.remarks,
        attractionId: schema.inquiry.attractionId,
        createdAt: schema.inquiry.createdAt,
        updatedAt: schema.inquiry.updatedAt,
        attractionName: schema.attraction.name,
      })
      .from(schema.inquiry)
      .leftJoin(
        schema.attraction,
        eq(schema.inquiry.attractionId, schema.attraction.id),
      )
      .where(whereClause)
      .orderBy(desc(schema.inquiry.createdAt))
      .limit(limit)
      .offset(offset);

    return { inquiries, total };
  }

  /**
   * Find inquiry by ID
   */
  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseInquiry | null> {
    const database = getDb(db);
    const result = await database
      .select({
        id: schema.inquiry.id,
        name: schema.inquiry.name,
        phone: schema.inquiry.phone,
        date: schema.inquiry.date,
        message: schema.inquiry.message,
        status: schema.inquiry.status,
        remarks: schema.inquiry.remarks,
        attractionId: schema.inquiry.attractionId,
        createdAt: schema.inquiry.createdAt,
        updatedAt: schema.inquiry.updatedAt,
        attractionName: schema.attraction.name,
      })
      .from(schema.inquiry)
      .leftJoin(
        schema.attraction,
        eq(schema.inquiry.attractionId, schema.attraction.id),
      )
      .where(eq(schema.inquiry.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find attraction by slug
   */
  static async findAttractionBySlug(
    db: D1Database,
    slug: string,
  ): Promise<{ id: number; name: string; slug: string } | null> {
    const database = getDb(db);
    const result = await database
      .select({
        id: schema.attraction.id,
        name: schema.attraction.name,
        slug: schema.attraction.slug,
      })
      .from(schema.attraction)
      .where(eq(schema.attraction.slug, slug))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create new inquiry
   */
  static async create(
    db: D1Database,
    data: CreateInquiryData,
  ): Promise<DatabaseInquiry> {
    const database = getDb(db);
    const result = await database
      .insert(schema.inquiry)
      .values({
        name: data.name,
        phone: data.phone,
        date: data.date,
        message: data.message,
        status: data.status || "pending",
        remarks: data.remarks || null,
        attractionId: (data as any).attractionId || null,
      })
      .returning();

    return result[0];
  }

  /**
   * Update inquiry by ID
   */
  static async update(
    db: D1Database,
    id: number,
    data: UpdateInquiryData,
  ): Promise<DatabaseInquiry | null> {
    const database = getDb(db);

    const updateData: any = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.remarks !== undefined) updateData.remarks = data.remarks;
    if ((data as any).attractionId !== undefined) updateData.attractionId = (data as any).attractionId;

    const result = await database
      .update(schema.inquiry)
      .set(updateData)
      .where(eq(schema.inquiry.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete inquiry by ID
   */
  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const result = await database
      .delete(schema.inquiry)
      .where(eq(schema.inquiry.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Get inquiry statistics (counts by status)
   */
  static async getStats(db: D1Database): Promise<Record<string, number>> {
    const database = getDb(db);
    const result = await database
      .select({
        status: schema.inquiry.status,
        count: count(),
      })
      .from(schema.inquiry)
      .groupBy(schema.inquiry.status);

    const stats: Record<string, number> = {};
    result.forEach((row) => {
      stats[row.status] = row.count;
    });

    return stats;
  }
}
