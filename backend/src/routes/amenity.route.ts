import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { AmenityController } from "../controllers/amenity.controller";
import { AmenityRouteDefinitions } from "../definitions/amenity.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const amenityRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

amenityRoutes.use("*", smartAuthMiddleware());

amenityRoutes.openapi(
  AmenityRouteDefinitions.getAmenities,
  smartPermissionHandler(PERMISSIONS.AMENITIES_READ, (c) =>
    AmenityController.getAmenities(c as AppContext),
  ),
);

amenityRoutes.openapi(
  AmenityRouteDefinitions.getAmenityById,
  smartPermissionHandler(PERMISSIONS.AMENITIES_READ, (c) =>
    AmenityController.getAmenityById(c as AppContext),
  ),
);

amenityRoutes.openapi(
  AmenityRouteDefinitions.createAmenity,
  smartPermissionHandler(PERMISSIONS.AMENITIES_CREATE, (c) =>
    AmenityController.createAmenity(c as AppContext),
  ),
);

amenityRoutes.openapi(
  AmenityRouteDefinitions.updateAmenity,
  smartPermissionHandler(PERMISSIONS.AMENITIES_UPDATE, (c) =>
    AmenityController.updateAmenity(c as AppContext),
  ),
);

amenityRoutes.openapi(
  AmenityRouteDefinitions.deleteAmenity,
  smartPermissionHandler(PERMISSIONS.AMENITIES_DELETE, (c) =>
    AmenityController.deleteAmenity(c as AppContext),
  ),
);

export default amenityRoutes;
