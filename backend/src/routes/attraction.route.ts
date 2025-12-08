import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { AttractionController } from "../controllers/attraction.controller";
import { AttractionRouteDefinitions } from "../definitions/attraction.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppVariables, AppContext } from "../types";

const attractionRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Use smartAuthMiddleware to automatically handle public/protected routes
attractionRoutes.use("*", smartAuthMiddleware);

// All route handlers now use smartPermissionHandler for automatic permission checking
attractionRoutes.openapi(
  AttractionRouteDefinitions.getAttractions,
  smartPermissionHandler(PERMISSIONS.CONTENT_READ, (c) =>
    AttractionController.getAttractions(c as AppContext),
  ),
);

attractionRoutes.openapi(
  AttractionRouteDefinitions.getAttractionById,
  smartPermissionHandler(PERMISSIONS.CONTENT_READ, (c) =>
    AttractionController.getAttractionById(c as AppContext),
  ),
);

attractionRoutes.openapi(
  AttractionRouteDefinitions.getAttractionBySlug,
  smartPermissionHandler(PERMISSIONS.CONTENT_READ, (c) =>
    AttractionController.getAttractionBySlug(c as AppContext),
  ),
);

attractionRoutes.openapi(
  AttractionRouteDefinitions.createAttraction,
  smartPermissionHandler(PERMISSIONS.CONTENT_CREATE, (c) =>
    AttractionController.createAttraction(c as AppContext),
  ),
);

attractionRoutes.openapi(
  AttractionRouteDefinitions.updateAttraction,
  smartPermissionHandler(PERMISSIONS.CONTENT_UPDATE, (c) =>
    AttractionController.updateAttraction(c as AppContext),
  ),
);

attractionRoutes.openapi(
  AttractionRouteDefinitions.deleteAttraction,
  smartPermissionHandler(PERMISSIONS.CONTENT_DELETE, (c) =>
    AttractionController.deleteAttraction(c as AppContext),
  ),
);

export default attractionRoutes;
