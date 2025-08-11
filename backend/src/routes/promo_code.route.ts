import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { PromoCodeController } from "../controllers/promo_code.controller";
import { PromoCodeRouteDefinitions } from "../definitions/promo_code.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const promoCodeRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

promoCodeRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

promoCodeRoutes.openapi(PromoCodeRouteDefinitions.getPromoCodes, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return PromoCodeController.getPromoCodes(c as any);
});

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.getPromoCodeById,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_READ);
    return PromoCodeController.getPromoCodeById(c as any);
  },
);

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.createPromoCode,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
    return PromoCodeController.createPromoCode(c as any);
  },
);

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.updatePromoCode,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
    return PromoCodeController.updatePromoCode(c as any);
  },
);

promoCodeRoutes.openapi(
  PromoCodeRouteDefinitions.deletePromoCode,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
    return PromoCodeController.deletePromoCode(c as any);
  },
);

export default promoCodeRoutes;
