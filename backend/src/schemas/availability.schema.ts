import { z } from "zod";

import { RoomTypeImageSchema } from "./room_type.schema";

/**
 * Query parameters for room availability search
 * Supports searching by hotel ID or slug with date range
 */
export const RoomsAvailabilityQueryParamsSchema = z
  .object({
    hotelId: z.string().openapi({
      example: "1",
      description: "Hotel ID (numeric) - required",
    }),
    roomTypeId: z.string().optional().openapi({
      example: "1",
      description:
        "Room Type ID (numeric) - when provided, searches only this room type",
    }),
    checkInDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({
        example: "2024-12-20",
        description: "Check-in date in YYYY-MM-DD format",
      }),
    checkOutDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({
        example: "2024-12-23",
        description: "Check-out date in YYYY-MM-DD format",
      }),
    numberOfRooms: z.string().optional().openapi({
      example: "2",
      description: "Number of rooms required - validates availability count",
    }),
    minPriceCents: z.string().optional().openapi({
      example: "5000",
      description: "Minimum price filter in cents",
    }),
    maxPriceCents: z.string().optional().openapi({
      example: "20000",
      description: "Maximum price filter in cents",
    }),
    guestCount: z.string().optional().openapi({
      example: "2",
      description:
        "Number of adult guests (age 10+). Filters room types that can accommodate this many adults (normally or with one extra adult allowance). Children under 10 do not count toward occupancy.",
    }),
  })
  .openapi("RoomsAvailabilityQueryParams");

/**
 * Individual room details
 */
export const AvailableRoomSchema = z
  .object({
    roomId: z.number().int().openapi({
      example: 101,
      description: "Unique identifier for the room",
    }),
    roomNumber: z.string().openapi({
      example: "101",
      description: "Room number",
    }),
    floor: z.string().nullable().openapi({
      example: "1",
      description: "Floor number",
    }),
    roomDescription: z.string().nullable().openapi({
      example: "Corner room with city view",
      description: "Description of the specific room",
    }),
    status: z.string().openapi({
      example: "available",
      description: "Current status of the room",
    }),
  })
  .openapi("AvailableRoom");

/**
 * Available room type details with availability count and available rooms
 */
export const AvailableRoomTypeSchema = z
  .object({
    roomTypeId: z.number().int().openapi({
      example: 1,
      description: "Unique identifier for the room type",
    }),
    roomTypeName: z.string().openapi({
      example: "Deluxe King Suite",
      description: "Name of the room type",
    }),
    roomTypeSlug: z.string().openapi({
      example: "deluxe-king-suite",
      description: "URL-friendly slug for the room type",
    }),
    description: z.string().nullable().openapi({
      example: "Spacious suite with king-size bed and city view",
      description: "Detailed description of the room type",
    }),
    baseOccupancy: z.number().int().openapi({
      example: 2,
      description: "Standard number of guests",
    }),
    maxOccupancy: z.number().int().openapi({
      example: 3,
      description: "Maximum number of guests allowed",
    }),
    basePriceCents: z.number().int().openapi({
      example: 15000,
      description: "Base price per night in cents",
    }),
    currencyCode: z.string().openapi({
      example: "INR",
      description: "Currency code (ISO 4217)",
    }),
    sizeSqft: z.number().int().nullable().openapi({
      example: 450,
      description: "Room size in square feet",
    }),
    bedType: z.string().nullable().openapi({
      example: "King",
      description: "Type of bed(s) in the room",
    }),
    smokingAllowed: z.boolean().openapi({
      example: false,
      description: "Whether smoking is allowed in this room type",
    }),
    extraAdultChargeCents: z.number().int().openapi({
      example: 100000,
      description:
        "Flat charge in cents when one extra adult is added beyond max occupancy",
    }),
    totalRooms: z.number().int().openapi({
      example: 10,
      description: "Total number of physical rooms of this type",
    }),
    availableRooms: z.number().int().openapi({
      example: 5,
      description: "Number of rooms available for the selected dates",
    }),
    images: z.array(RoomTypeImageSchema).openapi({
      description: "List of images for this room type",
    }),
    rooms: z.array(AvailableRoomSchema).openapi({
      description: "List of available individual rooms for this room type",
    }),
  })
  .openapi("AvailableRoomType");

/**
 * Response schema for room availability search
 */
export const RoomsAvailabilityResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      hotelId: z.number().int().openapi({
        example: 1,
        description: "ID of the hotel",
      }),
      checkInDate: z.string().openapi({
        example: "2024-12-20",
        description: "Check-in date",
      }),
      checkOutDate: z.string().openapi({
        example: "2024-12-23",
        description: "Check-out date",
      }),
      roomTypes: z.array(AvailableRoomTypeSchema).openapi({
        description: "List of available room types with availability counts",
      }),
      totalRoomTypesAvailable: z.number().int().openapi({
        example: 3,
        description: "Total number of room types with availability",
      }),
    }),
    message: z.string().optional().openapi({
      example: "Availability retrieved successfully",
    }),
  })
  .openapi("RoomsAvailabilityResponse");

/**
 * Legacy schema - kept for backward compatibility
 * @deprecated Use AvailableRoomSchema instead
 */
export const LegacyAvailableRoomSchema = z.object({
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
