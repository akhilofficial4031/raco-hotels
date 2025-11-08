import { and, eq, inArray, sql, or, ne } from "drizzle-orm";

import {
  booking as bookingTable,
  bookingItems as bookingItemsTable,
  room as roomUnitTable,
  roomType as roomTypeTable,
  hotel as hotelTable,
  roomTypeImage as roomTypeImageTable,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { type AvailabilityFilters } from "../types/availability.interface";

/**
 * Optimized repository for room availability queries
 * Uses efficient SQL queries with proper indexing
 */
export class AvailabilityRepository {
  /**
   * Unified method to find available room types with individual rooms
   * Handles both specific room type search and all room types search
   *
   * @param db - D1Database instance
   * @param hotelId - Hotel ID (numeric)
   * @param checkInDate - Check-in date string
   * @param checkOutDate - Check-out date string
   * @param roomTypeId - Optional room type ID to filter specific room type
   * @param numberOfRooms - Optional number of rooms required for validation
   * @param filters - Optional price and guest filters
   */
  static async findAvailableRoomTypesWithRooms(
    db: D1Database,
    hotelId: number,
    checkInDate: string,
    checkOutDate: string,
    roomTypeId?: number,
    numberOfRooms?: number,
    filters: AvailabilityFilters = {},
  ) {
    const database = getDb(db);

    // First verify hotel exists and is active
    const hotelVerification = await database
      .select({ id: hotelTable.id })
      .from(hotelTable)
      .where(and(eq(hotelTable.id, hotelId), eq(hotelTable.isActive, 1)))
      .limit(1);

    if (hotelVerification.length === 0) {
      return { roomTypes: [], hotelId: null };
    }

    // Build room type query conditions
    const roomTypeConditions = [
      eq(roomTypeTable.hotelId, hotelId),
      eq(roomTypeTable.isActive, 1),
    ];

    // Add room type filter if provided
    if (roomTypeId) {
      roomTypeConditions.push(eq(roomTypeTable.id, roomTypeId));
    }

    // Add price filters if provided
    if (filters.minPriceCents !== undefined) {
      roomTypeConditions.push(
        sql`${roomTypeTable.basePriceCents} >= ${filters.minPriceCents}`,
      );
    }
    if (filters.maxPriceCents !== undefined) {
      roomTypeConditions.push(
        sql`${roomTypeTable.basePriceCents} <= ${filters.maxPriceCents}`,
      );
    }
    if (filters.guestCount !== undefined) {
      roomTypeConditions.push(
        sql`${roomTypeTable.maxOccupancy} >= ${filters.guestCount}`,
      );
    }

    // Get room types and their images in one go
    const roomTypesWithImages = await database
      .select({
        roomTypeId: roomTypeTable.id,
        roomTypeName: roomTypeTable.name,
        roomTypeSlug: roomTypeTable.slug,
        description: roomTypeTable.description,
        baseOccupancy: roomTypeTable.baseOccupancy,
        maxOccupancy: roomTypeTable.maxOccupancy,
        basePriceCents: roomTypeTable.basePriceCents,
        currencyCode: roomTypeTable.currencyCode,
        sizeSqft: roomTypeTable.sizeSqft,
        bedType: roomTypeTable.bedType,
        smokingAllowed: roomTypeTable.smokingAllowed,
        totalRooms: roomTypeTable.totalRooms,
        imageUrl: roomTypeImageTable.url,
        imageAlt: roomTypeImageTable.alt,
        imageSortOrder: roomTypeImageTable.sortOrder,
      })
      .from(roomTypeTable)
      .leftJoin(
        roomTypeImageTable,
        eq(roomTypeImageTable.roomTypeId, roomTypeTable.id),
      )
      .where(and(...roomTypeConditions))
      .orderBy(roomTypeTable.id, roomTypeImageTable.sortOrder);

    if (roomTypesWithImages.length === 0) {
      return { roomTypes: [], hotelId };
    }

    // Group images by room type
    const roomTypesMap = new Map();

    for (const row of roomTypesWithImages) {
      if (!roomTypesMap.has(row.roomTypeId)) {
        roomTypesMap.set(row.roomTypeId, {
          roomTypeId: row.roomTypeId,
          roomTypeName: row.roomTypeName,
          roomTypeSlug: row.roomTypeSlug,
          description: row.description,
          baseOccupancy: row.baseOccupancy,
          maxOccupancy: row.maxOccupancy,
          basePriceCents: row.basePriceCents,
          currencyCode: row.currencyCode,
          sizeSqft: row.sizeSqft,
          bedType: row.bedType,
          smokingAllowed: row.smokingAllowed,
          totalRooms: row.totalRooms,
          images: [],
        });
      }

      if (row.imageUrl) {
        roomTypesMap.get(row.roomTypeId).images.push({
          url: row.imageUrl,
          alt: row.imageAlt,
          sortOrder: row.imageSortOrder,
        });
      }
    }

    const roomTypes = Array.from(roomTypesMap.values());

    // For each room type, find available rooms
    const roomTypeResults = [];

    for (const roomType of roomTypes) {
      // Get all available rooms for this room type
      const availableRoomsQuery = await database
        .select({
          roomId: roomUnitTable.id,
          roomNumber: roomUnitTable.roomNumber,
          floor: roomUnitTable.floor,
          roomDescription: roomUnitTable.description,
          status: roomUnitTable.status,
        })
        .from(roomUnitTable)
        .where(
          and(
            eq(roomUnitTable.hotelId, hotelId),
            eq(roomUnitTable.roomTypeId, roomType.roomTypeId),
            eq(roomUnitTable.isActive, 1),
            eq(roomUnitTable.status, "available"), // Only available rooms
          ),
        );

      if (availableRoomsQuery.length === 0) {
        continue; // Skip room types with no available rooms
      }

      // Get room IDs to check for bookings
      const roomIds = availableRoomsQuery.map((room) => room.roomId);

      // Find rooms that are booked in the given date range
      const bookedRooms = await database
        .select({ roomId: bookingItemsTable.roomId })
        .from(bookingItemsTable)
        .innerJoin(
          bookingTable,
          eq(bookingItemsTable.bookingId, bookingTable.id),
        )
        .where(
          and(
            inArray(bookingItemsTable.roomId, roomIds),
            sql`${bookingTable.checkOutDate} > ${checkInDate}`,
            sql`${bookingTable.checkInDate} < ${checkOutDate}`,
            or(
              eq(bookingTable.status, "confirmed"),
              eq(bookingTable.status, "checkedin"),
            ),
          ),
        );

      const bookedRoomIds = new Set(bookedRooms.map((r) => r.roomId));

      // Filter out booked rooms
      const availableRooms = availableRoomsQuery
        .filter((room) => !bookedRoomIds.has(room.roomId))
        .map((room) => ({
          roomId: room.roomId,
          roomNumber: room.roomNumber,
          floor: room.floor,
          roomDescription: room.roomDescription,
          status: room.status,
        }));

      // Check numberOfRooms requirement if specified
      if (numberOfRooms && availableRooms.length < numberOfRooms) {
        continue; // Skip if not enough rooms available
      }

      // Only include room types that have available rooms
      if (availableRooms.length > 0) {
        roomTypeResults.push({
          roomTypeId: roomType.roomTypeId,
          roomTypeName: roomType.roomTypeName,
          roomTypeSlug: roomType.roomTypeSlug,
          description: roomType.description,
          baseOccupancy: roomType.baseOccupancy,
          maxOccupancy: roomType.maxOccupancy,
          basePriceCents: roomType.basePriceCents,
          currencyCode: roomType.currencyCode,
          sizeSqft: roomType.sizeSqft,
          bedType: roomType.bedType,
          smokingAllowed: roomType.smokingAllowed === 1,
          totalRooms: roomType.totalRooms || 0,
          availableRooms: availableRooms.length,
          images: roomType.images, // Add images here
          rooms: availableRooms,
        });
      }
    }

    return {
      roomTypes: roomTypeResults,
      hotelId,
    };
  }

  /**
   * Find available room types for a hotel with optimized single-query approach
   * This method uses a single efficient query to calculate availability per room type
   *
   * Performance optimizations:
   * 1. Single query with JOINs instead of multiple queries
   * 2. Subquery to calculate booked rooms efficiently
   * 3. Leverages existing indexes (hotel_id, room_type_id, booking dates)
   * 4. Returns aggregated results with available room counts
   *
   * @deprecated Use findAvailableRoomTypesWithRooms instead
   */
  static async findAvailableRoomTypesByHotel(
    db: D1Database,
    hotelIdentifier: number | string,
    checkInDate: string,
    checkOutDate: string,
    filters: AvailabilityFilters = {},
  ) {
    const database = getDb(db);

    // Step 1: Resolve hotel ID if slug is provided
    let hotelId: number;

    if (typeof hotelIdentifier === "string") {
      // It's a slug
      const hotelResult = await database
        .select({ id: hotelTable.id })
        .from(hotelTable)
        .where(
          and(eq(hotelTable.slug, hotelIdentifier), eq(hotelTable.isActive, 1)),
        )
        .limit(1);

      if (hotelResult.length === 0) {
        return { roomTypes: [], hotelId: null };
      }

      hotelId = hotelResult[0].id;
    } else {
      hotelId = hotelIdentifier;

      // Verify hotel exists and is active
      const hotelResult = await database
        .select({ id: hotelTable.id })
        .from(hotelTable)
        .where(and(eq(hotelTable.id, hotelId), eq(hotelTable.isActive, 1)))
        .limit(1);

      if (hotelResult.length === 0) {
        return { roomTypes: [], hotelId: null };
      }
    }

    // Step 2: Build the optimized availability query
    // This single query calculates total rooms and booked rooms per room type
    const query = database
      .select({
        roomTypeId: roomTypeTable.id,
        roomTypeName: roomTypeTable.name,
        roomTypeSlug: roomTypeTable.slug,
        description: roomTypeTable.description,
        baseOccupancy: roomTypeTable.baseOccupancy,
        maxOccupancy: roomTypeTable.maxOccupancy,
        basePriceCents: roomTypeTable.basePriceCents,
        currencyCode: roomTypeTable.currencyCode,
        sizeSqft: roomTypeTable.sizeSqft,
        bedType: roomTypeTable.bedType,
        smokingAllowed: roomTypeTable.smokingAllowed,
        totalRooms: roomTypeTable.totalRooms,
        // Count total physical rooms
        totalPhysicalRooms: sql<number>`COUNT(DISTINCT ${roomUnitTable.id})`.as(
          "total_physical_rooms",
        ),
        // Count booked rooms using subquery
        bookedRoomsCount: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN ${bookingItemsTable.id} IS NOT NULL 
            AND ${bookingTable.status} IN ('confirmed', 'checkedin')
            AND ${bookingTable.checkOutDate} > ${checkInDate}
            AND ${bookingTable.checkInDate} < ${checkOutDate}
            THEN ${bookingItemsTable.roomId}
            ELSE NULL
          END)
        `.as("booked_rooms_count"),
      })
      .from(roomTypeTable)
      .innerJoin(
        roomUnitTable,
        and(
          eq(roomUnitTable.roomTypeId, roomTypeTable.id),
          eq(roomUnitTable.hotelId, hotelId),
          eq(roomUnitTable.isActive, 1),
          ne(roomUnitTable.status, "out_of_order"), // Exclude out of order rooms
          ne(roomUnitTable.status, "maintenance"), // Exclude maintenance rooms
        ),
      )
      .leftJoin(
        bookingItemsTable,
        eq(bookingItemsTable.roomId, roomUnitTable.id),
      )
      .leftJoin(bookingTable, eq(bookingTable.id, bookingItemsTable.bookingId))
      .where(
        and(
          eq(roomTypeTable.hotelId, hotelId),
          eq(roomTypeTable.isActive, 1),
          // Apply optional filters
          filters.minPriceCents !== undefined
            ? sql`${roomTypeTable.basePriceCents} >= ${filters.minPriceCents}`
            : undefined,
          filters.maxPriceCents !== undefined
            ? sql`${roomTypeTable.basePriceCents} <= ${filters.maxPriceCents}`
            : undefined,
          filters.guestCount !== undefined
            ? sql`${roomTypeTable.maxOccupancy} >= ${filters.guestCount}`
            : undefined,
        ),
      )
      .groupBy(
        roomTypeTable.id,
        roomTypeTable.name,
        roomTypeTable.slug,
        roomTypeTable.description,
        roomTypeTable.baseOccupancy,
        roomTypeTable.maxOccupancy,
        roomTypeTable.basePriceCents,
        roomTypeTable.currencyCode,
        roomTypeTable.sizeSqft,
        roomTypeTable.bedType,
        roomTypeTable.smokingAllowed,
        roomTypeTable.totalRooms,
      );

    const results = await query;

    // Step 3: Calculate available rooms and filter out fully booked room types
    const availableRoomTypes = results
      .map((rt) => ({
        roomTypeId: rt.roomTypeId,
        roomTypeName: rt.roomTypeName,
        roomTypeSlug: rt.roomTypeSlug,
        description: rt.description,
        baseOccupancy: rt.baseOccupancy,
        maxOccupancy: rt.maxOccupancy,
        basePriceCents: rt.basePriceCents,
        currencyCode: rt.currencyCode,
        sizeSqft: rt.sizeSqft,
        bedType: rt.bedType,
        smokingAllowed: rt.smokingAllowed === 1,
        totalRooms: rt.totalPhysicalRooms || 0,
        availableRooms:
          (rt.totalPhysicalRooms || 0) - (rt.bookedRoomsCount || 0),
      }))
      .filter((rt) => rt.availableRooms > 0); // Only return room types with availability

    return {
      roomTypes: availableRoomTypes,
      hotelId,
    };
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use findAvailableRoomTypesByHotel instead
   */
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
          eq(roomUnitTable.isActive, 1),
          ne(roomUnitTable.status, "out_of_order"),
          ne(roomUnitTable.status, "maintenance"),
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
      .innerJoin(bookingTable, eq(bookingItemsTable.bookingId, bookingTable.id))
      .where(
        and(
          inArray(bookingItemsTable.roomId, allRoomIds),
          sql`${bookingTable.checkOutDate} > ${startDate}`,
          sql`${bookingTable.checkInDate} < ${endDate}`,
          or(
            eq(bookingTable.status, "confirmed"),
            eq(bookingTable.status, "checkedin"),
          ),
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
