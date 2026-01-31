import { and, eq, gt, sql } from "drizzle-orm";

import { bookingCancellationOtp } from "../../drizzle/schema";
import { getDb } from "../db";

export interface BookingCancellationOtpData {
  bookingId: number;
  bookingReference: string;
  otpCode: string;
  customerEmail: string;
  expiresAt: string;
}

export interface BookingCancellationOtpRecord {
  id: number;
  bookingId: number;
  bookingReference: string;
  otpCode: string;
  customerEmail: string;
  expiresAt: string;
  createdAt: string | null;
}

export class BookingCancellationOtpRepository {
  /**
   * Create a new OTP record
   */
  static async create(
    db: D1Database,
    data: BookingCancellationOtpData,
  ): Promise<BookingCancellationOtpRecord> {
    const database = getDb(db);
    const currentTime = new Date().toISOString();

    const [otp] = await database
      .insert(bookingCancellationOtp)
      .values({
        ...data,
        createdAt: currentTime,
      })
      .returning();

    return otp as BookingCancellationOtpRecord;
  }

  /**
   * Find a valid (non-expired) OTP by booking reference and OTP code
   */
  static async findValidOtp(
    db: D1Database,
    bookingReference: string,
    otpCode: string,
  ): Promise<BookingCancellationOtpRecord | null> {
    const database = getDb(db);
    const currentTime = new Date().toISOString();

    const results = await database
      .select()
      .from(bookingCancellationOtp)
      .where(
        and(
          eq(bookingCancellationOtp.bookingReference, bookingReference),
          eq(bookingCancellationOtp.otpCode, otpCode),
          gt(bookingCancellationOtp.expiresAt, currentTime),
        ),
      )
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return results[0] as BookingCancellationOtpRecord;
  }

  /**
   * Count recent OTP requests for rate limiting
   * Returns the number of OTPs created within the last X minutes
   */
  static async countRecentOtps(
    db: D1Database,
    bookingReference: string,
    minutesAgo: number,
  ): Promise<number> {
    const database = getDb(db);
    const cutoffTime = new Date(
      Date.now() - minutesAgo * 60 * 1000,
    ).toISOString();

    const results = await database
      .select({ count: sql<number>`count(*)` })
      .from(bookingCancellationOtp)
      .where(
        and(
          eq(bookingCancellationOtp.bookingReference, bookingReference),
          gt(bookingCancellationOtp.createdAt, cutoffTime),
        ),
      );

    return results[0]?.count ?? 0;
  }

  /**
   * Delete OTP by booking ID (used after successful verification)
   */
  static async deleteByBookingId(
    db: D1Database,
    bookingId: number,
  ): Promise<void> {
    const database = getDb(db);
    await database
      .delete(bookingCancellationOtp)
      .where(eq(bookingCancellationOtp.bookingId, bookingId));
  }

  /**
   * Delete OTP by booking reference (alternative cleanup method)
   */
  static async deleteByBookingReference(
    db: D1Database,
    bookingReference: string,
  ): Promise<void> {
    const database = getDb(db);
    await database
      .delete(bookingCancellationOtp)
      .where(eq(bookingCancellationOtp.bookingReference, bookingReference));
  }

  /**
   * Cleanup expired OTPs (for maintenance/cron jobs)
   */
  static async cleanupExpired(db: D1Database): Promise<number> {
    const database = getDb(db);
    const currentTime = new Date().toISOString();

    const result = await database
      .delete(bookingCancellationOtp)
      .where(sql`${bookingCancellationOtp.expiresAt} <= ${currentTime}`)
      .returning({ id: bookingCancellationOtp.id });

    return result.length;
  }
}
