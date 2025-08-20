import z from "zod";

// Feature Schemas
export const FeatureSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    code: z.string().openapi({ example: "wifi" }),
    name: z.string().openapi({ example: "Wifi" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Wifi is available in the hotel" }),
    isVisible: z.boolean().openapi({ example: true }),
    sortOrder: z.number().int().positive().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("Feature");

export const CreateFeatureRequestSchema = z
  .object({
    code: z.string().openapi({ example: "wifi" }),
    name: z.string().openapi({ example: "Wifi" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Wifi is available in the hotel" }),
    isVisible: z.boolean().openapi({ example: true }),
    sortOrder: z.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("CreateFeatureRequest");

export const UpdateFeatureRequestSchema = z
  .object({
    name: z.string().openapi({ example: "Wifi" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Wifi is available in the hotel" }),
    isVisible: z.boolean().openapi({ example: true }),
    sortOrder: z.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("UpdateFeatureRequest");

export const FeatureResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      feature: FeatureSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("FeatureResponse");

export const FeaturePathParamsSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("FeaturePathParams");

export const FeatureQueryParamsSchema = z
  .object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
  })
  .openapi("FeatureQueryParams");

export const FeaturesListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      features: z.array(FeatureSchema),
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
  .openapi("FeaturesListResponse");
