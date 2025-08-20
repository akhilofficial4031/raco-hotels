import z from "zod";

// Amenity Schemas
export const AmenitySchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    code: z.string().openapi({ example: "wifi" }),
    name: z.string().openapi({ example: "Wifi" }),
    icon: z.string().nullable().openapi({ example: "wifi" }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("Amenity");

export const CreateAmenityRequestSchema = z
  .object({
    code: z.string().openapi({ example: "wifi" }),
    name: z.string().openapi({ example: "Wifi" }),
    icon: z.string().nullable().openapi({ example: "wifi" }),
  })
  .openapi("CreateAmenityRequest");

export const UpdateAmenityRequestSchema = z
  .object({
    name: z.string().openapi({ example: "Wifi" }),
    icon: z.string().nullable().openapi({ example: "wifi" }),
  })
  .openapi("UpdateAmenityRequest");

export const AmenityResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      amenity: AmenitySchema,
      message: z.string().optional(),
    }),
  })
  .openapi("AmenityResponse");

export const AmenityPathParamsSchema = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("AmenityPathParams");

export const AmenityQueryParamsSchema = z
  .object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
  })
  .openapi("AmenityQueryParams");

export const AmenitiesListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      amenities: z.array(AmenitySchema),
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
  .openapi("AmenitiesListResponse");
