import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { ReviewController } from "../controllers/review.controller";
import { ReviewRouteDefinitions } from "../definitions/review.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const reviewRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

reviewRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

reviewRoutes.openapi(ReviewRouteDefinitions.getReviews, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return ReviewController.getReviews(c as any);
});

reviewRoutes.openapi(ReviewRouteDefinitions.getReviewById, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return ReviewController.getReviewById(c as any);
});

reviewRoutes.openapi(ReviewRouteDefinitions.createReview, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
  return ReviewController.createReview(c as any);
});

reviewRoutes.openapi(ReviewRouteDefinitions.updateReview, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return ReviewController.updateReview(c as any);
});

reviewRoutes.openapi(ReviewRouteDefinitions.deleteReview, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
  return ReviewController.deleteReview(c as any);
});

export default reviewRoutes;
