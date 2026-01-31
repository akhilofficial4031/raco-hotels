import { eq } from "drizzle-orm";

import { refund as refundTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type { RefundDetails } from "../types/payment.types";

export class RefundRepository {
  /**
   * Create a new refund record
   */
  static async create(
    db: D1Database,
    data: {
      paymentId: number;
      amountCents: number;
      status: string;
      processorRefundId?: string | null;
    },
  ): Promise<RefundDetails> {
    const database = getDb(db);
    const currentTime = new Date().toISOString();

    const [refund] = await database
      .insert(refundTable)
      .values({
        ...data,
        createdAt: currentTime,
      })
      .returning();

    return refund as RefundDetails;
  }

  /**
   * Find refund by ID
   */
  static async findById(db: D1Database, id: number): Promise<RefundDetails | null> {
    const database = getDb(db);
    const refunds = await database
      .select()
      .from(refundTable)
      .where(eq(refundTable.id, id))
      .limit(1);

    if (refunds.length === 0) {
      return null;
    }

    return refunds[0] as RefundDetails;
  }

  /**
   * Find all refunds for a payment (with limit to prevent DoS)
   */
  static async findByPaymentId(db: D1Database, paymentId: number): Promise<RefundDetails[]> {
    const database = getDb(db);
    
    // Add limit and ordering for performance
    const refunds = await database
      .select()
      .from(refundTable)
      .where(eq(refundTable.paymentId, paymentId))
      .limit(50); // Reasonable limit for refunds per payment

    return refunds as RefundDetails[];
  }

  /**
   * Update refund status
   */
  static async updateStatus(
    db: D1Database,
    id: number,
    status: string,
  ): Promise<void> {
    const database = getDb(db);
    await database
      .update(refundTable)
      .set({ status })
      .where(eq(refundTable.id, id));
  }
}
