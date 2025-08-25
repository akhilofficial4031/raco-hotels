import { and, count, desc, eq, like } from "drizzle-orm";

import {
  roomType as roomTypeTable,
  roomTypeImage as roomTypeImageTable,
  roomTypeAmenity as roomTypeAmenityTable,
  roomTypeAddon as roomTypeAddonTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseRoomType,
  DatabaseRoomTypeImage,
  DatabaseRoomTypeAmenity,
  DatabaseRoomTypeAddon,
  RoomTypeFilters,
  PaginationParams,
  CreateRoomTypeData,
  UpdateRoomTypeData,
  CreateRoomTypeImageData,
} from "../types";

export class RoomTypeRepository {
  static async findAll(
    db: D1Database,
    filters: RoomTypeFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ roomTypes: DatabaseRoomType[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (filters.hotelId)
      conditions.push(eq(roomTypeTable.hotelId, filters.hotelId));
    if (typeof filters.isActive === "number")
      conditions.push(eq((roomTypeTable as any).isActive, filters.isActive));
    if (filters.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(like(roomTypeTable.name, pattern));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(roomTypeTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const rows = await database
      .select()
      .from(roomTypeTable)
      .where(whereClause)
      .orderBy(desc((roomTypeTable as any).createdAt))
      .limit(limit)
      .offset(offset);

    return { roomTypes: rows as any, total };
  }
  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseRoomType | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTypeTable)
      .where(eq(roomTypeTable.id, id))
      .limit(1);
    return (rows[0] as any) || null;
  }
  static async findBySlug(
    db: D1Database,
    hotelId: number,
    slug: string,
  ): Promise<DatabaseRoomType | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTypeTable)
      .where(
        and(
          eq(roomTypeTable.hotelId, hotelId),
          eq((roomTypeTable as any).slug, slug),
        ),
      )
      .limit(1);
    return (rows[0] as any) || null;
  }
  static async create(
    db: D1Database,
    data: CreateRoomTypeData,
  ): Promise<DatabaseRoomType> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(roomTypeTable)
      .values({
        ...data,
        smokingAllowed: data.smokingAllowed ? 1 : 0,
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
    data: UpdateRoomTypeData,
  ): Promise<DatabaseRoomType | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({
        ...data,
        smokingAllowed:
          typeof data.smokingAllowed === "boolean"
            ? data.smokingAllowed
              ? 1
              : 0
            : undefined,
        updatedAt: new Date().toISOString(),
      }).filter(([, v]) => v !== undefined),
    );
    const rows = await database
      .update(roomTypeTable)
      .set(payload as any)
      .where(eq(roomTypeTable.id, id))
      .returning();
    return (rows[0] as any) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(roomTypeTable)
      .where(eq(roomTypeTable.id, id))
      .returning();
    return rows.length > 0;
  }

  // Images
  static async findImagesByRoomTypeId(
    db: D1Database,
    roomTypeId: number,
  ): Promise<DatabaseRoomTypeImage[]> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTypeImageTable)
      .where(eq(roomTypeImageTable.roomTypeId, roomTypeId))
      .orderBy(roomTypeImageTable.sortOrder, roomTypeImageTable.createdAt);
    return rows as any;
  }

  static async createImages(
    db: D1Database,
    images: CreateRoomTypeImageData[],
  ): Promise<DatabaseRoomTypeImage[]> {
    if (images.length === 0) return [];
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const rows = await database
      .insert(roomTypeImageTable)
      .values(
        images.map((img) => ({
          ...img,
          alt: img.alt ?? null,
          sortOrder: img.sortOrder ?? 0,
          createdAt: nowIso,
        })) as any,
      )
      .returning();
    return rows as any;
  }

  static async deleteImagesByRoomTypeId(
    db: D1Database,
    roomTypeId: number,
  ): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(roomTypeImageTable)
      .where(eq(roomTypeImageTable.roomTypeId, roomTypeId))
      .returning();
    return rows.length > 0;
  }

  static async findImageById(
    db: D1Database,
    imageId: number,
  ): Promise<DatabaseRoomTypeImage | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTypeImageTable)
      .where(eq(roomTypeImageTable.id, imageId))
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async deleteImage(db: D1Database, imageId: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(roomTypeImageTable)
      .where(eq(roomTypeImageTable.id, imageId))
      .returning();
    return rows.length > 0;
  }

  static async updateImageSortOrder(
    db: D1Database,
    imageId: number,
    sortOrder: number,
  ): Promise<DatabaseRoomTypeImage | null> {
    const database = getDb(db);
    const rows = await database
      .update(roomTypeImageTable)
      .set({ sortOrder })
      .where(eq(roomTypeImageTable.id, imageId))
      .returning();
    return (rows[0] as any) || null;
  }

  // Amenities
  static async setAmenities(
    db: D1Database,
    roomTypeId: number,
    amenityIds: number[],
  ): Promise<void> {
    const database = getDb(db);
    // Clear existing
    await database
      .delete(roomTypeAmenityTable)
      .where(eq(roomTypeAmenityTable.roomTypeId, roomTypeId));

    if (amenityIds.length === 0) return;

    const nowIso = new Date().toISOString();
    await database.insert(roomTypeAmenityTable).values(
      amenityIds.map((amenityId) => ({
        roomTypeId,
        amenityId,
        createdAt: nowIso,
      })) as any,
    );
  }

  static async getAmenities(
    db: D1Database,
    roomTypeId: number,
  ): Promise<DatabaseRoomTypeAmenity[]> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTypeAmenityTable)
      .where(eq(roomTypeAmenityTable.roomTypeId, roomTypeId));
    return rows as any;
  }

  // Addons
  static async setAddons(
    db: D1Database,
    roomTypeId: number,
    addons: { addonId: number; priceCents: number }[],
  ): Promise<void> {
    const database = getDb(db);
    // Clear existing
    await database
      .delete(roomTypeAddonTable)
      .where(eq(roomTypeAddonTable.roomTypeId, roomTypeId));

    if (addons.length === 0) return;

    const nowIso = new Date().toISOString();
    await database.insert(roomTypeAddonTable).values(
      addons.map((addon) => ({
        roomTypeId,
        addonId: addon.addonId,
        priceCents: addon.priceCents,
        createdAt: nowIso,
        updatedAt: nowIso,
      })) as any,
    );
  }

  static async getAddons(
    db: D1Database,
    roomTypeId: number,
  ): Promise<DatabaseRoomTypeAddon[]> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(roomTypeAddonTable)
      .where(eq(roomTypeAddonTable.roomTypeId, roomTypeId));
    return rows as any;
  }
}
