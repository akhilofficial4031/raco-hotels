import { ApiTags, createPublicRoute } from "../lib/openapi";
import {
  RoomsAvailabilityQueryParamsSchema,
  RoomsAvailabilityResponseSchema,
} from "../schemas";

/**
 * Route definitions for room availability endpoints
 * All routes are public - no authentication required
 */
export const AvailabilityRouteDefinitions = {
  /**
   * Get room availability for a hotel
   * Primary endpoint for searching available rooms
   */
  getRoomAvailability: createPublicRoute({
    method: "get",
    path: "/rooms/availability",
    summary: "Search room availability by hotel",
    description: `Search for available room types in a hotel for specific dates.
    
    **Features:**
    - Search by hotel ID or hotel slug
    - Filter by price range (min/max)
    - Filter by guest count (max occupancy)
    - Returns room types with availability counts
    - Optimized single-query performance
    
    **Business Rules:**
    - Either hotelId or hotelSlug must be provided
    - Check-in date must be before check-out date
    - Check-in date cannot be in the past
    - Maximum date range is 30 days
    
    **Performance:**
    - Uses optimized SQL with proper indexing
    - Single query with JOINs for efficiency
    - Returns only room types with availability > 0`,
    tags: [ApiTags.ROOMS],
    successSchema: RoomsAvailabilityResponseSchema,
    successDescription: "Available room types retrieved successfully",
    querySchema: RoomsAvailabilityQueryParamsSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),

  /**
   * Legacy availability endpoint - kept for backward compatibility
   * @deprecated Use getRoomAvailability instead
   */
  getRoomsAvailability: createPublicRoute({
    method: "get",
    path: "/availability",
    summary: "Search room availability (Legacy)",
    description:
      "Legacy endpoint. Use /rooms/availability instead. Query room types available for a date range with optional filters.",
    tags: [ApiTags.ROOMS],
    successSchema: RoomsAvailabilityResponseSchema,
    successDescription: "Availability retrieved successfully",
    querySchema: RoomsAvailabilityQueryParamsSchema,
    includeBadRequest: true,
  }),
};
