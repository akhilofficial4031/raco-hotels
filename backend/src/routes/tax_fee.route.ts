import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { TaxFeeController } from "../controllers/tax_fee.controller";
import { TaxFeeRouteDefinitions } from "../definitions/tax_fee.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const taxFeeRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

taxFeeRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

taxFeeRoutes.openapi(TaxFeeRouteDefinitions.getTaxFees, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return TaxFeeController.getTaxFees(c as any);
});

taxFeeRoutes.openapi(TaxFeeRouteDefinitions.getTaxFeeById, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return TaxFeeController.getTaxFeeById(c as any);
});

taxFeeRoutes.openapi(TaxFeeRouteDefinitions.createTaxFee, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
  return TaxFeeController.createTaxFee(c as any);
});

taxFeeRoutes.openapi(TaxFeeRouteDefinitions.updateTaxFee, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return TaxFeeController.updateTaxFee(c as any);
});

taxFeeRoutes.openapi(TaxFeeRouteDefinitions.deleteTaxFee, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
  return TaxFeeController.deleteTaxFee(c as any);
});

export default taxFeeRoutes;
