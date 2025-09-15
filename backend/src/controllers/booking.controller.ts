import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { CreateBookingRequestSchema } from "../schemas/booking.schema";
import { BookingService } from "../services/booking.service";

import type { AppContext } from "../types";

export class BookingController {
  static async listBookings(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const queryParams = c.req.query();

        // Convert query parameters to the expected format
        const query = {
          page: parseInt(queryParams.page || "1", 10),
          limit: parseInt(queryParams.limit || "20", 10),
          sortBy:
            (queryParams.sortBy as
              | "created_at"
              | "check_in_date"
              | "total_amount_cents") || "created_at",
          sortOrder: (queryParams.sortOrder as "asc" | "desc") || "desc",
          hotelId: queryParams.hotelId
            ? parseInt(queryParams.hotelId, 10)
            : undefined,
          status: queryParams.status,
          query: queryParams.query,
          checkInDateStart: queryParams.checkInDateStart,
          checkInDateEnd: queryParams.checkInDateEnd,
          createdAtStart: queryParams.createdAtStart,
          createdAtEnd: queryParams.createdAtEnd,
        };

        const result = await BookingService.listBookings(c.env.DB, query);

        return ApiResponse.success(c, {
          ...result,
          message:
            result.bookings.length > 0
              ? "booking.retrieved"
              : "booking.notFound",
        });
      },
      "operation.fetchBookingsFailed",
    );
  }

  static async getBookingById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const bookingId = parseInt(id, 10);
        const booking = await BookingService.getBookingById(
          c.env.DB,
          bookingId,
        );

        if (!booking) {
          return ApiResponse.notFound(c, "booking.notFound");
        }

        return ApiResponse.success(c, {
          booking,
          message: "booking.retrieved",
        });
      },
      "operation.fetchBookingFailed",
    );
  }

  static async updateBooking(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const bookingId = parseInt(id, 10);
        const body = await c.req.json();

        // TODO: Add validation with a Zod schema
        const updatedBooking = await BookingService.updateBooking(
          c.env.DB,
          bookingId,
          body,
        );

        return ApiResponse.success(c, {
          booking: updatedBooking,
          message: "booking.updated",
        });
      },
      "operation.updateBookingFailed",
    );
  }

  static async checkinBooking(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const bookingId = parseInt(id, 10);
        await BookingService.checkinBooking(c.env.DB, bookingId);
        return ApiResponse.success(c, {
          booking: { id: bookingId, status: "checkedin" },
        });
      },
      "operation.checkinBookingFailed",
    );
  }

  static async cancelBooking(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const bookingId = parseInt(id, 10);
        await BookingService.cancelBooking(c.env.DB, bookingId);
        return ApiResponse.success(c, {
          booking: { id: bookingId, status: "cancelled" },
        });
      },
      "operation.cancelBookingFailed",
    );
  }

  static async checkoutBooking(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const bookingId = parseInt(id, 10);
        await BookingService.checkoutBooking(c.env.DB, bookingId);
        return ApiResponse.success(c, {
          booking: { id: bookingId, status: "checkedout" },
        });
      },
      "operation.checkoutBookingFailed",
    );
  }

  static async createBooking(c: AppContext) {
    try {
      const body = await c.req.json();
      const bookingRequest = CreateBookingRequestSchema.parse(body);
      const booking = await BookingService.createBooking(
        c.env.DB,
        bookingRequest,
      );
      return c.json({ success: true, data: { booking } });
    } catch (error) {
      console.error("Error in createBooking controller:", error);

      // Return the actual error details for debugging
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "operation.createBookingFailed",
            details: {
              errorMessage: (error as Error).message,
              errorStack: (error as Error).stack,
              errorType: (error as Error).constructor.name,
            },
          },
        },
        500,
      );
    }
  }
}
