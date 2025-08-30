import { and, count, desc, like, or, eq } from "drizzle-orm";

import {
  hotel as hotelTable,
  hotelImage as hotelImageTable,
  hotelFeature as hotelFeatureTable,
  hotelAmenity as hotelAmenityTable,
  feature as featureTable,
  amenity as amenityTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseHotel,
  HotelFilters,
  PaginationParams,
  CreateHotelData,
  UpdateHotelData,
  DatabaseHotelImage,
  CreateHotelImageData,
  DatabaseHotelWithRelations,
} from "../types";
import type { DatabaseAmenity } from "../types/amenity.interface";
import type { DatabaseFeature } from "../types/feature.interface";

export class HotelRepository {
  static async findAll(
    db: D1Database,
    filters: HotelFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ hotels: DatabaseHotel[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const conditions = [] as any[];
    if (filters.city) conditions.push(eq(hotelTable.city, filters.city));
    if (filters.countryCode)
      conditions.push(eq(hotelTable.countryCode, filters.countryCode));
    if (typeof filters.isActive === "number")
      conditions.push(eq(hotelTable.isActive, filters.isActive));
    if (filters.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(
        or(
          like(hotelTable.name, pattern),
          like(hotelTable.description, pattern),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const totalResult = await database
      .select({ count: count() })
      .from(hotelTable)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const rows = await database
      .select()
      .from(hotelTable)
      .where(whereClause)
      .orderBy(desc(hotelTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { hotels: rows as DatabaseHotel[], total };
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseHotel | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(hotelTable)
      .where(eq(hotelTable.id, id))
      .limit(1);
    return (rows[0] as DatabaseHotel) || null;
  }

  static async findBySlug(
    db: D1Database,
    slug: string,
  ): Promise<DatabaseHotel | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(hotelTable)
      .where(eq(hotelTable.slug, slug))
      .limit(1);
    return (rows[0] as DatabaseHotel) || null;
  }

  static async create(
    db: D1Database,
    data: CreateHotelData,
  ): Promise<DatabaseHotel> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(hotelTable)
      .values({
        ...data,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as DatabaseHotel;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateHotelData,
  ): Promise<DatabaseHotel | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(hotelTable)
      .set(payload as any)
      .where(eq(hotelTable.id, id))
      .returning();
    return (rows[0] as DatabaseHotel) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(hotelTable)
      .where(eq(hotelTable.id, id))
      .returning();
    return rows.length > 0;
  }

  // Hotel Image methods
  static async findImagesByHotelId(
    db: D1Database,
    hotelId: number,
  ): Promise<DatabaseHotelImage[]> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(hotelImageTable)
      .where(eq(hotelImageTable.hotelId, hotelId))
      .orderBy(hotelImageTable.sortOrder, hotelImageTable.createdAt);
    return rows as DatabaseHotelImage[];
  }

  static async findImageById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseHotelImage | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(hotelImageTable)
      .where(eq(hotelImageTable.id, id))
      .limit(1);
    return (rows[0] as DatabaseHotelImage) || null;
  }

  static async createImage(
    db: D1Database,
    data: CreateHotelImageData,
  ): Promise<DatabaseHotelImage> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(hotelImageTable)
      .values({
        ...data,
        createdAt: nowIso,
      } as any)
      .returning();
    return created as DatabaseHotelImage;
  }

  static async updateImage(
    db: D1Database,
    id: number,
    data: Partial<DatabaseHotelImage>,
  ): Promise<DatabaseHotelImage | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );
    const rows = await database
      .update(hotelImageTable)
      .set(payload as any)
      .where(eq(hotelImageTable.id, id))
      .returning();
    return (rows[0] as DatabaseHotelImage) || null;
  }

  static async deleteImage(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(hotelImageTable)
      .where(eq(hotelImageTable.id, id))
      .returning();
    return rows.length > 0;
  }

  static async deleteImagesByHotelId(
    db: D1Database,
    hotelId: number,
  ): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(hotelImageTable)
      .where(eq(hotelImageTable.hotelId, hotelId))
      .returning();
    return rows.length > 0;
  }

  static async updateImageSortOrder(
    db: D1Database,
    id: number,
    sortOrder: number,
  ): Promise<DatabaseHotelImage | null> {
    const database = getDb(db);
    const rows = await database
      .update(hotelImageTable)
      .set({ sortOrder })
      .where(eq(hotelImageTable.id, id))
      .returning();
    return (rows[0] as DatabaseHotelImage) || null;
  }

  static async findHotelWithImages(
    db: D1Database,
    id: number,
  ): Promise<{ hotel: DatabaseHotel; images: DatabaseHotelImage[] } | null> {
    const hotel = await this.findById(db, id);
    if (!hotel) return null;

    const images = await this.findImagesByHotelId(db, id);
    return { hotel, images };
  }

  static async findFeaturesByHotelId(
    db: D1Database,
    hotelId: number,
  ): Promise<DatabaseFeature[]> {
    const database = getDb(db);
    const rows = await database
      .select({
        id: featureTable.id,
        code: featureTable.code,
        name: featureTable.name,
        description: featureTable.description,
        isVisible: featureTable.isVisible,
        sortOrder: featureTable.sortOrder,
        createdAt: featureTable.createdAt,
        updatedAt: featureTable.updatedAt,
      })
      .from(hotelFeatureTable)
      .innerJoin(featureTable, eq(hotelFeatureTable.featureId, featureTable.id))
      .where(eq(hotelFeatureTable.hotelId, hotelId))
      .orderBy(featureTable.sortOrder, featureTable.name);
    return rows as DatabaseFeature[];
  }

  static async findAmenitiesByHotelId(
    db: D1Database,
    hotelId: number,
  ): Promise<DatabaseAmenity[]> {
    const database = getDb(db);
    const rows = await database
      .select({
        id: amenityTable.id,
        code: amenityTable.code,
        name: amenityTable.name,
        icon: amenityTable.icon,
        createdAt: amenityTable.createdAt,
        updatedAt: amenityTable.updatedAt,
      })
      .from(hotelAmenityTable)
      .innerJoin(amenityTable, eq(hotelAmenityTable.amenityId, amenityTable.id))
      .where(eq(hotelAmenityTable.hotelId, hotelId))
      .orderBy(amenityTable.name);
    return rows as DatabaseAmenity[];
  }

  static async findHotelWithAllRelations(
    db: D1Database,
    id: number,
  ): Promise<DatabaseHotelWithRelations | null> {
    const hotel = await this.findById(db, id);
    if (!hotel) return null;

    const [images, features, amenities] = await Promise.all([
      this.findImagesByHotelId(db, id),
      this.findFeaturesByHotelId(db, id),
      this.findAmenitiesByHotelId(db, id),
    ]);

    return {
      ...hotel,
      images,
      features,
      amenities,
    };
  }

  static async findAllWithBasicRelations(
    db: D1Database,
    filters: HotelFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ hotels: DatabaseHotelWithRelations[]; total: number }> {
    const { hotels, total } = await this.findAll(db, filters, pagination);

    // For list view, we can get images, features, and amenities for all hotels
    const hotelsWithRelations: DatabaseHotelWithRelations[] = await Promise.all(
      hotels.map(async (hotel) => {
        const [images, features, amenities] = await Promise.all([
          this.findImagesByHotelId(db, hotel.id),
          this.findFeaturesByHotelId(db, hotel.id),
          this.findAmenitiesByHotelId(db, hotel.id),
        ]);

        return {
          ...hotel,
          images,
          features,
          amenities,
        };
      }),
    );

    return { hotels: hotelsWithRelations, total };
  }

  // Hotel-Amenity relationship methods
  static async addAmenitiesForHotel(
    db: D1Database,
    hotelId: number,
    amenityIds: number[],
  ): Promise<boolean> {
    if (amenityIds.length === 0) return true;

    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const values = amenityIds.map((amenityId) => ({
      hotelId,
      amenityId,
      createdAt: nowIso,
    }));

    await database.insert(hotelAmenityTable).values(values);
    return true;
  }

  static async removeAmenitiesForHotel(
    db: D1Database,
    hotelId: number,
  ): Promise<boolean> {
    const database = getDb(db);
    await database
      .delete(hotelAmenityTable)
      .where(eq(hotelAmenityTable.hotelId, hotelId));
    return true;
  }

  static async updateAmenitiesForHotel(
    db: D1Database,
    hotelId: number,
    amenityIds: number[],
  ): Promise<boolean> {
    // Remove existing amenities
    await this.removeAmenitiesForHotel(db, hotelId);

    // Add new amenities
    if (amenityIds.length > 0) {
      await this.addAmenitiesForHotel(db, hotelId, amenityIds);
    }

    return true;
  }

  // Hotel-Feature relationship methods
  static async addFeaturesForHotel(
    db: D1Database,
    hotelId: number,
    featureIds: number[],
  ): Promise<boolean> {
    if (featureIds.length === 0) return true;

    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const values = featureIds.map((featureId) => ({
      hotelId,
      featureId,
      createdAt: nowIso,
    }));

    await database.insert(hotelFeatureTable).values(values);
    return true;
  }

  static async removeFeaturesForHotel(
    db: D1Database,
    hotelId: number,
  ): Promise<boolean> {
    const database = getDb(db);
    await database
      .delete(hotelFeatureTable)
      .where(eq(hotelFeatureTable.hotelId, hotelId));
    return true;
  }

  static async updateFeaturesForHotel(
    db: D1Database,
    hotelId: number,
    featureIds: number[],
  ): Promise<boolean> {
    // Remove existing features
    await this.removeFeaturesForHotel(db, hotelId);

    // Add new features
    if (featureIds.length > 0) {
      await this.addFeaturesForHotel(db, hotelId, featureIds);
    }

    return true;
  }
}
