import z from "zod";

const RoomTypeForAddonConfigurationSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string(),
  })
  .openapi("RoomTypeForAddonConfiguration");

export const AddonConfigurationSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    roomTypeId: z.number().int().positive().openapi({ example: 1 }),
    addonId: z.number().int().positive().openapi({ example: 1 }),
    priceCents: z.number().int().min(0).openapi({ example: 1000 }),
    currencyCode: z.string().openapi({ example: "USD" }),
    maxQuantity: z.number().int().nullable().openapi({ example: 5 }),
    minQuantity: z.number().int().min(0).openapi({ example: 1 }),
    isAvailable: z.number().int().min(0).max(1).openapi({ example: 1 }),
    specialInstructions: z
      .string()
      .nullable()
      .openapi({ example: "Subject to availability" }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    roomType: RoomTypeForAddonConfigurationSchema,
  })
  .openapi("AddonConfiguration");

export const AddonConfigurationPathParamsSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("AddonConfigurationPathParams");

export const AddonConfigurationQueryParamsSchema = z
  .object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
  })
  .openapi("AddonConfigurationQueryParams");

export const AddonConfigurationsListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      configurations: z.array(AddonConfigurationSchema),
      pagination: z
        .object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
        })
        .optional(),
      message: z.string().optional(),
    }),
  })
  .openapi("AddonConfigurationsListResponse");

export const UpdateAddonConfigurationRequestSchema = z
  .object({
    priceCents: z.number().int().min(0),
  })
  .openapi("UpdateAddonConfigurationRequest");

export const UpdateAddonConfigurationPathParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .openapi("UpdateAddonConfigurationPathParams");

export const UpdateAddonConfigurationResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      configuration: AddonConfigurationSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("UpdateAddonConfigurationResponse");

export const DeleteAddonConfigurationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    message: z.string(),
  }),
});
