import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { FeatureController } from "../controllers/feature.controller";
import { FeatureRouteDefinitions } from "../definitions/feature.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const featureRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

featureRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

featureRoutes.openapi(FeatureRouteDefinitions.getFeatures, async (c) => {
  await assertPermission(c, PERMISSIONS.FEATURES_READ);
  return FeatureController.getFeatures(c as any);
});
featureRoutes.openapi(FeatureRouteDefinitions.getFeatureById, async (c) => {
  await assertPermission(c, PERMISSIONS.FEATURES_READ);
  return FeatureController.getFeatureById(c as any);
});
featureRoutes.openapi(FeatureRouteDefinitions.createFeature, async (c) => {
  await assertPermission(c, PERMISSIONS.FEATURES_CREATE);
  return FeatureController.createFeature(c as any);
});
featureRoutes.openapi(FeatureRouteDefinitions.updateFeature, async (c) => {
  await assertPermission(c, PERMISSIONS.FEATURES_UPDATE);
  return FeatureController.updateFeature(c as any);
});
featureRoutes.openapi(FeatureRouteDefinitions.deleteFeature, async (c) => {
  await assertPermission(c, PERMISSIONS.FEATURES_DELETE);
  return FeatureController.deleteFeature(c as any);
});

export default featureRoutes;
