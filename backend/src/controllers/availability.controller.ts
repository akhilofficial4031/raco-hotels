import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { AvailabilityService } from "../services/availability.service";
import { createLocalizedResponse, createLocalizedError } from "../utils/i18n";
import { HTTP_STATUS } from "../constants";

import type { AppContext } from "../types";

/**
 * Controller for room availability endpoints
 * Handles HTTP layer concerns and delegates business logic to services
 */
export class AvailabilityController {
  /**
   * Get room availability for a hotel
   * Public endpoint - no authentication required
   * 
   * Query parameters:
   * - hotelId OR hotelSlug (required): Hotel identifier
   * - checkInDate (required): YYYY-MM-DD format
   * - checkOutDate (required): YYYY-MM-DD format
   * - minPriceCents (optional): Minimum price filter
   * - maxPriceCents (optional): Maximum price filter
   * - guestCount (optional): Number of guests
   * 
   * @param c - Hono context
   * @returns Available room types with counts
   */
  static async getRoomAvailability(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();

        // Validate that at least one identifier is provided
        if (!query.hotelId && !query.hotelSlug) {
          return createLocalizedError(
            c,
            "errorCodes.validationError",
            "availability.hotelIdentifierRequired",
            HTTP_STATUS.BAD_REQUEST,
            { details: "Either hotelId or hotelSlug must be provided" }
          );
        }

        // Validate required date fields
        if (!query.checkInDate || !query.checkOutDate) {
          return createLocalizedError(
            c,
            "errorCodes.validationError",
            "availability.datesRequired",
            HTTP_STATUS.BAD_REQUEST,
            { details: "Check-in and check-out dates are required" }
          );
        }

        try {
          // Call service to get availability
          const availabilityData = await AvailabilityService.searchRoomAvailability(
            c.env.DB,
            query as any,
          );

          // Return success response with availability data
          return createLocalizedResponse(
            c,
            availabilityData,
            "availability.retrieved",
            HTTP_STATUS.OK,
          );
        } catch (error: any) {
          // Handle specific validation errors from service
          if (error.message?.includes("validation:")) {
            const errorDetail = error.message.replace("validation: ", "");
            return createLocalizedError(
              c,
              "errorCodes.validationError",
              "availability.validationFailed",
              HTTP_STATUS.BAD_REQUEST,
              { details: errorDetail }
            );
          }

          // Re-throw other errors to be handled by global error handler
          throw error;
        }
      },
      "availability.fetchFailed",
    );
  }

  /**
   * Legacy availability endpoint - kept for backward compatibility
   * @deprecated Use getRoomAvailability instead
   */
  static async getAvailability(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const results = await AvailabilityService.search(
          c.env.DB,
          query as any,
        );
        return ApiResponse.success(c, { results });
      },
      "operation.fetchAvailabilityFailed",
    );
  }
}
