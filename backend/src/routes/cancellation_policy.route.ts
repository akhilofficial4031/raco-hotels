import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { CancellationPolicyController } from "../controllers/cancellation_policy.controller";
import { CancellationPolicyRouteDefinitions } from "../definitions/cancellation_policy.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const cancellationPolicyRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

cancellationPolicyRoutes.use("*", smartAuthMiddleware());

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.getPolicies,
  smartPermissionHandler(PERMISSIONS.CANCELLATION_POLICIES_READ, (c) =>
    CancellationPolicyController.getPolicies(c as AppContext),
  ),
);

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.getPolicyById,
  smartPermissionHandler(PERMISSIONS.CANCELLATION_POLICIES_READ, (c) =>
    CancellationPolicyController.getPolicyById(c as AppContext),
  ),
);

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.createPolicy,
  smartPermissionHandler(PERMISSIONS.CANCELLATION_POLICIES_CREATE, (c) =>
    CancellationPolicyController.createPolicy(c as AppContext),
  ),
);

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.updatePolicy,
  smartPermissionHandler(PERMISSIONS.CANCELLATION_POLICIES_UPDATE, (c) =>
    CancellationPolicyController.updatePolicy(c as AppContext),
  ),
);

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.deletePolicy,
  smartPermissionHandler(PERMISSIONS.CANCELLATION_POLICIES_DELETE, (c) =>
    CancellationPolicyController.deletePolicy(c as AppContext),
  ),
);

export default cancellationPolicyRoutes;
