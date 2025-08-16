import type { HotelScopedFilters, DateRangeFilter } from "./common.interface";

/**
 * Filters for checking room availability
 */
export interface AvailabilityFilters
  extends HotelScopedFilters,
    DateRangeFilter {
  roomTypeId?: number;
  minPriceCents?: number;
  maxPriceCents?: number;
  amenityCodes?: string[];
  guestCount?: number;
  numAdults?: number;
  numChildren?: number;
  petsAllowed?: number; // reserved for future use
}

/**
 * Parameters for availability search
 */
export interface AvailabilitySearchParams extends AvailabilityFilters {
  checkInDate: string;
  checkOutDate: string;
  hotelId: number;
}
