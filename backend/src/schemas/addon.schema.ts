import z from "zod";

// Addon Schemas
export const AddonSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Extra Bed" }),
    slug: z.string().openapi({ example: "extra-bed" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Additional bed for extra guest" }),
    category: z.string().nullable().openapi({ example: "bed" }),
    unitType: z.string().openapi({ example: "item" }),
    isActive: z.number().int().min(0).max(1).openapi({ example: 1 }),
    sortOrder: z.number().int().openapi({ example: 0 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("Addon");

export const CreateAddonRequestSchema = z
  .object({
    name: z.string().openapi({ example: "Extra Bed" }),
    slug: z.string().openapi({ example: "extra-bed" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Additional bed for extra guest" }),
    category: z.string().nullable().openapi({ example: "bed" }),
    unitType: z.string().default("item").openapi({ example: "item" }),
    isActive: z.number().int().min(0).max(1).default(1).openapi({ example: 1 }),
    sortOrder: z.number().int().default(0).openapi({ example: 0 }),
  })
  .openapi("CreateAddonRequest");

export const UpdateAddonRequestSchema = z
  .object({
    name: z.string().optional().openapi({ example: "Extra Bed" }),
    slug: z.string().optional().openapi({ example: "extra-bed" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Additional bed for extra guest" }),
    category: z.string().nullable().openapi({ example: "bed" }),
    unitType: z.string().optional().openapi({ example: "item" }),
    isActive: z.number().int().min(0).max(1).optional().openapi({ example: 1 }),
    sortOrder: z.number().int().optional().openapi({ example: 0 }),
  })
  .openapi("UpdateAddonRequest");

export const AddonResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      addon: AddonSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("AddonResponse");

export const AddonPathParamsSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("AddonPathParams");

export const AddonQueryParamsSchema = z
  .object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    isActive: z.coerce.number().int().min(0).max(1).optional(),
    unitType: z.string().optional(),
  })
  .openapi("AddonQueryParams");

export const AddonsListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      addons: z.array(AddonSchema),
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
  .openapi("AddonsListResponse");
