import { and, between, eq } from "drizzle-orm";
import { getDb } from "../db";
import { BookingRepository } from "../repositories/booking.repository";
import {
  booking as bookingTable,
  roomInventory,
  roomRate,
  taxFee as taxFeeTable,
} from "../../drizzle/schema";
import type {
  CreateDraftBookingRequestSchema,
  ProcessPaymentRequestSchema,
  BookingFeedbackRequestSchema,
} from "../schemas";
import type { z } from "zod";

function generateReferenceCode(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${Date.now().toString().slice(-6)}-${rand}`;
}

export class BookingService {
  static async createDraft(
    db: D1Database,
    payload: z.infer<typeof CreateDraftBookingRequestSchema>,
    userId?: number,
  ) {
    const database = getDb(db);
    const ref = generateReferenceCode();

    // Ensure availability for each night
    const inv = await database
      .select()
      .from(roomInventory)
      .where(
        and(
          eq(roomInventory.roomTypeId, payload.roomTypeId),
          between(
            roomInventory.date,
            payload.checkInDate,
            payload.checkOutDate,
          ),
          eq(roomInventory.closed, 0),
        ),
      );
    if (!inv.length) throw new Error("validation: no availability");

    // Compute base total from roomRate
    const rates = await database
      .select({ priceCents: roomRate.priceCents })
      .from(roomRate)
      .where(
        and(
          eq(roomRate.roomTypeId, payload.roomTypeId),
          between(roomRate.date, payload.checkInDate, payload.checkOutDate),
        ),
      );
    if (!rates.length) throw new Error("validation: pricing unavailable");
    const baseTotal = rates.reduce(
      (acc, r) => acc + (r.priceCents as number),
      0,
    );

    // Taxes/fees
    const taxes = await database
      .select()
      .from(taxFeeTable)
      .where(eq(taxFeeTable.hotelId, payload.hotelId));

    let taxAmount = 0;
    let feeAmount = 0;
    for (const t of taxes as any[]) {
      if (t.isActive !== 1) continue;
      if (t.type === "percent") {
        const basis = baseTotal; // simplified basis
        const value = Math.round((basis * t.value) / 100);
        if (t.name?.toLowerCase().includes("tax")) taxAmount += value;
        else feeAmount += value;
      } else if (t.type === "fixed") {
        // scope handling simplified
        const nights = rates.length;
        const persons = (payload.numAdults ?? 1) + (payload.numChildren ?? 0);
        let multiplier = 1;
        if (t.scope === "per_night") multiplier = nights;
        else if (t.scope === "per_person") multiplier = persons;
        feeAmount += t.value * multiplier;
      }
    }

    // Discount via promo code could be added via promo repo/service; omitted for brevity
    const discountAmount = 0;

    const totalAmount = baseTotal + taxAmount + feeAmount - discountAmount;

    const draft = await BookingRepository.createDraft(db, {
      referenceCode: ref,
      hotelId: payload.hotelId,
      userId: userId ?? null,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      numAdults: payload.numAdults,
      numChildren: payload.numChildren,
      currencyCode: "USD",
    });

    await BookingRepository.addLineItems(
      db,
      draft.id,
      payload.roomTypeId,
      payload.ratePlanId ?? null,
      payload.checkInDate,
      payload.checkOutDate,
    );

    await BookingRepository.updateTotals(db, draft.id, {
      totalAmountCents: totalAmount,
      taxAmountCents: taxAmount,
      feeAmountCents: feeAmount,
      discountAmountCents: discountAmount,
      balanceDueCents: totalAmount,
    });

    return draft;
  }

  static async processPayment(
    db: D1Database,
    bookingId: number,
    payload: z.infer<typeof ProcessPaymentRequestSchema>,
  ) {
    // For demo: mark payment succeeded and reduce balance
    const payment = await BookingRepository.createPayment(
      db,
      bookingId,
      payload.amountCents,
      payload.currencyCode,
      payload.method,
      payload.processor,
      payload.processorPaymentId,
    );

    const database = getDb(db);
    const rows = await database
      .select({ balance: bookingTable.balanceDueCents })
      .from(bookingTable)
      .where(eq(bookingTable.id, bookingId));
    const current = (rows as any)[0]?.balance ?? 0;
    const nextBalance = Math.max(0, current - payload.amountCents);
    await BookingRepository.updateTotals(db, bookingId, {
      balanceDueCents: nextBalance,
    });
    return payment;
  }

  static async confirm(db: D1Database, bookingId: number) {
    await BookingRepository.markStatus(db, bookingId, "confirmed");
  }
}
