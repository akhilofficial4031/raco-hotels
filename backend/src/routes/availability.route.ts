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
 * Primary availability endpoint: GET /rooms/availability
 * Public endpoint - no authentication required
 *
 * Search for available room types by hotel ID or slug
 * Returns room types with availability counts
 */
availabilityRoutes.openapi(
  AvailabilityRouteDefinitions.getRoomAvailability,
  (c) => AvailabilityController.getRoomAvailability(c as AppContext),
);

/**
 * Legacy availability endpoint: GET /availability
 * @deprecated Use /rooms/availability instead
 * Kept for backward compatibility with existing clients
 */
availabilityRoutes.openapi(
  AvailabilityRouteDefinitions.getRoomsAvailability,
  (c) => AvailabilityController.getRoomAvailability(c as AppContext),
);

export default availabilityRoutes;
