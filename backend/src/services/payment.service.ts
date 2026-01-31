import Razorpay from "razorpay";

import { PaymentRepository } from "../repositories/payment.repository";
import { RefundRepository } from "../repositories/refund.repository";

import type {
  ProcessRefundRequest,
  ProcessRefundResult,
  RazorpayRefundResponse,
} from "../types/payment.types";
import type { AppContext } from "../types";

export class PaymentService {
  /**
   * Initialize Razorpay instance with credentials from environment
   */
  private static initializeRazorpay(context: AppContext): Razorpay {
    const keyId = context.env.RAZORPAY_KEY_ID;
    const keySecret = context.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      );
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Process refund via Razorpay
   */
  static async processRefund(
    db: D1Database,
    context: AppContext,
    request: ProcessRefundRequest,
  ): Promise<ProcessRefundResult> {
    const { paymentId, amountCents, notes, reason } = request;

    // Validate input parameters
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new Error("Invalid refund amount");
    }

    if (amountCents > Number.MAX_SAFE_INTEGER) {
      throw new Error("Refund amount exceeds maximum allowed value");
    }

    // Fetch payment details
    const payment = await PaymentRepository.findById(db, paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Validate payment status
    if (payment.status !== "succeeded" && payment.status !== "paid") {
      throw new Error(
        `Cannot refund payment with status: ${payment.status}. Only succeeded/paid payments can be refunded.`,
      );
    }

    // Validate payment processor
    if (payment.processor !== "razorpay") {
      throw new Error(
        `Cannot process refund for payment processor: ${payment.processor}. Only Razorpay payments are supported.`,
      );
    }

    // Validate processor payment ID exists
    if (!payment.processorPaymentId) {
      throw new Error("Payment does not have a Razorpay payment ID");
    }

    // Validate refund amount doesn't exceed payment amount
    if (amountCents > payment.amountCents) {
      throw new Error(
        `Refund amount cannot exceed payment amount`,
      );
    }

    // Check existing refunds to prevent double refunding
    const existingRefunds = await RefundRepository.findByPaymentId(
      db,
      paymentId,
    );
    const totalRefunded = existingRefunds.reduce(
      (sum, refund) =>
        refund.status === "succeeded" || refund.status === "pending"
          ? sum + refund.amountCents
          : sum,
      0,
    );

    if (totalRefunded + amountCents > payment.amountCents) {
      throw new Error(
        `Total refund amount would exceed payment amount`,
      );
    }

    // Initialize Razorpay
    const razorpay = this.initializeRazorpay(context);

    // Sanitize and prepare refund notes (prevent injection attacks)
    const sanitizedNotes: Record<string, string> = {};
    if (notes) {
      Object.keys(notes).forEach((key) => {
        // Only allow alphanumeric keys, limit length
        const sanitizedKey = key.substring(0, 50).replace(/[^a-zA-Z0-9_]/g, "_");
        const sanitizedValue = String(notes[key]).substring(0, 200);
        sanitizedNotes[sanitizedKey] = sanitizedValue;
      });
    }

    const refundNotes = {
      ...sanitizedNotes,
      reason: reason ? String(reason).substring(0, 200) : "Booking cancellation",
      refund_requested_at: new Date().toISOString(),
    };

    // Create refund via Razorpay API
    let razorpayRefund: RazorpayRefundResponse;
    try {
      razorpayRefund = (await razorpay.payments.refund(
        payment.processorPaymentId,
        {
          amount: amountCents,
          speed: "normal",
          notes: refundNotes,
        },
      )) as RazorpayRefundResponse;
    } catch (error: any) {
      console.error("Razorpay refund API error:", error);
      // Don't expose internal Razorpay error details to client
      throw new Error(
        `Failed to create refund via Razorpay. Please try again or contact support.`,
      );
    }

    // Create refund record in database
    const refund = await RefundRepository.create(db, {
      paymentId: payment.id,
      amountCents,
      status: razorpayRefund.status || "pending",
      processorRefundId: razorpayRefund.id,
    });

    // Update payment status if fully refunded
    const newTotalRefunded = totalRefunded + amountCents;
    if (newTotalRefunded >= payment.amountCents) {
      await PaymentRepository.updateStatus(db, payment.id, "refunded");
    }

    return {
      refund,
      razorpayRefund,
      success: true,
    };
  }

  /**
   * Get payment details by booking ID
   */
  static async getPaymentsByBookingId(db: D1Database, bookingId: number) {
    return await PaymentRepository.findByBookingId(db, bookingId);
  }
}
