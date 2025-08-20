import { BOOKING_SOURCES } from "../constants";
import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { BookingService } from "../services/booking.service";
import { BookingDraftService } from "../services/booking_draft.service";

import type { AppContext } from "../types";

export class BookingController {
  static async createDraft(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const user = c.get("user");
        // If guest sessionId present and user not logged in, save to draft table
        if (payload.sessionId && !user?.userId) {
          const draft = await BookingDraftService.upsertDraft(
            c.env.DB,
            payload,
          );
          return ApiResponse.created(c, {
            booking: { id: draft.id, referenceCode: draft.referenceCode },
          });
        }
        const draft = await BookingService.createDraft(
          c.env.DB,
          payload as any,
          user?.userId,
        );
        return ApiResponse.created(c, {
          booking: { id: draft.id, referenceCode: draft.referenceCode },
        });
      },
      "operation.createDraftFailed",
    );
  }

  static async convertDraft(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const user = c.get("user");
        if (!user || !user.userId) {
          return ApiResponse.unauthorized(c, "Authentication required");
        }
        const { sessionId, email } = await c.req.json();
        const booking = await BookingDraftService.convertToBooking(
          c.env.DB,
          { sessionId, email: email ?? user.email },
          user.userId,
        );
        return ApiResponse.success(c, {
          booking: { id: booking.id, status: "reserved" },
        });
      },
      "operation.convertDraftFailed",
    );
  }

  static async processPayment(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const bookingId = parseInt(id, 10);
        // Ideally check booking exists
        const payload = await c.req.json();
        await BookingService.processPayment(
          c.env.DB,
          bookingId,
          payload as any,
        );
        return ApiResponse.success(c, {
          booking: { id: bookingId, status: "paid" },
        });
      },
      "operation.processPaymentFailed",
    );
  }

  static async confirm(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const bookingId = parseInt(id, 10);
        await BookingService.confirm(c.env.DB, bookingId);
        return ApiResponse.success(c, {
          booking: { id: bookingId, status: "confirmed" },
        });
      },
      "operation.confirmBookingFailed",
    );
  }

  static async confirmFromDraft(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();

        // Get current user context if available
        const user = c.get("user");

        // If the request doesn't specify a userId but user is authenticated,
        // use the authenticated user's ID
        if (!payload.userId && user?.userId) {
          payload.userId = user.userId;
        }

        // Default source based on context if not provided
        if (!payload.source) {
          // If user is authenticated staff, assume front_office source
          // Otherwise default to web
          payload.source =
            user?.role === "staff" || user?.role === "admin"
              ? BOOKING_SOURCES.FRONT_OFFICE
              : BOOKING_SOURCES.WEB;
        }

        try {
          const confirmedBooking =
            await BookingService.confirmBookingFromDraftWithTransaction(
              c.env.DB,
              payload,
            );

          return ApiResponse.success(c, {
            booking: {
              id: confirmedBooking.id,
              referenceCode: confirmedBooking.referenceCode,
              status: confirmedBooking.status,
              checkInDate: confirmedBooking.checkInDate,
              checkOutDate: confirmedBooking.checkOutDate,
              totalAmountCents: confirmedBooking.totalAmountCents,
              currencyCode: confirmedBooking.currencyCode,
            },
            message: "booking.confirmed",
          });
        } catch (error: any) {
          // Handle specific booking errors
          if (error.message.startsWith("booking.")) {
            return ApiResponse.badRequest(c, error.message);
          }
          throw error;
        }
      },
      "operation.confirmBookingFailed",
    );
  }

  static async getPendingBookings(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        // Query parameters are already validated by the OpenAPI middleware
        const query = c.req.valid("query");

        const result = await BookingService.getPendingBookings(c.env.DB, query);

        return ApiResponse.success(c, {
          ...result,
          message:
            result.bookings.length > 0
              ? "booking.pendingRetrieved"
              : "booking.noPendingFound",
        });
      },
      "operation.fetchPendingBookingsFailed",
    );
  }
}
