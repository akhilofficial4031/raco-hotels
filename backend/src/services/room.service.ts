import { eq } from "drizzle-orm";

import { roomType as roomTypeTable } from "../../drizzle/schema";
import { getDb } from "../db";
import { RoomRepository } from "../repositories/room.repository";

import type {
  CreateRoomRequestSchema,
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

  static async createRoom(
    db: D1Database,
    data: z.infer<typeof CreateRoomRequestSchema>,
  ) {
    // Ensure room type exists
    await this.assertRoomTypeExists(db, data.roomTypeId);

    // Ensure unique hotelId+roomNumber
    const existing = await RoomRepository.findByHotelAndNumber(
      db,
      data.hotelId,
      data.roomNumber,
    );
    if (existing) throw new Error("Room number already exists for this hotel");

    return await RoomRepository.create(db, data);
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
    const { rooms, total } = await RoomRepository.findAll(
      db,
      {
        hotelId: hotelId ? parseInt(hotelId as any, 10) : undefined,
        roomTypeId: roomTypeId ? parseInt(roomTypeId as any, 10) : undefined,
        status,
        isActive: typeof isActive === "number" ? isActive : undefined,
        search,
      },
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return { items: rooms, pagination: { page, limit, total, totalPages } };
  }

  static async deleteRoom(db: D1Database, id: number) {
    const existing = await RoomRepository.findById(db, id);
    if (!existing) throw new Error("Room not found");
    return await RoomRepository.delete(db, id);
  }
}
