import { z } from "zod";

import {
  BOOKING_SOURCES,
  PAYMENT_METHODS,
  PAYMENT_PROCESSORS,
} from "../constants";

export const CreateDraftBookingRequestSchema = z
  .object({
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    roomTypeId: z.number().int().positive().openapi({ example: 2 }),
    ratePlanId: z.number().int().positive().optional().openapi({ example: 1 }),
    checkInDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({ example: "2024-12-20" }),
    checkOutDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({ example: "2024-12-23" }),
    numAdults: z.number().int().min(1).openapi({ example: 2 }),
    numChildren: z.number().int().min(0).openapi({ example: 1 }),
    petsCount: z.number().int().min(0).optional().openapi({ example: 1 }),
    addOns: z
      .array(z.object({ code: z.string(), quantity: z.number().int().min(1) }))
      .optional(),
    promoCode: z.string().optional(),
    sessionId: z.string().optional().openapi({
      description: "Opaque ID to link guest sessions across login",
    }),
  })
  .openapi("CreateDraftBookingRequest");

export const BookingPathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Booking ID" }),
  })
  .openapi("BookingPathParams");

export const ProcessPaymentRequestSchema = z
  .object({
    amountCents: z.number().int().positive().openapi({ example: 36000 }),
    currencyCode: z.string().openapi({ example: "INR" }),
    method: z
      .enum(["card", "upi", "netbanking", "cash", "wallet"])
      .openapi({ example: "card" }),
    processor: z.string().openapi({ example: "manual" }),
    processorPaymentId: z.string().optional(),
  })
  .openapi("ProcessPaymentRequest");

export const ConfirmBookingRequestSchema = z
  .object({
    sendNotifications: z.boolean().optional().openapi({ example: true }),
  })
  .openapi("ConfirmBookingRequest");

export const ConfirmBookingFromDraftRequestSchema = z
  .object({
    sessionId: z.string().openapi({
      example: "guest_12345",
      description: "Session ID to identify the booking draft",
    }),
    contactEmail: z.string().email().openapi({
      example: "guest@example.com",
      description: "Guest contact email for confirmation",
    }),
    contactPhone: z.string().optional().openapi({
      example: "+1234567890",
      description: "Guest contact phone number",
    }),
    guestName: z.string().min(1).openapi({
      example: "John Doe",
      description: "Primary guest name",
    }),
    userId: z.number().int().positive().optional().openapi({
      example: 123,
      description: "User ID if the booking is for a registered user",
    }),
    source: z
      .enum([
        BOOKING_SOURCES.WEB,
        BOOKING_SOURCES.FRONT_OFFICE,
        BOOKING_SOURCES.PHONE,
        BOOKING_SOURCES.EMAIL,
        BOOKING_SOURCES.MOBILE_APP,
      ])
      .optional()
      .default(BOOKING_SOURCES.WEB)
      .openapi({
        example: BOOKING_SOURCES.WEB,
        description: "Source of the booking",
      }),
    isPrepaid: z.boolean().optional().default(false).openapi({
      example: false,
      description: "Whether the booking is prepaid",
    }),
    paymentMethod: z
      .enum([
        PAYMENT_METHODS.CARD,
        PAYMENT_METHODS.CASH,
        PAYMENT_METHODS.BANK_TRANSFER,
        PAYMENT_METHODS.UPI,
        PAYMENT_METHODS.NETBANKING,
        PAYMENT_METHODS.WALLET,
        PAYMENT_METHODS.PENDING,
      ])
      .optional()
      .default(PAYMENT_METHODS.PENDING)
      .openapi({
        example: PAYMENT_METHODS.CARD,
        description: "Payment method used for the booking",
      }),
    paymentProcessor: z
      .enum([
        PAYMENT_PROCESSORS.STRIPE,
        PAYMENT_PROCESSORS.RAZORPAY,
        PAYMENT_PROCESSORS.PAYPAL,
        PAYMENT_PROCESSORS.FRONT_OFFICE,
        PAYMENT_PROCESSORS.MANUAL,
      ])
      .optional()
      .default(PAYMENT_PROCESSORS.MANUAL)
      .openapi({
        example: PAYMENT_PROCESSORS.STRIPE,
        description:
          "Payment processor used (e.g., stripe, razorpay, manual, front_office)",
      }),
    sendNotifications: z.boolean().optional().default(true).openapi({
      example: true,
      description: "Whether to send confirmation notifications",
    }),
  })
  .openapi("ConfirmBookingFromDraftRequest");

export const BookingFeedbackRequestSchema = z
  .object({
    rating: z.number().int().min(1).max(5).openapi({ example: 5 }),
    title: z.string().optional(),
    comments: z.string().optional(),
  })
  .openapi("BookingFeedbackRequest");

export const DraftBookingResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      booking: z.object({ id: z.number().int(), referenceCode: z.string() }),
      message: z.string().optional(),
    }),
  })
  .openapi("DraftBookingResponse");

export const BookingResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      booking: z.object({ id: z.number().int(), status: z.string() }),
      message: z.string().optional(),
    }),
  })
  .openapi("BookingResponse");

export const BookingConfirmationResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      booking: z.object({
        id: z.number().int(),
        referenceCode: z.string(),
        status: z.string(),
        checkInDate: z.string(),
        checkOutDate: z.string(),
        totalAmountCents: z.number().int(),
        currencyCode: z.string(),
      }),
      message: z.string().optional(),
    }),
  })
  .openapi("BookingConfirmationResponse");

export const PendingBookingsQuerySchema = z
  .object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1))
      .optional()
      .default(1)
      .openapi({ example: "1", description: "Page number for pagination" }),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .optional()
      .default(20)
      .openapi({ example: "20", description: "Number of items per page" }),
    hotelId: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional()
      .openapi({ example: "1", description: "Filter by hotel ID" }),
    olderThan: z.string().optional().openapi({
      example: "2024-01-01",
      description: "Show drafts older than this date (YYYY-MM-DD)",
    }),
    checkInAfter: z.string().optional().openapi({
      example: "2024-01-01",
      description: "Show drafts with check-in after this date",
    }),
    checkInBefore: z.string().optional().openapi({
      example: "2024-12-31",
      description: "Show drafts with check-in before this date",
    }),
    sortBy: z
      .enum(["created_at", "check_in_date", "total_amount"])
      .optional()
      .default("created_at")
      .openapi({
        example: "created_at",
        description: "Sort by field",
      }),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc").openapi({
      example: "desc",
      description: "Sort order",
    }),
  })
  .openapi("PendingBookingsQuery");

export const PendingBookingItemSchema = z
  .object({
    id: z.number().int(),
    sessionId: z.string(),
    referenceCode: z.string(),
    hotelId: z.number().int(),
    hotelName: z.string().optional(),
    roomTypeId: z.number().int(),
    roomTypeName: z.string().optional(),
    checkInDate: z.string(),
    checkOutDate: z.string(),
    numAdults: z.number().int(),
    numChildren: z.number().int(),
    totalAmountCents: z.number().int(),
    currencyCode: z.string(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    promoCode: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    daysSinceCreated: z.number().int(),
    isExpiringSoon: z.boolean(),
  })
  .openapi("PendingBookingItem");

export const PendingBookingsResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      bookings: z.array(PendingBookingItemSchema),
      pagination: z.object({
        page: z.number().int(),
        limit: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      }),
      message: z.string().optional(),
    }),
  })
  .openapi("PendingBookingsResponse");
