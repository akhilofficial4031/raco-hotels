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
}
