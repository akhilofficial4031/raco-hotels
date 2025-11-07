import { AvailabilityRepository } from "../repositories/availability.repository";

import type { RoomsAvailabilityQueryParamsSchema } from "../schemas";
import type { z } from "zod";

/**
 * Service layer for room availability business logic
 * Handles validation and orchestrates repository calls
 */
export class AvailabilityService {
  /**
   * Search for available room types by hotel ID or slug
   * 
   * Business rules:
   * 1. Either hotelId or hotelSlug must be provided
   * 2. Check-in date must be before check-out date
   * 3. Check-in date must not be in the past
   * 4. Date range should not exceed 30 days (optional limit)
   * 
   * @param db - D1Database instance
   * @param query - Search parameters
   * @returns Available room types with counts
   */
  static async searchRoomAvailability(
    db: D1Database,
    query: z.infer<typeof RoomsAvailabilityQueryParamsSchema>,
  ) {
    const {
      hotelId,
      hotelSlug,
      checkInDate,
      checkOutDate,
      minPriceCents,
      maxPriceCents,
      guestCount,
    } = query;

    // Validation: Check required fields
    if (!checkInDate || !checkOutDate) {
      throw new Error("validation: Check-in and check-out dates are required");
    }

    if (!hotelId && !hotelSlug) {
      throw new Error("validation: Either hotelId or hotelSlug must be provided");
    }

    // Validation: Date logic
    if (checkInDate >= checkOutDate) {
      throw new Error("validation: Check-in date must be before check-out date");
    }

    // Validation: Check if check-in date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (checkInDate < today) {
      throw new Error("validation: Check-in date cannot be in the past");
    }

    // Validation: Optional - limit date range to prevent abuse
    const daysDiff = this.calculateDaysDifference(checkInDate, checkOutDate);
    if (daysDiff > 30) {
      throw new Error("validation: Date range cannot exceed 30 days");
    }

    // Determine hotel identifier (prefer ID over slug for performance)
    const hotelIdentifier = hotelId ? parseInt(hotelId, 10) : hotelSlug!;

    // Build filters
    const filters = {
      minPriceCents: minPriceCents ? parseInt(minPriceCents, 10) : undefined,
      maxPriceCents: maxPriceCents ? parseInt(maxPriceCents, 10) : undefined,
      guestCount: guestCount ? parseInt(guestCount, 10) : undefined,
    };

    // Call optimized repository method
    const result = await AvailabilityRepository.findAvailableRoomTypesByHotel(
      db,
      hotelIdentifier,
      checkInDate,
      checkOutDate,
      filters,
    );

    // Check if hotel was found
    if (result.hotelId === null) {
      throw new Error("validation: Hotel not found or inactive");
    }

    return {
      hotelId: result.hotelId,
      checkInDate,
      checkOutDate,
      roomTypes: result.roomTypes,
      totalRoomTypesAvailable: result.roomTypes.length,
    };
  }

  /**
   * Legacy search method - kept for backward compatibility
   * @deprecated Use searchRoomAvailability instead
   */
  static async search(
    db: D1Database,
    query: z.infer<typeof RoomsAvailabilityQueryParamsSchema>,
  ) {
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      minPriceCents,
      maxPriceCents,
      guestCount,
    } = query as any;

    if (!checkInDate || !checkOutDate) {
      throw new Error("validation: missing dates");
    }
    if (checkInDate >= checkOutDate) {
      throw new Error("validation: checkInDate must be before checkOutDate");
    }

    const results = await AvailabilityRepository.findAvailableRoomTypes(
      db,
      checkInDate,
      checkOutDate,
      {
        hotelId: hotelId ? parseInt(hotelId, 10) : undefined,
        roomTypeId: undefined,
        minPriceCents: minPriceCents ? parseInt(minPriceCents, 10) : undefined,
        maxPriceCents: maxPriceCents ? parseInt(maxPriceCents, 10) : undefined,
        guestCount: guestCount ? parseInt(guestCount, 10) : undefined,
      },
    );

    return results;
  }

  /**
   * Helper method to calculate days between two dates
   */
  private static calculateDaysDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
