import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { PromoCodeController } from "../controllers/promo_code.controller";
import { PromoCodeRouteDefinitions } from "../definitions/promo_code.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const promoCodeRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

promoCodeRoutes.use("*", smartAuthMiddleware);

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.getPromoCodes,
  smartPermissionHandler(PERMISSIONS.PROMO_CODES_READ, (c) =>
    PromoCodeController.getPromoCodes(c as AppContext),
  ),
);

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.getPromoCodeById,
  smartPermissionHandler(PERMISSIONS.PROMO_CODES_READ, (c) =>
    PromoCodeController.getPromoCodeById(c as AppContext),
  ),
);

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.createPromoCode,
  smartPermissionHandler(PERMISSIONS.PROMO_CODES_CREATE, (c) =>
    PromoCodeController.createPromoCode(c as AppContext),
  ),
);

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.updatePromoCode,
  smartPermissionHandler(PERMISSIONS.PROMO_CODES_UPDATE, (c) =>
    PromoCodeController.updatePromoCode(c as AppContext),
  ),
);

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.deletePromoCode,
  smartPermissionHandler(PERMISSIONS.PROMO_CODES_DELETE, (c) =>
    PromoCodeController.deletePromoCode(c as AppContext),
  ),
);

export default promoCodeRoutes;
