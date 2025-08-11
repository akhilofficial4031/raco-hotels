import { z } from "zod";

// Money note: value/minAmount/maxDiscount are in paise (INR cents). For example, 2500 = ₹25.00

export const PromoCodeSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    code: z.string().openapi({ example: "SUMMER25" }),
    type: z.enum(["percent", "fixed"]).openapi({ example: "fixed" }),
    value: z.number().int().openapi({ example: 2500 }),
    startDate: z.string().nullable().openapi({ example: "2024-07-01" }),
    endDate: z.string().nullable().openapi({ example: "2024-07-31" }),
    minNights: z.number().int().nullable().openapi({ example: 2 }),
    minAmountCents: z.number().int().nullable().openapi({ example: 100000 }),
    maxDiscountCents: z.number().int().nullable().openapi({ example: 50000 }),
    usageLimit: z.number().int().nullable().openapi({ example: 100 }),
    usageCount: z.number().int().openapi({ example: 10 }),
    isActive: z.number().int().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("PromoCode");

export const CreatePromoCodeRequestSchema = z
  .object({
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    code: z.string().min(1).openapi({ example: "SUMMER25" }),
    type: z.enum(["percent", "fixed"]).openapi({ example: "fixed" }),
    value: z.number().int().openapi({ example: 2500 }),
    startDate: z.string().optional().openapi({ example: "2024-07-01" }),
    endDate: z.string().optional().openapi({ example: "2024-07-31" }),
    minNights: z.number().int().optional().openapi({ example: 2 }),
    minAmountCents: z.number().int().optional().openapi({ example: 100000 }),
    maxDiscountCents: z.number().int().optional().openapi({ example: 50000 }),
    usageLimit: z.number().int().optional().openapi({ example: 100 }),
    isActive: z.number().int().optional().openapi({ example: 1 }),
  })
  .openapi("CreatePromoCodeRequest");

export const UpdatePromoCodeRequestSchema =
  CreatePromoCodeRequestSchema.partial().openapi("UpdatePromoCodeRequest");

export const PromoCodePathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Promo code ID" }),
  })
  .openapi("PromoCodePathParams");

export const PromoCodeQueryParamsSchema = z
  .object({
    hotelId: z.string().optional().openapi({ example: "1" }),
    isActive: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : undefined))
      .openapi({ example: "1" }),
    code: z.string().optional().openapi({ example: "SUMMER25" }),
  })
  .openapi("PromoCodeQueryParams");

export const PromoCodeResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      promoCode: PromoCodeSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("PromoCodeResponse");

export const PromoCodesListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      promoCodes: z.array(PromoCodeSchema),
      message: z.string().optional(),
    }),
  })
  .openapi("PromoCodesListResponse");
