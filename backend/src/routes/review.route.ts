import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { ReviewController } from "../controllers/review.controller";
import { ReviewRouteDefinitions } from "../definitions/review.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const reviewRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

reviewRoutes.use("*", smartAuthMiddleware);

reviewRoutes.openapi(
  ReviewRouteDefinitions.getReviews,
  smartPermissionHandler(PERMISSIONS.REVIEWS_READ, (c) =>
    ReviewController.getReviews(c as AppContext),
  ),
);

reviewRoutes.openapi(
  ReviewRouteDefinitions.getReviewById,
  smartPermissionHandler(PERMISSIONS.REVIEWS_READ, (c) =>
    ReviewController.getReviewById(c as AppContext),
  ),
);

reviewRoutes.openapi(
  ReviewRouteDefinitions.createReview,
  smartPermissionHandler(PERMISSIONS.REVIEWS_CREATE, (c) =>
    ReviewController.createReview(c as AppContext),
  ),
);

reviewRoutes.openapi(
  ReviewRouteDefinitions.updateReview,
  smartPermissionHandler(PERMISSIONS.REVIEWS_UPDATE, (c) =>
    ReviewController.updateReview(c as AppContext),
  ),
);

reviewRoutes.openapi(
  ReviewRouteDefinitions.deleteReview,
  smartPermissionHandler(PERMISSIONS.REVIEWS_DELETE, (c) =>
    ReviewController.deleteReview(c as AppContext),
  ),
);

export default reviewRoutes;
