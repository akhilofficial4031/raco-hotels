import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { FeatureController } from "../controllers/feature.controller";
import { FeatureRouteDefinitions } from "../definitions/feature.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const featureRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

featureRoutes.use("*", smartAuthMiddleware());

featureRoutes.openapi(
  FeatureRouteDefinitions.getFeatures,
  smartPermissionHandler(PERMISSIONS.FEATURES_READ, (c) =>
    FeatureController.getFeatures(c as AppContext),
  ),
);
featureRoutes.openapi(
  FeatureRouteDefinitions.getFeatureById,
  smartPermissionHandler(PERMISSIONS.FEATURES_READ, (c) =>
    FeatureController.getFeatureById(c as AppContext),
  ),
);
featureRoutes.openapi(
  FeatureRouteDefinitions.createFeature,
  smartPermissionHandler(PERMISSIONS.FEATURES_CREATE, (c) =>
    FeatureController.createFeature(c as AppContext),
  ),
);
featureRoutes.openapi(
  FeatureRouteDefinitions.updateFeature,
  smartPermissionHandler(PERMISSIONS.FEATURES_UPDATE, (c) =>
    FeatureController.updateFeature(c as AppContext),
  ),
);
featureRoutes.openapi(
  FeatureRouteDefinitions.deleteFeature,
  smartPermissionHandler(PERMISSIONS.FEATURES_DELETE, (c) =>
    FeatureController.deleteFeature(c as AppContext),
  ),
);

export default featureRoutes;
