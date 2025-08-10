import z from "zod";

const LocationInfoImageSchema = z
  .object({
    url: z.string().url().openapi({ example: "https://cdn.example.com/img.jpg" }),
    alt: z.string().nullable().optional().openapi({ example: "Golden Gate Bridge" }),
  })
  .openapi("LocationInfoImage");

const LocationInfoSectionSchema = z
  .object({
    heading: z.string().openapi({ example: "Nearby Attractions" }),
    subHeading: z.string().nullable().optional().openapi({ example: "Top picks" }),
    bulletPoints: z.array(z.string()).nullable().optional().openapi({ example: ["5 min to beach", "Close to metro"] }),
    description: z.string().nullable().optional().openapi({ example: "Great neighborhood with lots to do." }),
    images: z.array(LocationInfoImageSchema).nullable().optional(),
  })
  .openapi("LocationInfoSection");

// Hotel Schemas
export const HotelSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Raco Grand" }),
    slug: z.string().nullable().openapi({ example: "raco-grand" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Downtown boutique hotel" }),
    email: z.string().nullable().openapi({ example: "info@raco.com" }),
    phone: z.string().nullable().openapi({ example: "+1-202-555-0100" }),
    addressLine1: z.string().nullable().openapi({ example: "123 Main St" }),
    addressLine2: z.string().nullable().openapi({ example: "Suite 100" }),
    city: z.string().nullable().openapi({ example: "San Francisco" }),
    state: z.string().nullable().openapi({ example: "CA" }),
    postalCode: z.string().nullable().openapi({ example: "94105" }),
    countryCode: z.string().nullable().openapi({ example: "US" }),
    latitude: z.number().nullable().openapi({ example: 37.789 }),
    longitude: z.number().nullable().openapi({ example: -122.401 }),
    timezone: z.string().nullable().openapi({ example: "America/Los_Angeles" }),
    starRating: z.number().int().nullable().openapi({ example: 4 }),
    checkInTime: z.string().nullable().openapi({ example: "15:00" }),
    checkOutTime: z.string().nullable().openapi({ example: "11:00" }),
    locationInfo: z
      .array(LocationInfoSectionSchema)
      .nullable()
      .openapi({ description: "Optional rich JSON content about nearby locations" }),
    isActive: z.number().int().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("Hotel");

export const CreateHotelRequestSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Raco Grand" }),
    slug: z.string().optional().openapi({ example: "raco-grand" }),
    description: z
      .string()
      .optional()
      .openapi({ example: "Downtown boutique hotel" }),
    email: z.string().email().optional().openapi({ example: "info@raco.com" }),
    phone: z.string().optional().openapi({ example: "+1-202-555-0100" }),
    addressLine1: z.string().optional().openapi({ example: "123 Main St" }),
    addressLine2: z.string().optional().openapi({ example: "Suite 100" }),
    city: z.string().optional().openapi({ example: "San Francisco" }),
    state: z.string().optional().openapi({ example: "CA" }),
    postalCode: z.string().optional().openapi({ example: "94105" }),
    countryCode: z.string().optional().openapi({ example: "US" }),
    latitude: z.number().optional().openapi({ example: 37.789 }),
    longitude: z.number().optional().openapi({ example: -122.401 }),
    timezone: z.string().optional().openapi({ example: "America/Los_Angeles" }),
    starRating: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .openapi({ example: 4 }),
    checkInTime: z.string().optional().openapi({ example: "15:00" }),
    checkOutTime: z.string().optional().openapi({ example: "11:00" }),
    locationInfo: z
      .array(LocationInfoSectionSchema)
      .optional()
      .openapi({ description: "Optional rich JSON content about nearby locations" }),
    isActive: z.number().int().optional().openapi({ example: 1 }),
  })
  .openapi("CreateHotelRequest");

export const UpdateHotelRequestSchema =
  CreateHotelRequestSchema.partial().openapi("UpdateHotelRequest");

export const HotelPathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Hotel ID" }),
  })
  .openapi("HotelPathParams");

export const HotelQueryParamsSchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1))
      .openapi({ example: "1" }),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 10))
      .openapi({ example: "10" }),
    city: z.string().optional().openapi({ example: "San Francisco" }),
    countryCode: z.string().optional().openapi({ example: "US" }),
    isActive: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : undefined))
      .openapi({ example: "1" }),
    search: z.string().optional().openapi({ example: "Raco" }),
  })
  .openapi("HotelQueryParams");

export const HotelResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      hotel: HotelSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("HotelResponse");

export const HotelsListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      hotels: z.array(HotelSchema),
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
  .openapi("HotelsListResponse");
