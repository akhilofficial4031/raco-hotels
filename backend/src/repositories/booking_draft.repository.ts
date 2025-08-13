import { and, between, eq, desc } from "drizzle-orm";

import {
  bookingDraft as bookingDraftTable,
  bookingDraftItem as bookingDraftItemTable,
  roomRate,
} from "../../drizzle/schema";
import { getDb } from "../db";

export interface CreateDraftData {
  sessionId: string;
  referenceCode: string;
  hotelId: number;
  roomTypeId: number;
  ratePlanId?: number | null;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  petsCount?: number;
  currencyCode: string;
  promoCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  addOnsJson?: string;
  amounts: {
    baseAmountCents: number;
    taxAmountCents: number;
    feeAmountCents: number;
    discountAmountCents: number;
    totalAmountCents: number;
    balanceDueCents: number;
  };
}

export class BookingDraftRepository {
  static async upsertDraft(db: D1Database, data: CreateDraftData) {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    // If a draft exists for session, update; else create
    const existing = await this.findBySession(db, data.sessionId);
    if (existing) {
      const [updated] = await database
        .update(bookingDraftTable)
        .set({
          referenceCode: data.referenceCode,
          hotelId: data.hotelId,
          roomTypeId: data.roomTypeId,
          ratePlanId: data.ratePlanId ?? null,
          status: "draft",
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          numAdults: data.numAdults,
          numChildren: data.numChildren,
          petsCount: data.petsCount ?? null,
          baseAmountCents: data.amounts.baseAmountCents,
          taxAmountCents: data.amounts.taxAmountCents,
          feeAmountCents: data.amounts.feeAmountCents,
          discountAmountCents: data.amounts.discountAmountCents,
          totalAmountCents: data.amounts.totalAmountCents,
          balanceDueCents: data.amounts.balanceDueCents,
          currencyCode: data.currencyCode,
          promoCode: data.promoCode ?? null,
          contactEmail: data.contactEmail ?? null,
          contactPhone: data.contactPhone ?? null,
          addOnsJson: data.addOnsJson ?? null,
          updatedAt: nowIso,
        } as any)
        .where(eq(bookingDraftTable.id, existing.id))
        .returning();
      await database
        .delete(bookingDraftItemTable)
        .where(eq(bookingDraftItemTable.bookingDraftId, existing.id));
      await this.addItems(
        db,
        existing.id,
        data.roomTypeId,
        data.checkInDate,
        data.checkOutDate,
      );
      return updated as any;
    }
    const [created] = await database
      .insert(bookingDraftTable)
      .values({
        sessionId: data.sessionId,
        referenceCode: data.referenceCode,
        hotelId: data.hotelId,
        roomTypeId: data.roomTypeId,
        ratePlanId: data.ratePlanId ?? null,
        status: "draft",
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numAdults: data.numAdults,
        numChildren: data.numChildren,
        petsCount: data.petsCount ?? null,
        baseAmountCents: data.amounts.baseAmountCents,
        taxAmountCents: data.amounts.taxAmountCents,
        feeAmountCents: data.amounts.feeAmountCents,
        discountAmountCents: data.amounts.discountAmountCents,
        totalAmountCents: data.amounts.totalAmountCents,
        balanceDueCents: data.amounts.balanceDueCents,
        currencyCode: data.currencyCode,
        promoCode: data.promoCode ?? null,
        contactEmail: data.contactEmail ?? null,
        contactPhone: data.contactPhone ?? null,
        addOnsJson: data.addOnsJson ?? null,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    await this.addItems(
      db,
      (created as any).id,
      data.roomTypeId,
      data.checkInDate,
      data.checkOutDate,
    );
    return created as any;
  }

  static async addItems(
    db: D1Database,
    bookingDraftId: number,
    roomTypeId: number,
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
      await database.insert(bookingDraftItemTable).values({
        bookingDraftId,
        date: r.date,
        priceCents: r.priceCents,
        taxAmountCents: 0,
        feeAmountCents: 0,
        createdAt: nowIso,
      } as any);
    }
  }

  static async findBySession(db: D1Database, sessionId: string) {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(bookingDraftTable)
      .where(eq(bookingDraftTable.sessionId, sessionId))
      .limit(1);
    return (rows as any)[0] || null;
  }

  static async findLatestByEmail(db: D1Database, contactEmail: string) {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(bookingDraftTable)
      .where(eq(bookingDraftTable.contactEmail, contactEmail))
      .orderBy(desc(bookingDraftTable.updatedAt))
      .limit(1);
    return (rows as any)[0] || null;
  }

  static async deleteById(db: D1Database, id: number) {
    const database = getDb(db);
    await database
      .delete(bookingDraftTable)
      .where(eq(bookingDraftTable.id, id));
  }
}
