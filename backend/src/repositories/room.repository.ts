import { and, count, desc, eq, like } from "drizzle-orm";

import { room as roomTable } from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseRoom,
  RoomFilters,
  PaginationParams,
  CreateRoomData,
  UpdateRoomData,
} from "../types";

export class RoomRepository {
  static async findAll(
    db: D1Database,
    filters: RoomFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ rooms: DatabaseRoom[]; total: number }> {
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

    const rows = await database
      .select()
      .from(roomTable)
      .where(whereClause)
      .orderBy(desc(roomTable.createdAt))
      .limit(limit)
      .offset(offset);

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

  static async create(
    db: D1Database,
    data: CreateRoomData,
  ): Promise<DatabaseRoom> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(roomTable)
      .values({
        ...data,
        description: data.description ?? null,
        floor: data.floor ?? null,
        status: data.status ?? "available",
        isActive: data.isActive ?? 1,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as any;
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
