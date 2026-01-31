import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  RequestCancellationOtpSchema,
  RequestCancellationOtpResponseSchema,
  VerifyCancellationOtpSchema,
  VerifyCancellationOtpResponseSchema,
} from "../schemas/booking_cancellation.schema";

export const BookingCancellationRouteDefinitions = {
  requestOtp: createRoute({
    method: "post",
    path: "/public/bookings/cancel/request-otp",
    summary: "Request booking cancellation OTP",
    description: `Request a 4-digit OTP to cancel a booking. The OTP will be sent to the customer's registered email address.

**Public API - No Authentication Required**

**Use Cases:**
- External applications initiating booking cancellation
- Customer portal self-service cancellation
- Third-party booking management systems

**Security:**
- Rate limited to 3 OTP requests per booking reference per 15 minutes
- OTP expires after 30 minutes
- OTP sent only to registered customer email
- One-time use only

**Validation:**
- Booking must exist
- Booking must not be already cancelled
- Booking must not be checked out

**Response:**
- Success: OTP sent to customer email with expiration time
- Error 404: Booking not found
- Error 400: Booking cannot be cancelled (already cancelled/completed)
- Error 429: Too many OTP requests (rate limit exceeded)
- Error 500: Email sending failed`,
    tags: [ApiTags.PUBLIC],
    requestSchema: RequestCancellationOtpSchema,
    successSchema: RequestCancellationOtpResponseSchema,
    successDescription: "OTP sent successfully to registered email",
    includeBadRequest: true,
    includeNotFound: true,
  }),

  verifyOtp: createRoute({
    method: "post",
    path: "/public/bookings/cancel/verify-otp",
    summary: "Verify OTP and cancel booking",
    description: `Verify the OTP code and cancel the booking if valid.

**Public API - No Authentication Required**

**Use Cases:**
- Complete booking cancellation after OTP verification
- External applications processing cancellation requests
- Customer portal self-service cancellation completion

**Security:**
- OTP must be valid and not expired
- OTP is deleted after successful verification (one-time use)
- Booking status is validated before cancellation

**Validation:**
- OTP must be exactly 4 digits
- OTP must match the one sent to customer email
- OTP must not be expired (30-minute validity)
- Booking must not be already cancelled

**Cancellation Process:**
- Booking status changed to "cancelled"
- OTP record deleted from database
- Cancellation reason recorded as "Customer requested cancellation via OTP"
- No automatic refund processing (refunds handled through admin interface)

**Response:**
- Success: Booking cancelled with updated status
- Error 400: Invalid or expired OTP
- Error 404: Booking not found
- Error 409: Booking already cancelled
- Error 500: Server error`,
    tags: [ApiTags.PUBLIC],
    requestSchema: VerifyCancellationOtpSchema,
    successSchema: VerifyCancellationOtpResponseSchema,
    successDescription: "Booking cancelled successfully",
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),
};
