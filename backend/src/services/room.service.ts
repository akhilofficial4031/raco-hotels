import { eq } from "drizzle-orm";

import { roomType as roomTypeTable } from "../../drizzle/schema";
import { getDb } from "../db";
import { RoomRepository } from "../repositories/room.repository";

import type {
  CreateRoomsRequestSchema,
  UpdateRoomRequestSchema,
  RoomQueryParamsSchema,
} from "../schemas";
import type { z } from "zod";

export class RoomService {
  private static async assertRoomTypeExists(
    db: D1Database,
    roomTypeId: number,
  ) {
    const database = getDb(db);
    const rows = await database
      .select({ id: roomTypeTable.id })
      .from(roomTypeTable)
      .where(eq(roomTypeTable.id, roomTypeId))
      .limit(1);
    const rt = rows[0];
    if (!rt) throw new Error("Room type not found");
  }

  static async createRooms(
    db: D1Database,
    data: z.infer<typeof CreateRoomsRequestSchema>,
  ) {
    // Ensure room type exists
    await this.assertRoomTypeExists(db, data.roomTypeId);

    // Ensure unique hotelId+roomNumber for all room numbers
    const existingRooms = await RoomRepository.findByHotelAndNumbers(
      db,
      data.hotelId,
      data.roomNumbers,
    );
    if (existingRooms.length > 0) {
      const existingRoomNumbers = existingRooms.map((r) => r.roomNumber);
      throw new Error(
        `Room numbers already exist for this hotel: ${existingRoomNumbers.join(
          ", ",
        )}`,
      );
    }

    return await RoomRepository.createMany(db, data);
  }

  static async updateRoom(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateRoomRequestSchema>,
  ) {
    const existing = await RoomRepository.findById(db, id);
    if (!existing) throw new Error("Room not found");

    if (data.roomTypeId) {
      await this.assertRoomTypeExists(db, data.roomTypeId);
    }

    if (data.roomNumber || data.hotelId) {
      const hotelId = data.hotelId ?? (existing as any).hotelId;
      const roomNumber = data.roomNumber ?? (existing as any).roomNumber;
      const conflict = await RoomRepository.findByHotelAndNumber(
        db,
        hotelId,
        roomNumber,
      );
      if (conflict && conflict.id !== id)
        throw new Error("Room number already exists for this hotel");
    }

    const updated = await RoomRepository.update(db, id, data);
    if (!updated) throw new Error("Room not found");
    return updated;
  }

  static async getRoomById(db: D1Database, id: number) {
    return await RoomRepository.findById(db, id);
  }

  static async getRooms(
    db: D1Database,
    query: z.infer<typeof RoomQueryParamsSchema>,
  ) {
    const {
      page = 1,
      limit = 10,
      hotelId,
      roomTypeId,
      status,
      isActive,
      search,
    } = query as any;

    // If a hotelId is provided, fetch all rooms without pagination
    const pagination = hotelId ? { page: 1, limit: -1 } : { page, limit };

    const { rooms, total } = await RoomRepository.findAll(
      db,
      {
        hotelId: hotelId ? parseInt(hotelId as any, 10) : undefined,
        roomTypeId: roomTypeId ? parseInt(roomTypeId as any, 10) : undefined,
        status,
        isActive: typeof isActive === "number" ? isActive : undefined,
        search,
      },
      pagination,
    );
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    return { items: rooms, pagination: { page, limit, total, totalPages } };
  }

  static async deleteRoom(db: D1Database, id: number) {
    const existing = await RoomRepository.findById(db, id);
    if (!existing) throw new Error("Room not found");
    return await RoomRepository.delete(db, id);
  }
}
