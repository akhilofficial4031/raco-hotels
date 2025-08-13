import { and, between, eq } from "drizzle-orm";

import {
  roomInventory,
  roomRate,
  taxFee as taxFeeTable,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { BookingRepository } from "../repositories/booking.repository";
import { BookingDraftRepository } from "../repositories/booking_draft.repository";

function generateReferenceCode(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DR-${Date.now().toString().slice(-6)}-${rand}`;
}

export class BookingDraftService {
  static async upsertDraft(
    db: D1Database,
    data: {
      sessionId: string;
      hotelId: number;
      roomTypeId: number;
      ratePlanId?: number | null;
      checkInDate: string;
      checkOutDate: string;
      numAdults: number;
      numChildren: number;
      petsCount?: number;
      promoCode?: string;
      contactEmail?: string;
      contactPhone?: string;
      addOnsJson?: string;
    },
  ) {
    const database = getDb(db);
    // Validate availability
    const inv = await database
      .select()
      .from(roomInventory)
      .where(
        and(
          eq(roomInventory.roomTypeId, data.roomTypeId),
          between(roomInventory.date, data.checkInDate, data.checkOutDate),
          eq(roomInventory.closed, 0),
        ),
      );
    if (!inv.length) throw new Error("validation: no availability");

    // Base total from rates
    const rates = await database
      .select({ priceCents: roomRate.priceCents })
      .from(roomRate)
      .where(
        and(
          eq(roomRate.roomTypeId, data.roomTypeId),
          between(roomRate.date, data.checkInDate, data.checkOutDate),
        ),
      );
    if (!rates.length) throw new Error("validation: pricing unavailable");
    const baseAmountCents = rates.reduce(
      (acc, r) => acc + (r.priceCents as number),
      0,
    );

    const taxes = await database
      .select()
      .from(taxFeeTable)
      .where(eq(taxFeeTable.hotelId, data.hotelId));
    let taxAmountCents = 0;
    let feeAmountCents = 0;
    for (const t of taxes as any[]) {
      if (t.isActive !== 1) continue;
      if (t.type === "percent") {
        const value = Math.round((baseAmountCents * t.value) / 100);
        if (t.name?.toLowerCase().includes("tax")) taxAmountCents += value;
        else feeAmountCents += value;
      } else if (t.type === "fixed") {
        const nights = rates.length;
        const persons = (data.numAdults ?? 1) + (data.numChildren ?? 0);
        let multiplier = 1;
        if (t.scope === "per_night") multiplier = nights;
        else if (t.scope === "per_person") multiplier = persons;
        feeAmountCents += t.value * multiplier;
      }
    }
    const discountAmountCents = 0; // promo integration later
    const totalAmountCents =
      baseAmountCents + taxAmountCents + feeAmountCents - discountAmountCents;
    const balanceDueCents = totalAmountCents;

    const referenceCode = generateReferenceCode();
    const draft = await BookingDraftRepository.upsertDraft(db, {
      sessionId: data.sessionId,
      referenceCode,
      hotelId: data.hotelId,
      roomTypeId: data.roomTypeId,
      ratePlanId: data.ratePlanId ?? null,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      numAdults: data.numAdults,
      numChildren: data.numChildren,
      petsCount: data.petsCount ?? 0,
      currencyCode: "USD",
      promoCode: data.promoCode,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      addOnsJson: data.addOnsJson,
      amounts: {
        baseAmountCents,
        taxAmountCents,
        feeAmountCents,
        discountAmountCents,
        totalAmountCents,
        balanceDueCents,
      },
    });

    return draft;
  }

  static async convertToBooking(
    db: D1Database,
    identifier: { sessionId?: string; email?: string },
    userId: number,
  ) {
    let draft = null as any;
    if (identifier.sessionId) {
      draft = await BookingDraftRepository.findBySession(
        db,
        identifier.sessionId,
      );
    }
    if (!draft && identifier.email) {
      draft = await BookingDraftRepository.findLatestByEmail(
        db,
        identifier.email,
      );
    }
    if (!draft) throw new Error("draft not found");

    // Use booking repository to create a genuine booking and copy totals
    const created = await BookingRepository.createDraft(db, {
      referenceCode: draft.referenceCode,
      hotelId: draft.hotelId,
      userId,
      checkInDate: draft.checkInDate,
      checkOutDate: draft.checkOutDate,
      numAdults: draft.numAdults,
      numChildren: draft.numChildren,
      currencyCode: draft.currencyCode,
    });

    await BookingRepository.addLineItems(
      db,
      created.id,
      draft.roomTypeId,
      draft.ratePlanId ?? null,
      draft.checkInDate,
      draft.checkOutDate,
    );

    await BookingRepository.updateTotals(db, created.id, {
      totalAmountCents: draft.totalAmountCents,
      taxAmountCents: draft.taxAmountCents,
      feeAmountCents: draft.feeAmountCents,
      discountAmountCents: draft.discountAmountCents,
      balanceDueCents: draft.balanceDueCents,
    });

    await BookingDraftRepository.deleteById(db, draft.id);

    return created;
  }
}
