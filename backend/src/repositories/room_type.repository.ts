import { and, count, desc, eq, like } from "drizzle-orm";

import * as schema from "../../drizzle/schema";
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
      conditions.push(eq(schema.roomType.hotelId, filters.hotelId));
    if (typeof filters.isActive === "number")
      conditions.push(eq((schema.roomType as any).isActive, filters.isActive));
    if (filters.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(like(schema.roomType.name, pattern));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(schema.roomType)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const rows = await database.query.roomType.findMany({
      where: whereClause,
      with: {
        images: true,
      },
      orderBy: desc(schema.roomType.createdAt),
      limit,
      offset,
    });

    return { roomTypes: rows as any, total };
  }
  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseRoomType | null> {
    const database = getDb(db);
    const [row] = await database.query.roomType.findMany({
      where: eq(schema.roomType.id, id),
      with: {
        images: true,
      },
      limit: 1,
    });
    return (row as any) || null;
  }
  static async findBySlug(
    db: D1Database,
    hotelId: number,
    slug: string,
  ): Promise<DatabaseRoomType | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(schema.roomType)
      .where(
        and(
          eq(schema.roomType.hotelId, hotelId),
          eq((schema.roomType as any).slug, slug),
        ),
      )
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async findSlugsByPattern(
    db: D1Database,
    hotelId: number,
    slugPattern: string,
  ): Promise<string[]> {
    const database = getDb(db);
    const rows = await database
      .select({ slug: (schema.roomType as any).slug })
      .from(schema.roomType)
      .where(
        and(
          eq(schema.roomType.hotelId, hotelId),
          like((schema.roomType as any).slug, slugPattern),
        ),
      );
    return rows
      .map((row) => row.slug)
      .filter((slug): slug is string => slug !== null);
  }
  static async create(
    db: D1Database,
    data: CreateRoomTypeData,
  ): Promise<DatabaseRoomType> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(schema.roomType)
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
      .update(schema.roomType)
      .set(payload as any)
      .where(eq(schema.roomType.id, id))
      .returning();
    return (rows[0] as any) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(schema.roomType)
      .where(eq(schema.roomType.id, id))
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
      .from(schema.roomTypeImage)
      .where(eq(schema.roomTypeImage.roomTypeId, roomTypeId))
      .orderBy(schema.roomTypeImage.sortOrder, schema.roomTypeImage.createdAt);
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
      .insert(schema.roomTypeImage)
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
      .delete(schema.roomTypeImage)
      .where(eq(schema.roomTypeImage.roomTypeId, roomTypeId))
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
      .from(schema.roomTypeImage)
      .where(eq(schema.roomTypeImage.id, imageId))
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async deleteImage(db: D1Database, imageId: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(schema.roomTypeImage)
      .where(eq(schema.roomTypeImage.id, imageId))
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
      .update(schema.roomTypeImage)
      .set({ sortOrder })
      .where(eq(schema.roomTypeImage.id, imageId))
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
      .delete(schema.roomTypeAmenity)
      .where(eq(schema.roomTypeAmenity.roomTypeId, roomTypeId));

    if (amenityIds.length === 0) return;

    const nowIso = new Date().toISOString();
    await database.insert(schema.roomTypeAmenity).values(
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
      .from(schema.roomTypeAmenity)
      .where(eq(schema.roomTypeAmenity.roomTypeId, roomTypeId));
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
      .delete(schema.roomTypeAddon)
      .where(eq(schema.roomTypeAddon.roomTypeId, roomTypeId));

    if (addons.length === 0) return;

    const nowIso = new Date().toISOString();
    await database.insert(schema.roomTypeAddon).values(
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
      .from(schema.roomTypeAddon)
      .where(eq(schema.roomTypeAddon.roomTypeId, roomTypeId));
    return rows as any;
  }
}
