import { eq } from "drizzle-orm";

import { payment as paymentTable } from "../../drizzle/schema";
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
