import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { PaymentController } from "../controllers/payment.controller";
import { PaymentRouteDefinitions } from "../definitions/payment.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppVariables } from "../types";

const paymentRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

paymentRoutes.use("*", smartAuthMiddleware);

paymentRoutes.openapi(
  PaymentRouteDefinitions.listPayments,
  smartPermissionHandler(PERMISSIONS.PAYMENTS_READ, (c) =>
    PaymentController.listPayments(c as any),
  ),
);

export default paymentRoutes;
