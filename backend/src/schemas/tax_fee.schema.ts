import { z } from "zod";

// Money note: value for fixed amounts is in paise (INR cents). For example, 19900 = ₹199.00

export const TaxFeeSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "GST" }),
    type: z.enum(["percent", "fixed"]).openapi({ example: "percent" }),
    value: z.number().int().openapi({
      example: 1800,
      description: "percent 0..100 or paise for fixed",
    }),
    scope: z
      .enum(["per_stay", "per_night", "per_person"]) // keep open, schema is free text
      .openapi({ example: "per_night" }),
    includedInPrice: z.number().int().openapi({ example: 0 }),
    isActive: z.number().int().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("TaxFee");

export const CreateTaxFeeRequestSchema = z
  .object({
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().min(1).openapi({ example: "GST" }),
    type: z.enum(["percent", "fixed"]).openapi({ example: "percent" }),
    value: z.number().int().openapi({
      example: 1800,
      description: "percent 0..100 or paise for fixed",
    }),
    scope: z.string().openapi({ example: "per_night" }),
    includedInPrice: z.number().int().optional().openapi({ example: 0 }),
    isActive: z.number().int().optional().openapi({ example: 1 }),
  })
  .openapi("CreateTaxFeeRequest");

export const UpdateTaxFeeRequestSchema =
  CreateTaxFeeRequestSchema.partial().openapi("UpdateTaxFeeRequest");

export const TaxFeePathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Tax fee ID" }),
  })
  .openapi("TaxFeePathParams");

export const TaxFeeQueryParamsSchema = z
  .object({
    hotelId: z.string().optional().openapi({ example: "1" }),
    isActive: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : undefined))
      .openapi({ example: "1" }),
  })
  .openapi("TaxFeeQueryParams");

export const TaxFeeResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      taxFee: TaxFeeSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("TaxFeeResponse");

export const TaxFeesListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      taxFees: z.array(TaxFeeSchema),
      message: z.string().optional(),
    }),
  })
  .openapi("TaxFeesListResponse");
