import { BookingService } from "./booking.service";
import { BookingRepository } from "../repositories/booking.repository";
import { BookingCancellationOtpRepository } from "../repositories/booking_cancellation_otp.repository";
import { sendCancellationOtpEmail } from "../utils/mail";

import type { AppContext } from "../types";

const OTP_EXPIRY_MINUTES = 30;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_OTP_REQUESTS = 3;

export class BookingCancellationService {
  /**
   * Generate a 4-digit OTP code
   */
  private static generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Calculate OTP expiration time
   */
  private static getExpirationTime(): string {
    const expiryDate = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    return expiryDate.toISOString();
  }

  /**
   * Request cancellation OTP - generates and sends OTP to customer email
   */
  static async requestCancellationOtp(
    db: D1Database,
    context: AppContext,
    bookingReference: string,
  ): Promise<{ message: string; expiresInMinutes: number }> {
    // Find booking by reference code
    const booking = await BookingRepository.findByReferenceCode(
      db,
      bookingReference,
    );

    if (!booking) {
      const error = new Error("Booking not found");
      (error as any).statusCode = 404;
      (error as any).code = "BOOKING_NOT_FOUND";
      throw error;
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      const error = new Error("Booking is already cancelled");
      (error as any).statusCode = 400;
      (error as any).code = "BOOKING_ALREADY_CANCELLED";
      throw error;
    }

    if (booking.status === "checkedout") {
      const error = new Error(
        "Cannot cancel a booking that has already been checked out",
      );
      (error as any).statusCode = 400;
      (error as any).code = "BOOKING_ALREADY_COMPLETED";
      throw error;
    }

    // Check rate limiting - max 3 OTP requests per 15 minutes
    const recentOtpCount =
      await BookingCancellationOtpRepository.countRecentOtps(
        db,
        bookingReference,
        RATE_LIMIT_WINDOW_MINUTES,
      );

    if (recentOtpCount >= MAX_OTP_REQUESTS) {
      const error = new Error(
        `Too many OTP requests. Please try again after ${RATE_LIMIT_WINDOW_MINUTES} minutes.`,
      );
      (error as any).statusCode = 429;
      (error as any).code = "RATE_LIMIT_EXCEEDED";
      throw error;
    }

    // Get customer email
    const customerEmail = booking.customer?.email;
    if (!customerEmail) {
      const error = new Error("Customer email not found for this booking");
      (error as any).statusCode = 400;
      (error as any).code = "CUSTOMER_EMAIL_NOT_FOUND";
      throw error;
    }

    // Generate OTP
    const otpCode = this.generateOtp();
    const expiresAt = this.getExpirationTime();

    // Store OTP in database
    await BookingCancellationOtpRepository.create(db, {
      bookingId: booking.id,
      bookingReference: booking.referenceCode,
      otpCode,
      customerEmail,
      expiresAt,
    });

    // Send OTP via email
    try {
      await sendCancellationOtpEmail(
        context,
        customerEmail,
        booking.customer?.fullName || "Customer",
        booking.referenceCode,
        otpCode,
      );
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      const error = new Error(
        "Failed to send OTP email. Please try again later.",
      );
      (error as any).statusCode = 500;
      (error as any).code = "EMAIL_SEND_FAILED";
      throw error;
    }

    return {
      message: "OTP sent to registered email",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    };
  }

  /**
   * Verify OTP and cancel booking
   */
  static async verifyCancellationOtp(
    db: D1Database,
    context: AppContext,
    bookingReference: string,
    otpCode: string,
  ): Promise<{
    booking: { id: number; referenceCode: string; status: string };
  }> {
    // Find and validate OTP
    const otpRecord = await BookingCancellationOtpRepository.findValidOtp(
      db,
      bookingReference,
      otpCode,
    );

    if (!otpRecord) {
      const error = new Error("Invalid or expired OTP");
      (error as any).statusCode = 400;
      (error as any).code = "INVALID_OTP";
      throw error;
    }

    // Get booking details
    const booking = await BookingRepository.findById(db, otpRecord.bookingId);

    if (!booking) {
      const error = new Error("Booking not found");
      (error as any).statusCode = 404;
      (error as any).code = "BOOKING_NOT_FOUND";
      throw error;
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      // Delete the OTP since it's no longer needed
      await BookingCancellationOtpRepository.deleteByBookingId(db, booking.id);

      const error = new Error("Booking is already cancelled");
      (error as any).statusCode = 409;
      (error as any).code = "BOOKING_ALREADY_CANCELLED";
      throw error;
    }

    // Check if booking has payment - if yes, set to pending_cancellation for admin review
    const hasPayment = booking.amountPaidCents && booking.amountPaidCents > 0;

    if (hasPayment) {
      // Set status to pending_cancellation and store cancellation reason
      await BookingRepository.update(db, booking.id, {
        status: "pending_cancellation" as any,
        notes: booking.notes
          ? `${booking.notes}\n\nCustomer requested cancellation via OTP`
          : "Customer requested cancellation via OTP",
      });

      // Delete the used OTP
      await BookingCancellationOtpRepository.deleteByBookingId(db, booking.id);

      return {
        booking: {
          id: booking.id,
          referenceCode: booking.referenceCode,
          status: "pending_cancellation",
        },
      };
    } else {
      // No payment, cancel immediately without refund
      await BookingService.cancelBooking(
        db,
        booking.id,
        undefined, // No refund amount
        "Customer requested cancellation via OTP", // Cancellation reason
        context,
      );

      // Delete the used OTP
      await BookingCancellationOtpRepository.deleteByBookingId(db, booking.id);

      return {
        booking: {
          id: booking.id,
          referenceCode: booking.referenceCode,
          status: "cancelled",
        },
      };
    }
  }
}
