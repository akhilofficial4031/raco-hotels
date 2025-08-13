import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { CancellationPolicyController } from "../controllers/cancellation_policy.controller";
import { CancellationPolicyRouteDefinitions } from "../definitions/cancellation_policy.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const cancellationPolicyRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

cancellationPolicyRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.getPolicies,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_READ);
    return CancellationPolicyController.getPolicies(c as any);
  },
);

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.getPolicyById,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_READ);
    return CancellationPolicyController.getPolicyById(c as any);
  },
);

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.createPolicy,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
    return CancellationPolicyController.createPolicy(c as any);
  },
);

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.updatePolicy,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
    return CancellationPolicyController.updatePolicy(c as any);
  },
);

cancellationPolicyRoutes.openapi(
  CancellationPolicyRouteDefinitions.deletePolicy,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
    return CancellationPolicyController.deletePolicy(c as any);
  },
);

export default cancellationPolicyRoutes;
