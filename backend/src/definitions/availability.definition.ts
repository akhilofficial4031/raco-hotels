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
   * Unified room availability endpoint
   * Handles both specific room type and all room types searches
   */
  getRoomAvailability: createPublicRoute({
    method: "get",
    path: "/rooms/availability",
    summary: "Search room availability by hotel",
    description: `Unified endpoint for searching available room types and rooms in a hotel.
    
    **Features:**
    - Search by hotel ID (mandatory)
    - Optional room type filtering (roomTypeId)
    - Optional room count validation (numberOfRooms)
    - Filter by price range (min/max)
    - Filter by guest count (max occupancy)
    - Returns room types with individual room details
    
    **Business Rules:**
    - hotelId is mandatory
    - roomTypeId is optional - if provided, searches only that room type
    - numberOfRooms is optional - validates available count if provided
    - Check-in date must be before check-out date
    - Check-in date cannot be in the past
    - Maximum date range is 30 days
    
    **Response:**
    - Always returns array of room types
    - Each room type includes available individual rooms
    - Only room types with available rooms are returned
    
    **Performance:**
    - Uses optimized SQL with proper indexing
    - Excludes rooms with status "out_of_order" or "maintenance"
    - Excludes rooms with booking conflicts`,
    tags: [ApiTags.ROOMS],
    successSchema: RoomsAvailabilityResponseSchema,
    successDescription:
      "Available room types with rooms retrieved successfully",
    querySchema: RoomsAvailabilityQueryParamsSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),
};
