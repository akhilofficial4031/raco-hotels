import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { AmenityController } from "../controllers/amenity.controller";
import { AmenityRouteDefinitions } from "../definitions/amenity.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const amenityRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

amenityRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

amenityRoutes.openapi(AmenityRouteDefinitions.getAmenities, async (c) => {
  await assertPermission(c, PERMISSIONS.AMENITIES_READ);
  return AmenityController.getAmenities(c as any);
});
amenityRoutes.openapi(AmenityRouteDefinitions.getAmenityById, async (c) => {
  await assertPermission(c, PERMISSIONS.AMENITIES_READ);
  return AmenityController.getAmenityById(c as any);
});
amenityRoutes.openapi(AmenityRouteDefinitions.createAmenity, async (c) => {
  await assertPermission(c, PERMISSIONS.AMENITIES_CREATE);
  return AmenityController.createAmenity(c as any);
});
amenityRoutes.openapi(AmenityRouteDefinitions.updateAmenity, async (c) => {
  await assertPermission(c, PERMISSIONS.AMENITIES_UPDATE);
  return AmenityController.updateAmenity(c as any);
});
amenityRoutes.openapi(AmenityRouteDefinitions.deleteAmenity, async (c) => {
  await assertPermission(c, PERMISSIONS.AMENITIES_DELETE);
  return AmenityController.deleteAmenity(c as any);
});

export default amenityRoutes;
