import { OpenAPIHono } from "@hono/zod-openapi";

import { AvailabilityController } from "../controllers/availability.controller";
import { AvailabilityRouteDefinitions } from "../definitions/availability.definition";
import { smartAuthMiddleware } from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

/**
 * Availability routes
 * Handles room availability search endpoints
 */
const availabilityRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Apply smart authentication middleware (handles both public and protected routes)
availabilityRoutes.use("*", smartAuthMiddleware);

/**
 * Unified availability endpoint: GET /rooms/availability
 * Public endpoint - no authentication required
 *
 * Handles both specific room type and all room types searches
 * Returns room types with individual room details
 */
availabilityRoutes.openapi(
  AvailabilityRouteDefinitions.getRoomAvailability,
  (c) => AvailabilityController.getRoomAvailability(c as AppContext),
);

export default availabilityRoutes;
