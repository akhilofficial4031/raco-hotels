import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { TaxFeeController } from "../controllers/tax_fee.controller";
import { TaxFeeRouteDefinitions } from "../definitions/tax_fee.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const taxFeeRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

taxFeeRoutes.use("*", smartAuthMiddleware);

taxFeeRoutes.openapi(
  TaxFeeRouteDefinitions.getTaxFees,
  smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) =>
    TaxFeeController.getTaxFees(c as AppContext),
  ),
);

taxFeeRoutes.openapi(
  TaxFeeRouteDefinitions.getTaxFeeById,
  smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) =>
    TaxFeeController.getTaxFeeById(c as AppContext),
  ),
);

taxFeeRoutes.openapi(
  TaxFeeRouteDefinitions.createTaxFee,
  smartPermissionHandler(PERMISSIONS.HOTELS_CREATE, (c) =>
    TaxFeeController.createTaxFee(c as AppContext),
  ),
);

taxFeeRoutes.openapi(
  TaxFeeRouteDefinitions.updateTaxFee,
  smartPermissionHandler(PERMISSIONS.HOTELS_UPDATE, (c) =>
    TaxFeeController.updateTaxFee(c as AppContext),
  ),
);

taxFeeRoutes.openapi(
  TaxFeeRouteDefinitions.deleteTaxFee,
  smartPermissionHandler(PERMISSIONS.HOTELS_DELETE, (c) =>
    TaxFeeController.deleteTaxFee(c as AppContext),
  ),
);

export default taxFeeRoutes;
