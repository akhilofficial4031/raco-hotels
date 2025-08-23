import { z } from "zod";

const RoomStatusEnum = z.enum([
  "available",
  "occupied",
  "maintenance",
  "out_of_order",
]);

export const RoomSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    roomTypeId: z.number().int().positive().openapi({ example: 2 }),
    roomNumber: z.string().openapi({ example: "101A" }),
    floor: z.string().nullable().openapi({ example: "1" }),
    description: z.string().nullable().openapi({ example: "Near elevator" }),
    status: RoomStatusEnum.openapi({ example: "available" }),
    isActive: z.number().int().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    roomType: z
      .object({
        id: z.number().int().positive(),
        name: z.string(),
      })
      .optional(),
  })
  .openapi("Room");

export const CreateRoomsRequestSchema = z
  .object({
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    roomTypeId: z.number().int().positive().openapi({ example: 2 }),
    roomNumbers: z
      .array(z.string().min(1))
      .nonempty()
      .openapi({ example: ["101A", "102B"] }),
    floor: z.string().optional().openapi({ example: "1" }),
    description: z.string().optional().openapi({ example: "Near elevator" }),
    status: RoomStatusEnum.optional().openapi({ example: "available" }),
    isActive: z.number().int().optional().openapi({ example: 1 }),
  })
  .openapi("CreateRoomsRequest");

export const UpdateRoomRequestSchema = z
  .object({
    hotelId: z.number().int().positive().optional().openapi({ example: 1 }),
    roomTypeId: z.number().int().positive().optional().openapi({ example: 2 }),
    roomNumber: z.string().min(1).optional().openapi({ example: "101A" }),
    floor: z.string().optional().openapi({ example: "1" }),
    description: z.string().optional().openapi({ example: "Near elevator" }),
    status: RoomStatusEnum.optional().openapi({ example: "available" }),
    isActive: z.number().int().optional().openapi({ example: 1 }),
  })
  .openapi("UpdateRoomRequest");

export const RoomPathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Room ID" }),
  })
  .openapi("RoomPathParams");

export const RoomQueryParamsSchema = z
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
    roomTypeId: z.string().optional().openapi({ example: "2" }),
    status: z.string().optional().openapi({ example: "available" }),
    isActive: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : undefined))
      .openapi({ example: "1" }),
    search: z.string().optional().openapi({ example: "101" }),
  })
  .openapi("RoomQueryParams");

export const RoomResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      room: RoomSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("RoomResponse");

export const RoomsResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      rooms: z.array(RoomSchema),
      message: z.string().optional(),
    }),
  })
  .openapi("RoomsResponse");

export const RoomsListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      rooms: z.array(RoomSchema),
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
  .openapi("RoomsListResponse");
