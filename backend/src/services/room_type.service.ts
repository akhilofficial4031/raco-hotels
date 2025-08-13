import { RoomTypeRepository } from "../repositories/room_type.repository";

import type {
  CreateRoomTypeRequestSchema,
  UpdateRoomTypeRequestSchema,
  RoomTypeQueryParamsSchema,
} from "../schemas";
import type { z } from "zod";

export class RoomTypeService {
  static async createRoomType(
    db: D1Database,
    data: z.infer<typeof CreateRoomTypeRequestSchema>,
  ) {
    // Enforce slug uniqueness per hotel
    const existing = await RoomTypeRepository.findBySlug(
      db,
      data.hotelId,
      data.slug,
    );
    if (existing) throw new Error("Room type slug already in use");

    const created = await RoomTypeRepository.create(db, data);

    // Images
    if (data.images && data.images.length) {
      await RoomTypeRepository.createImages(
        db,
        data.images.map((img, idx) => ({
          roomTypeId: created.id,
          url: img.url,
          alt: img.alt ?? null,
          sortOrder: img.sortOrder ?? idx,
        })),
      );
    }

    // Amenities
    if (data.amenityIds && data.amenityIds.length) {
      await RoomTypeRepository.setAmenities(db, created.id, data.amenityIds);
    }

    const images = await RoomTypeRepository.findImagesByRoomTypeId(
      db,
      created.id,
    );
    const amenities = await RoomTypeRepository.getAmenities(db, created.id);
    return { ...created, images, amenities } as any;
  }

  static async updateRoomType(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateRoomTypeRequestSchema>,
  ) {
    const existing = await RoomTypeRepository.findById(db, id);
    if (!existing) throw new Error("Room type not found");

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await RoomTypeRepository.findBySlug(
        db,
        data.hotelId || existing.hotelId,
        data.slug,
      );
      if (slugTaken) throw new Error("Room type slug already in use");
    }

    const updated = await RoomTypeRepository.update(db, id, data);
    if (!updated) throw new Error("Room type not found");

    // Replace amenities if provided
    if (Array.isArray(data.amenityIds)) {
      await RoomTypeRepository.setAmenities(
        db,
        id,
        data.amenityIds as number[],
      );
    }

    // Replace images if provided
    if (Array.isArray(data.images)) {
      await RoomTypeRepository.deleteImagesByRoomTypeId(db, id);
      await RoomTypeRepository.createImages(
        db,
        data.images.map((img, idx) => ({
          roomTypeId: id,
          url: img.url,
          alt: img.alt ?? null,
          sortOrder: img.sortOrder ?? idx,
        })),
      );
    }

    const images = await RoomTypeRepository.findImagesByRoomTypeId(db, id);
    const amenities = await RoomTypeRepository.getAmenities(db, id);
    return { ...updated, images, amenities } as any;
  }

  static async getRoomTypeById(db: D1Database, id: number) {
    const rt = await RoomTypeRepository.findById(db, id);
    if (!rt) return null;
    const images = await RoomTypeRepository.findImagesByRoomTypeId(db, id);
    const amenities = await RoomTypeRepository.getAmenities(db, id);
    return { ...rt, images, amenities } as any;
  }

  static async getRoomTypes(
    db: D1Database,
    query: z.infer<typeof RoomTypeQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, hotelId, isActive, search } = query as any;
    const { roomTypes, total } = await RoomTypeRepository.findAll(
      db,
      {
        hotelId: hotelId ? parseInt(hotelId as any, 10) : undefined,
        isActive: typeof isActive === "number" ? isActive : undefined,
        search,
      },
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return {
      items: roomTypes,
      pagination: { page, limit, total, totalPages },
    };
  }

  static async deleteRoomType(db: D1Database, id: number) {
    const existing = await RoomTypeRepository.findById(db, id);
    if (!existing) throw new Error("Room type not found");
    return await RoomTypeRepository.delete(db, id);
  }
}
