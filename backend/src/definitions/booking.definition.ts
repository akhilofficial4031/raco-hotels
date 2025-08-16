import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  CreateDraftBookingRequestSchema,
  DraftBookingResponseSchema,
  BookingPathParamsSchema,
  ProcessPaymentRequestSchema,
  BookingResponseSchema,
  ConfirmBookingRequestSchema,
  ConfirmBookingFromDraftRequestSchema,
  BookingConfirmationResponseSchema,
  BookingFeedbackRequestSchema,
  PendingBookingsQuerySchema,
  PendingBookingsResponseSchema,
} from "../schemas";

export const BookingRouteDefinitions = {
  createDraft: createRoute({
    method: "post",
    path: "/booking/draft",
    summary: "Create draft booking",
    description: "Start a booking for guest or logged-in user",
    tags: [ApiTags.BOOKINGS],
    successSchema: DraftBookingResponseSchema,
    successDescription: "Draft booking created",
    requestSchema: CreateDraftBookingRequestSchema,
    includeBadRequest: true,
  }),

  processPayment: createRoute({
    method: "post",
    path: "/booking/{id}/payment",
    summary: "Process payment (mock)",
    description: "Charge payment and mark as paid",
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingResponseSchema,
    successDescription: "Payment processed",
    paramsSchema: BookingPathParamsSchema,
    requestSchema: ProcessPaymentRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),

  confirm: createRoute({
    method: "post",
    path: "/booking/{id}/confirm",
    summary: "Confirm booking",
    description: "Mark booking as confirmed and dispatch notifications",
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingResponseSchema,
    successDescription: "Booking confirmed",
    paramsSchema: BookingPathParamsSchema,
    requestSchema: ConfirmBookingRequestSchema,
    includeNotFound: true,
  }),

  feedback: createRoute({
    method: "post",
    path: "/booking/{id}/feedback",
    summary: "Submit feedback",
    description: "Submit post-stay rating and comments",
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingResponseSchema,
    successDescription: "Feedback submitted",
    paramsSchema: BookingPathParamsSchema,
    requestSchema: BookingFeedbackRequestSchema,
    includeNotFound: true,
  }),

  convertDraft: createRoute({
    method: "post",
    path: "/booking/convert-draft",
    summary: "Convert guest draft to booking",
    description:
      "After signup/login, convert session draft to a booking owned by user",
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingResponseSchema,
    successDescription: "Draft converted",
    includeBadRequest: true,
  }),

  confirmFromDraft: createRoute({
    method: "post",
    path: "/booking/confirm-from-draft",
    summary: "Confirm booking from draft",
    description:
      "Confirm booking from guest session draft with full validation and inventory management",
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingConfirmationResponseSchema,
    successDescription: "Booking confirmed from draft",
    requestSchema: ConfirmBookingFromDraftRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),

  getPendingBookings: createRoute({
    method: "get",
    path: "/booking/pending",
    summary: "Get pending booking drafts",
    description:
      "Retrieve pending booking drafts for admin follow-up and abandoned cart recovery",
    tags: [ApiTags.BOOKINGS],
    successSchema: PendingBookingsResponseSchema,
    successDescription: "Pending bookings retrieved successfully",
    querySchema: PendingBookingsQuerySchema,
    includeBadRequest: true,
  }),
};
