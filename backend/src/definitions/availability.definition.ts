import { ApiTags, createPublicRoute } from "../lib/openapi";
import {
  RoomsAvailabilityQueryParamsSchema,
  RoomsAvailabilityResponseSchema,
} from "../schemas";

export const AvailabilityRouteDefinitions = {
  getRoomsAvailability: createPublicRoute({
    method: "get",
    path: "/rooms/availability",
    summary: "Search room availability",
    description:
      "Query room types available for a date range with optional filters like amenities and price.",
    tags: [ApiTags.ROOMS],
    successSchema: RoomsAvailabilityResponseSchema,
    successDescription: "Availability retrieved successfully",
    querySchema: RoomsAvailabilityQueryParamsSchema,
    includeBadRequest: true,
  }),
};
