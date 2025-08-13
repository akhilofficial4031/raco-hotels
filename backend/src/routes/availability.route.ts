import { OpenAPIHono } from "@hono/zod-openapi";

import { AvailabilityController } from "../controllers/availability.controller";
import { AvailabilityRouteDefinitions } from "../definitions/availability.definition";
import { optionalAuthMiddleware } from "../middleware/auth";

import type { AppBindings, AppVariables } from "../types";

const availabilityRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Optional auth: availability is public but we associate session if present
availabilityRoutes.use("*", optionalAuthMiddleware);

availabilityRoutes.openapi(
  AvailabilityRouteDefinitions.getRoomsAvailability,
  (c) => AvailabilityController.getAvailability(c as any),
);

export default availabilityRoutes;
