import { z } from "zod";

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
    sessionId: z
      .string()
      .optional()
      .openapi({
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
    currencyCode: z.string().openapi({ example: "USD" }),
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
