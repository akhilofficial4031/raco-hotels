import { z } from "zod";

export const RoomsAvailabilityQueryParamsSchema = z
  .object({
    hotelId: z.string().optional().openapi({ example: "1" }),
    checkInDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({ example: "2024-12-20", description: "YYYY-MM-DD" }),
    checkOutDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({ example: "2024-12-23", description: "YYYY-MM-DD" }),
    roomTypeId: z.string().optional().openapi({ example: "2" }),
    minPriceCents: z.string().optional().openapi({ example: "5000" }),
    maxPriceCents: z.string().optional().openapi({ example: "20000" }),
    amenities: z.string().optional().openapi({
      example: "wifi,ac,breakfast",
      description: "Comma separated amenity codes",
    }),
    guestCount: z.string().optional().openapi({ example: "3" }),
    petsAllowed: z
      .string()
      .optional()
      .openapi({ example: "0", description: "0 or 1" }),
  })
  .openapi("RoomsAvailabilityQueryParams");

export const AvailableRoomTypeSchema = z
  .object({
    roomTypeId: z.number().int().openapi({ example: 2 }),
    hotelId: z.number().int().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Deluxe King" }),
    maxOccupancy: z.number().int().openapi({ example: 3 }),
    basePriceCents: z.number().int().openapi({ example: 12000 }),
    currencyCode: z.string().openapi({ example: "INR" }),
    availableCount: z.number().int().openapi({ example: 4 }),
    nightlyPricesCents: z
      .array(z.number().int())
      .openapi({ example: [12000, 12000, 13000] }),
    images: z
      .array(
        z.object({
          id: z.number().int(),
          url: z.string(),
          alt: z.string().nullish(),
        }),
      )
      .optional(),
    amenities: z.array(z.string()).optional(),
  })
  .openapi("AvailableRoomType");

export const RoomsAvailabilityResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      results: z.array(AvailableRoomTypeSchema),
      message: z.string().optional(),
    }),
  })
  .openapi("RoomsAvailabilityResponse");
