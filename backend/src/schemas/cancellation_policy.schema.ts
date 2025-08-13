import z from "zod";

export const CancellationPolicySchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Flexible" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Free cancellation up to 24h" }),
    freeCancelUntilHours: z.number().int().nullable().openapi({ example: 24 }),
    penaltyType: z
      .enum(["percentage", "fixed"]) // underlying DB is text; constrain via schema
      .nullable()
      .openapi({ example: "percentage" }),
    penaltyValue: z.number().int().nullable().openapi({ example: 50 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("CancellationPolicy");

export const CreateCancellationPolicyRequestSchema = z
  .object({
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Flexible" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Free cancellation up to 24h" })
      .optional(),
    freeCancelUntilHours: z
      .number()
      .int()
      .nullable()
      .openapi({ example: 24 })
      .optional(),
    penaltyType: z.enum(["percentage", "fixed"]).nullable().optional(),
    penaltyValue: z.number().int().nullable().optional(),
  })
  .openapi("CreateCancellationPolicyRequest");

export const UpdateCancellationPolicyRequestSchema = z
  .object({
    name: z.string().openapi({ example: "Flexible" }).optional(),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Free cancellation up to 24h" })
      .optional(),
    freeCancelUntilHours: z
      .number()
      .int()
      .nullable()
      .openapi({ example: 24 })
      .optional(),
    penaltyType: z.enum(["percentage", "fixed"]).nullable().optional(),
    penaltyValue: z.number().int().nullable().optional(),
  })
  .openapi("UpdateCancellationPolicyRequest");

export const CancellationPolicyResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      policy: CancellationPolicySchema,
      message: z.string().optional(),
    }),
  })
  .openapi("CancellationPolicyResponse");

export const CancellationPolicyPathParamsSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("CancellationPolicyPathParams");

export const CancellationPolicyQueryParamsSchema = z
  .object({
    page: z.number().optional(),
    limit: z.number().optional(),
    hotelId: z.number().optional(),
  })
  .openapi("CancellationPolicyQueryParams");

export const CancellationPoliciesListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      policies: z.array(CancellationPolicySchema),
      pagination: z
        .object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        })
        .optional(),
      message: z.string().optional(),
    }),
  })
  .openapi("CancellationPoliciesListResponse");
