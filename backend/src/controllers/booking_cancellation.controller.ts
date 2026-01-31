import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import {
  RequestCancellationOtpSchema,
  VerifyCancellationOtpSchema,
} from "../schemas/booking_cancellation.schema";
import { BookingCancellationService } from "../services/booking_cancellation.service";

import type { AppContext } from "../types";

export class BookingCancellationController {
  /**
   * Request cancellation OTP
   * POST /api/public/bookings/cancel/request-otp
   */
  static async requestCancellationOtp(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const body = await c.req.json();
        const { bookingReference } = RequestCancellationOtpSchema.parse(body);

        const result = await BookingCancellationService.requestCancellationOtp(
          c.env.DB,
          c,
          bookingReference,
        );

        return ApiResponse.success(c, result);
      },
      "operation.requestOtpFailed",
    );
  }

  /**
   * Verify OTP and cancel booking
   * POST /api/public/bookings/cancel/verify-otp
   */
  static async verifyCancellationOtp(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const body = await c.req.json();
        const { bookingReference, otp } =
          VerifyCancellationOtpSchema.parse(body);

        const result = await BookingCancellationService.verifyCancellationOtp(
          c.env.DB,
          c,
          bookingReference,
          otp,
        );

        return ApiResponse.success(c, {
          ...result,
          message: "Booking cancelled successfully",
        });
      },
      "operation.verifyOtpFailed",
    );
  }
}
