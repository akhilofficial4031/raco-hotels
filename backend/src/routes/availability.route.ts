import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { AvailabilityController } from "../controllers/availability.controller";
import { AvailabilityRouteDefinitions } from "../definitions/availability.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const availabilityRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

availabilityRoutes.use("*", smartAuthMiddleware());

availabilityRoutes.openapi(
  AvailabilityRouteDefinitions.getRoomsAvailability,
  smartPermissionHandler(PERMISSIONS.AVAILABILITY_READ, (c) =>
    AvailabilityController.getAvailability(c as AppContext),
  ),
);

export default availabilityRoutes;
