import { and, between, eq, desc, gte, lte, asc, count, sql } from "drizzle-orm";

import {
  bookingDraft as bookingDraftTable,
  bookingDraftItem as bookingDraftItemTable,
  hotel as hotelTable,
  roomType as roomTypeTable,
  roomRate,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { type CreateBookingDraftData } from "../types";

export class BookingDraftRepository {
  static async upsertDraft(db: D1Database, data: CreateBookingDraftData) {
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

  static async findPendingBookings(
    db: D1Database,
    filters: {
      hotelId?: number;
      olderThan?: string;
      checkInAfter?: string;
      checkInBefore?: string;
      page?: number;
      limit?: number;
      sortBy?: "created_at" | "check_in_date" | "total_amount";
      sortOrder?: "asc" | "desc";
    } = {},
  ) {
    const database = getDb(db);
    const {
      hotelId,
      olderThan,
      checkInAfter,
      checkInBefore,
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "desc",
    } = filters;

    const offset = (page - 1) * limit;

    // Build conditions array
    const conditions: any[] = [
      eq(bookingDraftTable.status, "draft"), // Only draft bookings
    ];

    if (hotelId) {
      conditions.push(eq(bookingDraftTable.hotelId, hotelId));
    }

    if (olderThan) {
      conditions.push(lte(bookingDraftTable.createdAt, olderThan));
    }

    if (checkInAfter) {
      conditions.push(gte(bookingDraftTable.checkInDate, checkInAfter));
    }

    if (checkInBefore) {
      conditions.push(lte(bookingDraftTable.checkInDate, checkInBefore));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await database
      .select({ count: count() })
      .from(bookingDraftTable)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Determine sort field and order
    let orderByClause;
    const orderFn = sortOrder === "asc" ? asc : desc;

    switch (sortBy) {
      case "check_in_date":
        orderByClause = orderFn(bookingDraftTable.checkInDate);
        break;
      case "total_amount":
        orderByClause = orderFn(bookingDraftTable.totalAmountCents);
        break;
      default:
        orderByClause = orderFn(bookingDraftTable.createdAt);
        break;
    }

    // Get paginated results with joins
    const results = await database
      .select({
        // Draft fields
        id: bookingDraftTable.id,
        sessionId: bookingDraftTable.sessionId,
        referenceCode: bookingDraftTable.referenceCode,
        hotelId: bookingDraftTable.hotelId,
        roomTypeId: bookingDraftTable.roomTypeId,
        checkInDate: bookingDraftTable.checkInDate,
        checkOutDate: bookingDraftTable.checkOutDate,
        numAdults: bookingDraftTable.numAdults,
        numChildren: bookingDraftTable.numChildren,
        totalAmountCents: bookingDraftTable.totalAmountCents,
        currencyCode: bookingDraftTable.currencyCode,
        contactEmail: bookingDraftTable.contactEmail,
        contactPhone: bookingDraftTable.contactPhone,
        promoCode: bookingDraftTable.promoCode,
        createdAt: bookingDraftTable.createdAt,
        updatedAt: bookingDraftTable.updatedAt,
        // Hotel name
        hotelName: hotelTable.name,
        // Room type name
        roomTypeName: roomTypeTable.name,
      })
      .from(bookingDraftTable)
      .leftJoin(hotelTable, eq(bookingDraftTable.hotelId, hotelTable.id))
      .leftJoin(
        roomTypeTable,
        eq(bookingDraftTable.roomTypeId, roomTypeTable.id),
      )
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Calculate derived fields
    const now = new Date();
    const enrichedResults = results.map((item: any) => {
      const createdDate = new Date(item.createdAt);
      const daysSinceCreated = Math.floor(
        (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Consider booking expiring soon if older than 24 hours
      const isExpiringSoon = daysSinceCreated >= 1;

      return {
        ...item,
        daysSinceCreated,
        isExpiringSoon,
      };
    });

    return {
      items: enrichedResults,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }
}
