import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { BookingController } from "../controllers/booking.controller";
import { BookingRouteDefinitions } from "../definitions/booking.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const bookingRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

bookingRoutes.use("*", smartAuthMiddleware());

bookingRoutes.openapi(
  BookingRouteDefinitions.createDraft,
  smartPermissionHandler(PERMISSIONS.BOOKINGS_CREATE, (c) =>
    BookingController.createDraft(c as AppContext),
  ),
);

bookingRoutes.openapi(
  BookingRouteDefinitions.processPayment,
  smartPermissionHandler(PERMISSIONS.BOOKINGS_UPDATE, (c) =>
    BookingController.processPayment(c as AppContext),
  ),
);

bookingRoutes.openapi(
  BookingRouteDefinitions.confirm,
  smartPermissionHandler(PERMISSIONS.BOOKINGS_UPDATE, (c) =>
    BookingController.confirm(c as AppContext),
  ),
);

// Feedback reuses bookings_update for simplicity; could be separate permission
bookingRoutes.openapi(
  BookingRouteDefinitions.feedback,
  smartPermissionHandler(PERMISSIONS.BOOKINGS_UPDATE, (c) =>
    BookingController.confirm(c as AppContext),
  ),
);

bookingRoutes.openapi(
  BookingRouteDefinitions.convertDraft,
  smartPermissionHandler(PERMISSIONS.BOOKINGS_CREATE, (c) =>
    BookingController.convertDraft(c as AppContext),
  ),
);

export default bookingRoutes;
