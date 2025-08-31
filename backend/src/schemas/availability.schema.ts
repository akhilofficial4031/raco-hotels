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

export const RoomSchema = z.object({
  id: z.number().int(),
  hotelId: z.number().int(),
  roomTypeId: z.number().int(),
  roomNumber: z.string(),
  floor: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string(),
  isActive: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RoomsAvailabilityResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      results: z.array(RoomSchema),
      message: z.string().optional(),
    }),
  })
  .openapi("RoomsAvailabilityResponse");
