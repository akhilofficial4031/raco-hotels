import { z } from "zod";

export const PaymentSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    bookingId: z.number().int().positive().openapi({ example: 42 }),
    bookingReferenceCode: z
      .string()
      .nullable()
      .openapi({ example: "BK-001234" }),
    amountCents: z.number().int().openapi({ example: 500000 }),
    currencyCode: z.string().openapi({ example: "INR" }),
    status: z.string().openapi({ example: "succeeded" }),
    method: z.string().openapi({ example: "card" }),
    processor: z.string().openapi({ example: "razorpay" }),
    processorPaymentId: z
      .string()
      .nullable()
      .openapi({ example: "pay_AbCdEfGhIj1234" }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("Payment");

export const PaymentQueryParamsSchema = z
  .object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    search: z.string().optional(),
    status: z.string().optional(),
  })
  .openapi("PaymentQueryParams");

export const PaymentListResponseSchema = z
  .object({
    payments: z.array(PaymentSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
  .openapi("PaymentListResponse");

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentQueryParams = z.infer<typeof PaymentQueryParamsSchema>;
export type PaymentListResponse = z.infer<typeof PaymentListResponseSchema>;
