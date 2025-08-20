import { z } from "zod";
import { RoomSchema } from "./room_unit.schema";

// Room Type Image Schema
export const RoomTypeImageSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    roomTypeId: z.number().int().positive().openapi({ example: 1 }),
    url: z.string().url().openapi({
      example: "https://cdn.example.com/rooms/1/images/photo.jpg",
    }),
    alt: z.string().nullable().openapi({ example: "Room view" }),
    sortOrder: z.number().int().openapi({ example: 0 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("RoomTypeImage");

// Room Type Amenity Schema (join)
export const RoomTypeAmenitySchema = z
  .object({
    id: z.number().int().optional().openapi({ example: 1 }), // not in schema PK, optional for API
    roomTypeId: z.number().int().positive().openapi({ example: 1 }),
    amenityId: z.number().int().positive().openapi({ example: 2 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("RoomTypeAmenity");

// Room Type Schema
export const RoomTypeSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Deluxe King" }),
    slug: z.string().openapi({ example: "deluxe-king" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "Spacious king room" }),
    baseOccupancy: z.number().int().openapi({ example: 2 }),
    maxOccupancy: z.number().int().openapi({ example: 3 }),
    basePriceCents: z.number().int().openapi({ example: 15999 }),
    currencyCode: z.string().openapi({ example: "INR" }),
    sizeSqft: z.number().int().nullable().openapi({ example: 350 }),
    bedType: z.string().nullable().openapi({ example: "King" }),
    smokingAllowed: z.number().int().openapi({ example: 0 }),
    totalRooms: z.number().int().openapi({ example: 10 }),
    isActive: z.number().int().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("RoomType");

export const RoomTypeWithRelationsSchema = RoomTypeSchema.extend({
  images: z
    .array(RoomTypeImageSchema)
    .openapi({ description: "Room type images" }),
  amenities: z
    .array(
      z.object({
        amenityId: z.number().int().positive(),
        roomTypeId: z.number().int().positive(),
        createdAt: z.string(),
      }),
    )
    .openapi({ description: "Room type amenities" }),
  rooms: z
    .array(RoomSchema)
    .openapi({ description: "Individual room units of this room type" }),
}).openapi("RoomTypeWithRelations");

export const CreateRoomTypeRequestSchema = z
  .object({
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().min(1).openapi({ example: "Deluxe King" }),
    slug: z.string().min(1).openapi({ example: "deluxe-king" }),
    description: z
      .string()
      .optional()
      .openapi({ example: "Spacious king room" }),
    baseOccupancy: z.number().int().optional().openapi({ example: 2 }),
    maxOccupancy: z.number().int().optional().openapi({ example: 3 }),
    basePriceCents: z.number().int().optional().openapi({ example: 15999 }),
    currencyCode: z.string().optional().openapi({ example: "USD" }),
    sizeSqft: z.number().int().optional().openapi({ example: 350 }),
    bedType: z.string().optional().openapi({ example: "King" }),
    smokingAllowed: z.number().int().optional().openapi({ example: 0 }),
    totalRooms: z.number().int().optional().openapi({ example: 10 }),
    isActive: z.number().int().optional().openapi({ example: 1 }),
    amenityIds: z
      .array(z.number().int().positive())
      .optional()
      .openapi({
        example: [1, 2, 3],
        description: "Amenity IDs to attach",
      }),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          alt: z.string().optional(),
          sortOrder: z.number().int().optional(),
        }),
      )
      .optional()
      .openapi({ description: "Initial images to create" }),
  })
  .openapi("CreateRoomTypeRequest");

export const UpdateRoomTypeRequestSchema =
  CreateRoomTypeRequestSchema.partial().openapi("UpdateRoomTypeRequest");
export const RoomTypePathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Room type ID" }),
  })
  .openapi("RoomTypePathParams");

export const RoomTypeQueryParamsSchema = z
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
    hotelId: z.string().optional().openapi({ example: "1" }),
    isActive: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : undefined))
      .openapi({ example: "1" }),
    search: z.string().optional().openapi({ example: "Deluxe" }),
  })
  .openapi("RoomTypeQueryParams");

export const RoomTypeResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      roomType: RoomTypeWithRelationsSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("RoomTypeResponse");

export const RoomTypesListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      roomTypes: z.array(RoomTypeWithRelationsSchema),
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
  .openapi("RoomTypesListResponse");
