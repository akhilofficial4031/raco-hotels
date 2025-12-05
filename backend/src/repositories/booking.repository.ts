import { and, eq, gte, lte, or, asc, desc, sql } from "drizzle-orm";

import {
  booking as bookingTable,
  bookingItems as bookingItemsTable,
  bookingAddon as bookingAddonTable,
  hotel as hotelTable,
  customer as customerTable,
  roomType as roomTypeTable,
  room as roomTable,
  addon as addonTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

type BookingStatus = "confirmed" | "checkedin" | "checkedout" | "cancelled";

export class BookingRepository {
  static async findById(db: D1Database, id: number) {
    const database = getDb(db);
    const rows = await database
      .select({
        booking: bookingTable,
        hotel: hotelTable,
        customer: customerTable,
      })
      .from(bookingTable)
      .where(eq(bookingTable.id, id))
      .leftJoin(hotelTable, eq(bookingTable.hotelId, hotelTable.id))
      .leftJoin(customerTable, eq(bookingTable.customerId, customerTable.id))
      .limit(1);

    if (!rows.length) {
      return null;
    }

    const bookingInfo = {
      ...rows[0].booking,
      hotel: rows[0].hotel,
      customer: rows[0].customer,
    };

    const items = await database
      .select()
      .from(bookingItemsTable)
      .where(eq(bookingItemsTable.bookingId, id))
      .leftJoin(
        roomTypeTable,
        eq(bookingItemsTable.roomTypeId, roomTypeTable.id),
      )
      .leftJoin(roomTable, eq(bookingItemsTable.roomId, roomTable.id));

    const addons = await database
      .select()
      .from(bookingAddonTable)
      .where(eq(bookingAddonTable.bookingId, id))
      .leftJoin(addonTable, eq(bookingAddonTable.addonId, addonTable.id));

    return { ...bookingInfo, items, addons };
  }

  static async update(
    db: D1Database,
    id: number,
    data: Partial<{
      checkInDate: string;
      checkOutDate: string;
      numAdults: number;
      numChildren: number;
      status: BookingStatus;
      totalAmountCents: number;
      amountPaidCents: number;
      balanceDueCents: number;
      paymentStatus: string;
    }>,
  ) {
    const database = getDb(db);
    await database
      .update(bookingTable)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(bookingTable.id, id));
  }

  static async updateStatus(
    db: D1Database,
    bookingId: number,
    status: BookingStatus,
  ) {
    const database = getDb(db);
    await database
      .update(bookingTable)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(bookingTable.id, bookingId));
  }

  static async getItems(db: D1Database, bookingId: number) {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(bookingItemsTable)
      .where(eq(bookingItemsTable.bookingId, bookingId));
    return rows as any[];
  }

  static async findBookingsByRoomId(db: D1Database, roomId: number) {
    const database = getDb(db);
    const result = await database
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(bookingItemsTable)
      .where(eq(bookingItemsTable.roomId, roomId));

    return result[0].count;
  }

  static async findBookings(
    db: D1Database,
    filters: {
      page: number;
      limit: number;
      hotelId?: number;
      status?: BookingStatus;
      query?: string;
      checkInDateStart?: string;
      checkInDateEnd?: string;
      createdAtStart?: string;
      createdAtEnd?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  ) {
    const database = getDb(db);
    const conditions = [];

    if (filters.hotelId) {
      conditions.push(eq(bookingTable.hotelId, filters.hotelId));
    }
    if (filters.status) {
      conditions.push(eq(bookingTable.status, filters.status));
    }
    if (filters.checkInDateStart) {
      conditions.push(gte(bookingTable.checkInDate, filters.checkInDateStart));
    }
    if (filters.checkInDateEnd) {
      conditions.push(lte(bookingTable.checkInDate, filters.checkInDateEnd));
    }
    if (filters.createdAtStart) {
      conditions.push(gte(bookingTable.createdAt, filters.createdAtStart));
    }
    if (filters.createdAtEnd) {
      conditions.push(lte(bookingTable.createdAt, filters.createdAtEnd));
    }
    if (filters.query) {
      const query = `%${filters.query.toLowerCase()}%`;
      conditions.push(
        or(
          sql`lower(${bookingTable.referenceCode}) like ${query}`,
          sql`lower(${customerTable.fullName}) like ${query}`,
        ),
      );
    }

    const bookingsQuery = database
      .select({
        id: bookingTable.id,
        referenceCode: bookingTable.referenceCode,
        hotelId: bookingTable.hotelId,
        hotelName: hotelTable.name,
        customerName: customerTable.fullName,
        checkInDate: bookingTable.checkInDate,
        checkOutDate: bookingTable.checkOutDate,
        status: bookingTable.status,
        totalAmountCents: bookingTable.totalAmountCents,
        amountPaidCents: bookingTable.amountPaidCents,
        taxAmountCents: bookingTable.taxAmountCents,
        currencyCode: bookingTable.currencyCode,
        createdAt: bookingTable.createdAt,
      })
      .from(bookingTable)
      .leftJoin(hotelTable, eq(bookingTable.hotelId, hotelTable.id))
      .leftJoin(customerTable, eq(bookingTable.customerId, customerTable.id))
      .where(and(...conditions));

    const totalQuery = database
      .select({ count: sql<number>`count(*)` })
      .from(bookingTable)
      .leftJoin(hotelTable, eq(bookingTable.hotelId, hotelTable.id))
      .leftJoin(customerTable, eq(bookingTable.customerId, customerTable.id))
      .where(and(...conditions));

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let orderedQuery;
    if (filters.sortBy && filters.sortOrder) {
      const sortColumn =
        filters.sortBy === "check_in_date"
          ? bookingTable.checkInDate
          : filters.sortBy === "total_amount_cents"
            ? bookingTable.totalAmountCents
            : bookingTable.createdAt;
      const sortDirection = filters.sortOrder === "asc" ? asc : desc;
      orderedQuery = bookingsQuery.orderBy(sortDirection(sortColumn));
    } else {
      orderedQuery = bookingsQuery;
    }

    const finalQuery = orderedQuery.limit(limit).offset(offset);

    const [items, totalResult] = await Promise.all([finalQuery, totalQuery]);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      items,
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };
  }
}
