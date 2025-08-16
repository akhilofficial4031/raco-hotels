import { and, between, eq } from "drizzle-orm";

import {
  booking as bookingTable,
  bookingItem as bookingItemTable,
  payment as paymentTable,
  roomRate,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { type CreateBookingData } from "../types";

export class BookingRepository {
  static async createDraft(db: D1Database, data: CreateBookingData) {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(bookingTable)
      .values({
        ...data,
        status: "reserved",
        taxAmountCents: 0,
        feeAmountCents: 0,
        discountAmountCents: 0,
        totalAmountCents: 0,
        balanceDueCents: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as any;
  }

  static async addLineItems(
    db: D1Database,
    bookingId: number,
    roomTypeId: number,
    ratePlanId: number | null,
    startDate: string,
    endDate: string,
  ) {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomRate)
      .where(
        and(
          eq(roomRate.roomTypeId, roomTypeId),
          between(roomRate.date, startDate, endDate),
        ),
      );
    const nowIso = new Date().toISOString();
    for (const r of rows as any[]) {
      await database.insert(bookingItemTable).values({
        bookingId,
        roomTypeId,
        ratePlanId,
        date: r.date,
        priceCents: r.priceCents,
        taxAmountCents: 0,
        feeAmountCents: 0,
        createdAt: nowIso,
      } as any);
    }
  }

  static async updateTotals(
    db: D1Database,
    bookingId: number,
    totals: Partial<{
      totalAmountCents: number;
      taxAmountCents: number;
      feeAmountCents: number;
      discountAmountCents: number;
      balanceDueCents: number;
    }>,
  ) {
    const database = getDb(db);
    await database
      .update(bookingTable)
      .set({ ...totals, updatedAt: new Date().toISOString() } as any)
      .where(eq(bookingTable.id, bookingId));
  }

  static async markStatus(db: D1Database, bookingId: number, status: string) {
    const database = getDb(db);
    await database
      .update(bookingTable)
      .set({ status, updatedAt: new Date().toISOString() } as any)
      .where(eq(bookingTable.id, bookingId));
  }

  static async findById(db: D1Database, id: number) {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(bookingTable)
      .where(eq(bookingTable.id, id))
      .limit(1);
    return (rows as any)[0] || null;
  }

  static async getItems(db: D1Database, bookingId: number) {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(bookingItemTable)
      .where(eq(bookingItemTable.bookingId, bookingId));
    return rows as any[];
  }

  static async createPayment(
    db: D1Database,
    bookingId: number,
    amountCents: number,
    currencyCode: string,
    method: string,
    processor: string,
    processorPaymentId?: string,
  ) {
    const database = getDb(db);
    const [created] = await database
      .insert(paymentTable)
      .values({
        bookingId,
        amountCents,
        currencyCode,
        method,
        processor,
        processorPaymentId: processorPaymentId ?? null,
        status: "succeeded",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)
      .returning();
    return created as any;
  }
}
