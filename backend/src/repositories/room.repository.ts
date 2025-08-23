import { and, count, desc, eq, like, inArray } from "drizzle-orm";

import {
  room as roomTable,
  roomType as roomTypeTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseRoom,
  RoomFilters,
  PaginationParams,
  CreateRoomsData,
  UpdateRoomData,
} from "../types";

export class RoomRepository {
  static async findAll(
    db: D1Database,
    filters: RoomFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ rooms: any[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (filters.hotelId)
      conditions.push(eq(roomTable.hotelId, filters.hotelId));
    if (filters.roomTypeId)
      conditions.push(eq(roomTable.roomTypeId, filters.roomTypeId));
    if (filters.status) conditions.push(eq(roomTable.status, filters.status));
    if (typeof filters.isActive === "number")
      conditions.push(eq(roomTable.isActive, filters.isActive));
    if (filters.search)
      conditions.push(like(roomTable.roomNumber, `%${filters.search}%`));

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(roomTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    let query = database
      .select({
        id: roomTable.id,
        hotelId: roomTable.hotelId,
        roomTypeId: roomTable.roomTypeId,
        roomNumber: roomTable.roomNumber,
        floor: roomTable.floor,
        description: roomTable.description,
        status: roomTable.status,
        isActive: roomTable.isActive,
        createdAt: roomTable.createdAt,
        updatedAt: roomTable.updatedAt,
        roomType: {
          id: roomTypeTable.id,
          name: roomTypeTable.name,
        },
      })
      .from(roomTable)
      .leftJoin(roomTypeTable, eq(roomTable.roomTypeId, roomTypeTable.id))
      .where(whereClause)
      .orderBy(desc(roomTable.createdAt));

    if (limit !== -1) {
      query = query.limit(limit).offset(offset);
    }

    const rows = await query;

    return { rooms: rows as any, total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseRoom | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTable)
      .where(eq(roomTable.id, id))
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async findByHotelAndNumber(
    db: D1Database,
    hotelId: number,
    roomNumber: string,
  ): Promise<DatabaseRoom | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTable)
      .where(
        and(
          eq(roomTable.hotelId, hotelId),
          eq(roomTable.roomNumber, roomNumber),
        ),
      )
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async findByHotelAndNumbers(
    db: D1Database,
    hotelId: number,
    roomNumbers: string[],
  ): Promise<DatabaseRoom[]> {
    if (roomNumbers.length === 0) return [];
    const database = getDb(db);
    const existingRooms: DatabaseRoom[] = [];
    const batchSize = 100;

    for (let i = 0; i < roomNumbers.length; i += batchSize) {
      const batch = roomNumbers.slice(i, i + batchSize);
      const rows = await database
        .select()
        .from(roomTable)
        .where(
          and(
            eq(roomTable.hotelId, hotelId),
            inArray(roomTable.roomNumber, batch),
          ),
        );
      if (rows.length > 0) {
        existingRooms.push(...(rows as any));
      }
    }
    return existingRooms;
  }

  static async createMany(
    db: D1Database,
    data: CreateRoomsData,
    tx?: any,
  ): Promise<DatabaseRoom[]> {
    const database = tx || getDb(db);
    const nowIso = new Date().toISOString();

    const roomsToInsert = data.roomNumbers.map((roomNumber) => ({
      ...data,
      roomNumber,
      description: data.description ?? null,
      floor: data.floor ?? null,
      status: data.status ?? "available",
      isActive: data.isActive ?? 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    }));

    if (roomsToInsert.length === 0) return [];

    const batchSize = 50;
    const createdRooms: DatabaseRoom[] = [];

    for (let i = 0; i < roomsToInsert.length; i += batchSize) {
      const batch = roomsToInsert.slice(i, i + batchSize);
      const created = await database
        .insert(roomTable)
        .values(batch as any)
        .returning();
      createdRooms.push(...(created as any));
    }

    return createdRooms;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateRoomData,
  ): Promise<DatabaseRoom | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(roomTable)
      .set(payload as any)
      .where(eq(roomTable.id, id))
      .returning();
    return (rows[0] as any) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(roomTable)
      .where(eq(roomTable.id, id))
      .returning();
    return rows.length > 0;
  }

  static async findByRoomTypeId(
    db: D1Database,
    roomTypeId: number,
  ): Promise<DatabaseRoom[]> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTable)
      .where(eq(roomTable.roomTypeId, roomTypeId))
      .orderBy(roomTable.roomNumber);
    return rows as any;
  }
}
