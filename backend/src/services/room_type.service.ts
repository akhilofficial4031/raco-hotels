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
  /**
   * Convert a room type name to a URL-friendly slug format
   */
  private static nameToSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens and spaces
      .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/-+/g, "-") // Replace multiple consecutive hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Generate a unique slug by appending a counter if the slug already exists within a hotel
   * Uses a single database query for efficiency
   */
  private static async generateUniqueSlug(
    db: D1Database,
    hotelId: number,
    baseSlug: string,
    excludeId?: number,
  ): Promise<string> {
    // Get all existing slugs that start with the base slug within this hotel
    const existingSlugs = await RoomTypeRepository.findSlugsByPattern(
      db,
      hotelId,
      `${baseSlug}%`,
    );

    // For updates, check if the base slug is currently used by the room type being updated
    let baseSlugAvailable = !existingSlugs.includes(baseSlug);
    if (!baseSlugAvailable && excludeId) {
      // Check if the base slug belongs to the room type being updated
      const currentRoomTypeWithSlug = await RoomTypeRepository.findBySlug(
        db,
        hotelId,
        baseSlug,
      );
      baseSlugAvailable = currentRoomTypeWithSlug?.id === excludeId;
    }

    // If base slug is available, use it
    if (baseSlugAvailable) {
      return baseSlug;
    }

    // Extract counters from existing numbered slugs
    const counters: number[] = [];
    const baseSlugWithDash = `${baseSlug}-`;

    for (const slug of existingSlugs) {
      if (slug === baseSlug) {
        // Base slug exists, so we need at least counter 1
        counters.push(0);
      } else if (slug.startsWith(baseSlugWithDash)) {
        const suffix = slug.substring(baseSlugWithDash.length);
        const counter = parseInt(suffix, 10);
        if (!isNaN(counter) && counter > 0) {
          counters.push(counter);
        }
      }
    }

    // Find the next available counter
    const maxCounter = counters.length > 0 ? Math.max(...counters) : 0;
    return `${baseSlug}-${maxCounter + 1}`;
  }

  static async createRoomType(
    db: D1Database,
    data: z.infer<typeof CreateRoomTypeRequestSchema>,
  ) {
    // Note: Images will be uploaded separately via the upload endpoint
    // No need to validate images here as the frontend handles this in two steps:
    // 1. Create room type
    // 2. Upload images via separate endpoint
    // Note: offerPrice, offerStartDate, and offerEndDate are included in data

    // Auto-generate slug from room type name
    const baseSlug = this.nameToSlug(data.name);
    const uniqueSlug = await this.generateUniqueSlug(
      db,
      data.hotelId,
      baseSlug,
    );

    const created = await RoomTypeRepository.create(db, {
      ...data,
      slug: uniqueSlug,
    });

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
        data.addons.map((a: { addonId: number; priceCents: number }) => ({
          ...a,
          roomTypeId: created.id,
        })),
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

    // Note: Image validation is handled by the separate upload endpoint
    // The frontend manages images through a two-step process:
    // 1. Update room type data
    // 2. Upload/update images via separate endpoint
    // This allows for more flexible image management

    // Auto-generate slug from name if name is being updated
    let uniqueSlug: string | undefined;
    if (data.name && data.name !== existing.name) {
      const hotelId = data.hotelId || existing.hotelId;
      const baseSlug = this.nameToSlug(data.name);
      uniqueSlug = await this.generateUniqueSlug(db, hotelId, baseSlug, id);
    }

    const updateData = uniqueSlug ? { ...data, slug: uniqueSlug } : data;
    const updated = await RoomTypeRepository.update(db, id, updateData);
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
        data.addons.map((a: { addonId: number; priceCents: number }) => ({
          ...a,
          roomTypeId: id,
        })),
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

    const roomType = await this.getRoomTypeById(db, id);
    return roomType;
  }

  /**
   * Transform room type data for public API
   * - Remove offerStartDate and offerEndDate
   * - Set offerRate based on current date validation
   */
  private static transformToPublicRoomType(roomType: any): any {
    const now = new Date();
    const { offerPrice, offerStartDate, offerEndDate, ...rest } = roomType;

    // Check if offer is currently valid
    let offerRate = null;
    if (offerPrice && offerStartDate && offerEndDate) {
      const startDate = new Date(offerStartDate);
      const endDate = new Date(offerEndDate);

      // Set time to start of day for fair comparison
      now.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (now >= startDate && now <= endDate) {
        offerRate = offerPrice;
      }
    }

    return {
      ...rest,
      offerRate,
    };
  }

  static async getRoomTypesByHotelId(db: D1Database, hotelId: number) {
    const roomTypes = await RoomTypeRepository.findAllByHotelId(db, hotelId);

    // Fetch all related data for each room type
    const roomTypesWithRelations = await Promise.all(
      roomTypes.map(async (roomType) => {
        const [amenities, rooms, addons] = await Promise.all([
          RoomTypeRepository.getAmenities(db, roomType.id),
          RoomRepository.findByRoomTypeId(db, roomType.id),
          RoomTypeRepository.getAddons(db, roomType.id),
        ]);
        return { ...roomType, amenities, rooms, addons };
      }),
    );

    return roomTypesWithRelations;
  }

  /**
   * Get public room types by hotel ID with offer validation
   * This method is specifically for the public API endpoint
   */
  static async getPublicRoomTypesByHotelId(db: D1Database, hotelId: number) {
    const roomTypes = await RoomTypeRepository.findAllByHotelId(db, hotelId);

    // Fetch all related data for each room type and transform for public API
    const roomTypesWithRelations = await Promise.all(
      roomTypes.map(async (roomType) => {
        const [amenities, rooms, addons] = await Promise.all([
          RoomTypeRepository.getAmenities(db, roomType.id),
          RoomRepository.findByRoomTypeId(db, roomType.id),
          RoomTypeRepository.getAddons(db, roomType.id),
        ]);
        const roomTypeWithRelations = { ...roomType, amenities, rooms, addons };

        // Transform to public format (remove offer dates, add offerRate)
        return this.transformToPublicRoomType(roomTypeWithRelations);
      }),
    );
    return roomTypesWithRelations;
  }

  static async getRoomTypeById(db: D1Database, id: number) {
    const rt = await RoomTypeRepository.findById(db, id);
    if (!rt) return null;
    const amenities = await RoomTypeRepository.getAmenities(db, id);
    const rooms = await RoomRepository.findByRoomTypeId(db, id);
    const addons = await RoomTypeRepository.getAddons(db, id);
    return { ...rt, amenities, rooms, addons } as any;
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
        const [amenities, rooms, addons] = await Promise.all([
          RoomTypeRepository.getAmenities(db, roomType.id),
          RoomRepository.findByRoomTypeId(db, roomType.id),
          RoomTypeRepository.getAddons(db, roomType.id),
        ]);
        return { ...roomType, amenities, rooms, addons };
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

    // Validate image files
    if (imageFiles.length === 0) {
      throw new Error("At least one image file is required");
    }

    // If replacing images, check that we'll have at least one image after replacement
    if (replaceImages) {
      const existingImages = await RoomTypeRepository.findImagesByRoomTypeId(
        db,
        roomTypeId,
      );
      if (existingImages.length > 0 && imageFiles.length === 0) {
        throw new Error(
          "Cannot replace all images without providing new ones. Room type must have at least one image.",
        );
      }
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
      alt: imageFiles[index].name, // Use original filename for alt text
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

    // Check if this is the last image for the room type
    const allImages = await RoomTypeRepository.findImagesByRoomTypeId(
      db,
      image.roomTypeId,
    );
    if (allImages.length <= 1) {
      throw new Error(
        "Cannot delete the last image. Room type must have at least one image.",
      );
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
