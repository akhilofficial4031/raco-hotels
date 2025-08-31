import { and, eq, inArray, sql } from "drizzle-orm";

import {
  booking as bookingTable,
  bookingItems as bookingItemsTable,
  room as roomUnitTable,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { type AvailabilityFilters } from "../types/availability.interface";

export class AvailabilityRepository {
  static async findAvailableRoomTypes(
    db: D1Database,
    startDate: string,
    endDate: string,
    filters: AvailabilityFilters = {},
  ) {
    const database = getDb(db);

    if (!filters.hotelId || !filters.roomTypeId) {
      return [] as any[];
    }

    // 1. Get all rooms for the given hotel and room type
    const allRoomsForType = await database
      .select({ id: roomUnitTable.id })
      .from(roomUnitTable)
      .where(
        and(
          eq(roomUnitTable.hotelId, filters.hotelId),
          eq(roomUnitTable.roomTypeId, filters.roomTypeId),
        ),
      );

    if (allRoomsForType.length === 0) {
      return [] as any[];
    }

    const allRoomIds = allRoomsForType.map((r) => r.id);

    // 2. Find rooms that are booked in the given date range
    const bookedRooms = await database
      .select({ roomId: bookingItemsTable.roomId })
      .from(bookingItemsTable)
      .leftJoin(bookingTable, eq(bookingItemsTable.bookingId, bookingTable.id))
      .where(
        and(
          inArray(bookingItemsTable.roomId, allRoomIds),
          sql`${bookingTable.checkOutDate} > ${startDate}`,
          sql`${bookingTable.checkInDate} < ${endDate}`,
          eq(bookingTable.status, "confirmed"), // or whatever statuses mean "unavailable"
        ),
      );

    const bookedRoomIds = new Set(bookedRooms.map((r) => r.roomId));

    // 3. Determine available rooms
    const availableRoomIds = allRoomIds.filter((id) => !bookedRoomIds.has(id));

    if (availableRoomIds.length === 0) {
      return [] as any[];
    }

    const availableRooms = await database
      .select()
      .from(roomUnitTable)
      .where(inArray(roomUnitTable.id, availableRoomIds));

    return availableRooms;
  }
}
