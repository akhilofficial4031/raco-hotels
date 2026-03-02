import { and, desc, eq, like, or, sql } from "drizzle-orm";

import { booking as bookingTable, payment as paymentTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type { PaymentDetails } from "../types/payment.types";

export class PaymentRepository {
  /**
   * Find payment by ID
   */
  static async findById(db: D1Database, id: number): Promise<PaymentDetails | null> {
    const database = getDb(db);
    const payments = await database
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.id, id))
      .limit(1);

    if (payments.length === 0) {
      return null;
    }

    return payments[0] as PaymentDetails;
  }

  /**
   * Find all payments for a booking (with caching hint)
   */
  static async findByBookingId(db: D1Database, bookingId: number): Promise<PaymentDetails[]> {
    const database = getDb(db);
    
    // Add limit to prevent excessive data retrieval
    const payments = await database
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.bookingId, bookingId))
      .limit(100); // Reasonable limit for payments per booking

    return payments as PaymentDetails[];
  }

  /**
   * Update payment status
   */
  static async updateStatus(
    db: D1Database,
    id: number,
    status: string,
  ): Promise<void> {
    const database = getDb(db);
    await database
      .update(paymentTable)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(paymentTable.id, id));
  }

  /**
   * List payments with pagination and optional filters, including booking reference code
   */
  static async listPayments(
    db: D1Database,
    filters: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
    },
  ) {
    const database = getDb(db);
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(paymentTable.status, filters.status));
    }
    if (filters.search) {
      const searchPattern = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`lower(${paymentTable.processorPaymentId}) like ${searchPattern}`,
          sql`lower(${bookingTable.referenceCode}) like ${searchPattern}`,
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = database
      .select({
        id: paymentTable.id,
        bookingId: paymentTable.bookingId,
        bookingReferenceCode: bookingTable.referenceCode,
        amountCents: paymentTable.amountCents,
        currencyCode: paymentTable.currencyCode,
        status: paymentTable.status,
        method: paymentTable.method,
        processor: paymentTable.processor,
        processorPaymentId: paymentTable.processorPaymentId,
        createdAt: paymentTable.createdAt,
        updatedAt: paymentTable.updatedAt,
      })
      .from(paymentTable)
      .leftJoin(bookingTable, eq(paymentTable.bookingId, bookingTable.id));

    const countQuery = database
      .select({ count: sql<number>`count(*)` })
      .from(paymentTable)
      .leftJoin(bookingTable, eq(paymentTable.bookingId, bookingTable.id));

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const [items, totalResult] = await Promise.all([
      whereClause
        ? baseQuery.where(whereClause).orderBy(desc(paymentTable.createdAt)).limit(limit).offset(offset)
        : baseQuery.orderBy(desc(paymentTable.createdAt)).limit(limit).offset(offset),
      whereClause
        ? countQuery.where(whereClause)
        : countQuery,
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Create a new payment record
   */
  static async create(
    db: D1Database,
    data: {
      bookingId: number;
      amountCents: number;
      currencyCode: string;
      status: string;
      method: string;
      processor: string;
      processorPaymentId?: string | null;
    },
  ): Promise<PaymentDetails> {
    const database = getDb(db);
    const currentTime = new Date().toISOString();

    const [payment] = await database
      .insert(paymentTable)
      .values({
        ...data,
        createdAt: currentTime,
        updatedAt: currentTime,
      })
      .returning();

    return payment as PaymentDetails;
  }
}
