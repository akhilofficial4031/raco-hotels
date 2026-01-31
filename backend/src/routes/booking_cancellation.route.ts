import { OpenAPIHono } from "@hono/zod-openapi";

import { BookingCancellationController } from "../controllers/booking_cancellation.controller";
import { BookingCancellationRouteDefinitions } from "../definitions/booking_cancellation.definition";

import type { AppBindings, AppContext, AppVariables } from "../types";

const bookingCancellationRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Public endpoints - no authentication required
// These routes are intentionally not wrapped with authentication middleware
// Security is handled through OTP verification sent to customer email

/**
 * Request cancellation OTP
 * POST /api/public/bookings/cancel/request-otp
 */
bookingCancellationRoutes.openapi(
  BookingCancellationRouteDefinitions.requestOtp,
  (c) => BookingCancellationController.requestCancellationOtp(c as AppContext),
);

/**
 * Verify OTP and cancel booking
 * POST /api/public/bookings/cancel/verify-otp
 */
bookingCancellationRoutes.openapi(
  BookingCancellationRouteDefinitions.verifyOtp,
  (c) => BookingCancellationController.verifyCancellationOtp(c as AppContext),
);

export default bookingCancellationRoutes;
