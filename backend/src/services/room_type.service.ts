import { R2Service } from "./r2.service";
import { RoomRepository } from "../repositories/room.repository";
import { RoomTypeRepository } from "../repositories/room_type.repository";

import type {
  CreateRoomTypeRequestSchema,
  UpdateRoomTypeRequestSchema,
  RoomTypeQueryParamsSchema,
} from "../schemas";
import type { ImageUploadResult } from "./r2.service";
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

    // Addons
    if (data.addons && data.addons.length) {
      await RoomTypeRepository.setAddons(
        db,
        created.id,
        data.addons.map((a) => ({ ...a, roomTypeId: created.id })),
      );
    }

    const images = await RoomTypeRepository.findImagesByRoomTypeId(
      db,
      created.id,
    );
    const amenities = await RoomTypeRepository.getAmenities(db, created.id);
    const rooms = await RoomRepository.findByRoomTypeId(db, created.id);
    const addons = await RoomTypeRepository.getAddons(db, created.id);
    return { ...created, images, amenities, rooms, addons } as any;
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

    // Replace addons if provided
    if (Array.isArray(data.addons)) {
      await RoomTypeRepository.setAddons(
        db,
        id,
        data.addons.map((a) => ({ ...a, roomTypeId: id })),
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
    const rooms = await RoomRepository.findByRoomTypeId(db, id);
    const addons = await RoomTypeRepository.getAddons(db, id);
    return { ...updated, images, amenities, rooms, addons } as any;
  }

  static async getRoomTypeById(db: D1Database, id: number) {
    const rt = await RoomTypeRepository.findById(db, id);
    if (!rt) return null;
    const images = await RoomTypeRepository.findImagesByRoomTypeId(db, id);
    const amenities = await RoomTypeRepository.getAmenities(db, id);
    const rooms = await RoomRepository.findByRoomTypeId(db, id);
    const addons = await RoomTypeRepository.getAddons(db, id);
    return { ...rt, images, amenities, rooms, addons } as any;
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

    // Fetch all related data for each room type
    const roomTypesWithRelations = await Promise.all(
      roomTypes.map(async (roomType) => {
        const [images, amenities, rooms, addons] = await Promise.all([
          RoomTypeRepository.findImagesByRoomTypeId(db, roomType.id),
          RoomTypeRepository.getAmenities(db, roomType.id),
          RoomRepository.findByRoomTypeId(db, roomType.id),
          RoomTypeRepository.getAddons(db, roomType.id),
        ]);
        return { ...roomType, images, amenities, rooms, addons };
      }),
    );

    const totalPages = Math.ceil(total / limit);
    return {
      items: roomTypesWithRelations,
      pagination: { page, limit, total, totalPages },
    };
  }

  static async deleteRoomType(db: D1Database, id: number) {
    const existing = await RoomTypeRepository.findById(db, id);
    if (!existing) throw new Error("Room type not found");
    return await RoomTypeRepository.delete(db, id);
  }

  /**
   * Upload images for a room type using R2 service
   */
  static async uploadRoomTypeImages(
    db: D1Database,
    r2Bucket: R2Bucket,
    roomTypeId: number,
    imageFiles: File[],
    replaceImages: boolean = false,
    publicBaseUrl: string,
  ): Promise<any[]> {
    // Verify room type exists
    const roomType = await RoomTypeRepository.findById(db, roomTypeId);
    if (!roomType) {
      throw new Error("Room type not found");
    }

    // Delete existing images if replacing
    if (replaceImages) {
      await this.deleteAllRoomTypeImages(db, r2Bucket, roomTypeId);
    }

    // Upload images to R2
    const uploadResults: ImageUploadResult[] = [];
    for (const file of imageFiles) {
      try {
        const result = await R2Service.uploadImage(
          r2Bucket,
          file,
          roomType.hotelId, // Use hotelId for folder organization
          publicBaseUrl,
          "room-types",
          roomTypeId,
        );
        uploadResults.push(result);
      } catch (error) {
        console.error(`Failed to upload image ${file.name}:`, error);
        throw error; // Fail fast on upload errors
      }
    }

    // Create image records in database
    const imageRecords = uploadResults.map((result, index) => ({
      roomTypeId,
      url: result.url,
      alt: null,
      sortOrder: index,
    }));

    await RoomTypeRepository.createImages(db, imageRecords);

    // Return the created images
    return await RoomTypeRepository.findImagesByRoomTypeId(db, roomTypeId);
  }

  /**
   * Delete a specific room type image
   */
  static async deleteRoomTypeImage(
    db: D1Database,
    r2Bucket: R2Bucket,
    imageId: number,
  ): Promise<boolean> {
    // Get image record
    const image = await RoomTypeRepository.findImageById(db, imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Extract R2 key from URL
    const key = this.extractR2KeyFromUrl(image.url);

    try {
      // Delete from R2
      if (key) {
        await R2Service.deleteImage(r2Bucket, key);
      }
    } catch (error) {
      console.error("Failed to delete image from R2:", error);
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete from database
    return await RoomTypeRepository.deleteImage(db, imageId);
  }

  /**
   * Delete all images for a room type
   */
  static async deleteAllRoomTypeImages(
    db: D1Database,
    r2Bucket: R2Bucket,
    roomTypeId: number,
  ): Promise<boolean> {
    // Get all images for the room type
    const images = await RoomTypeRepository.findImagesByRoomTypeId(
      db,
      roomTypeId,
    );

    // Extract R2 keys
    const keys = images
      .map((image) => this.extractR2KeyFromUrl(image.url))
      .filter((key) => key !== null) as string[];

    try {
      // Delete from R2
      if (keys.length > 0) {
        await R2Service.deleteMultipleImages(r2Bucket, keys);
      }
    } catch (error) {
      console.error("Failed to delete images from R2:", error);
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete from database
    return await RoomTypeRepository.deleteImagesByRoomTypeId(db, roomTypeId);
  }

  /**
   * Update image sort order
   */
  static async updateRoomTypeImageSortOrder(
    db: D1Database,
    imageId: number,
    sortOrder: number,
  ): Promise<any> {
    const updated = await RoomTypeRepository.updateImageSortOrder(
      db,
      imageId,
      sortOrder,
    );
    if (!updated) {
      throw new Error("Image not found");
    }
    return updated;
  }

  /**
   * Extract R2 key from public URL
   * This method needs to be adapted based on your actual R2 URL structure
   */
  private static extractR2KeyFromUrl(url: string): string | null {
    try {
      // Assuming URL structure: https://your-r2-domain.com/hotels/123/images/filename.jpg
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Remove leading slash and return the key
      return pathname.startsWith("/") ? pathname.substring(1) : pathname;
    } catch (error) {
      console.error("Failed to extract R2 key from URL:", url, error);
      return null;
    }
  }
}
