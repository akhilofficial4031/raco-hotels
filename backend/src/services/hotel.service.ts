import { R2Service } from "./r2.service";
import { HotelRepository } from "../repositories/hotel.repository";

import type {
  CreateHotelRequestSchema,
  UpdateHotelRequestSchema,
  HotelQueryParamsSchema,
} from "../schemas";
import type {
  DatabaseHotel,
  DatabaseHotelImage,
  CreateHotelImageData,
  DatabaseHotelWithRelations,
} from "../types";
import type { z } from "zod";

export class HotelService {
  static async createHotel(
    db: D1Database,
    data: z.infer<typeof CreateHotelRequestSchema>,
  ) {
    // If slug provided, ensure uniqueness
    if (data.slug) {
      const existing = await HotelRepository.findBySlug(db, data.slug);
      if (existing) {
        throw new Error("Hotel slug already in use");
      }
    }

    return await HotelRepository.create(db, {
      ...data,
      isActive: data.isActive ?? 1,
    });
  }

  static async updateHotel(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateHotelRequestSchema>,
  ) {
    const existing = await HotelRepository.findById(db, id);
    if (!existing) {
      throw new Error("Hotel not found");
    }
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await HotelRepository.findBySlug(db, data.slug);
      if (slugTaken) {
        throw new Error("Hotel slug already in use");
      }
    }
    const updated = await HotelRepository.update(db, id, data);
    if (!updated) {
      throw new Error("Hotel not found");
    }
    return updated;
  }

  static async getHotelById(db: D1Database, id: number) {
    return await HotelRepository.findById(db, id);
  }

  static async getHotels(
    db: D1Database,
    query: z.infer<typeof HotelQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, city, countryCode, isActive, search } = query;
    const { hotels, total } = await HotelRepository.findAllWithBasicRelations(
      db,
      { city, countryCode, isActive, search },
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return {
      items: hotels,
      pagination: { page, limit, total, totalPages },
    };
  }

  static async deleteHotel(db: D1Database, id: number) {
    const existing = await HotelRepository.findById(db, id);
    if (!existing) {
      throw new Error("Hotel not found");
    }
    return await HotelRepository.delete(db, id);
  }

  // Hotel Image methods
  static async getHotelWithImages(
    db: D1Database,
    id: number,
  ): Promise<{ hotel: DatabaseHotel; images: DatabaseHotelImage[] } | null> {
    return await HotelRepository.findHotelWithImages(db, id);
  }

  static async getHotelWithAllRelations(
    db: D1Database,
    id: number,
  ): Promise<DatabaseHotelWithRelations | null> {
    return await HotelRepository.findHotelWithAllRelations(db, id);
  }

  static async createHotelWithImages(
    db: D1Database,
    r2Bucket: R2Bucket,
    hotelData: z.infer<typeof CreateHotelRequestSchema>,
    imageFiles: File[],
    publicBaseUrl: string,
  ): Promise<{ hotel: DatabaseHotel; images: DatabaseHotelImage[] }> {
    // First create the hotel
    const hotel = await this.createHotel(db, hotelData);

    // Then upload and create images
    const images: DatabaseHotelImage[] = [];

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          // Upload to R2
          const uploadResult = await R2Service.uploadImage(
            r2Bucket,
            file,
            hotel.id,
            publicBaseUrl,
          );

          // Save to database
          const imageData: CreateHotelImageData = {
            hotelId: hotel.id,
            url: uploadResult.url,
            alt: file.name,
            sortOrder: i,
          };

          const savedImage = await HotelRepository.createImage(db, imageData);
          images.push(savedImage);
        } catch (error) {
          console.error(`Failed to upload image ${file.name}:`, error);
          // Continue with other images even if one fails
        }
      }
    }

    return { hotel, images };
  }

  static async updateHotelWithImages(
    db: D1Database,
    r2Bucket: R2Bucket,
    id: number,
    hotelData: z.infer<typeof UpdateHotelRequestSchema>,
    imageFiles?: File[],
    replaceImages: boolean = false,
    publicBaseUrl?: string,
  ): Promise<{ hotel: DatabaseHotel; images: DatabaseHotelImage[] }> {
    // Update hotel data
    const hotel = await this.updateHotel(db, id, hotelData);

    // Get current images
    let images = await HotelRepository.findImagesByHotelId(db, id);

    // Handle image updates
    if (imageFiles && imageFiles.length > 0) {
      if (replaceImages) {
        // Delete all existing images
        await this.deleteAllHotelImages(db, r2Bucket, id);
        images = [];
      }

      // Upload new images
      const startingSortOrder = images.length;
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          // Upload to R2
          const uploadResult = await R2Service.uploadImage(
            r2Bucket,
            file,
            id,
            publicBaseUrl || "",
          );

          // Save to database
          const imageData: CreateHotelImageData = {
            hotelId: id,
            url: uploadResult.url,
            alt: file.name,
            sortOrder: startingSortOrder + i,
          };

          const savedImage = await HotelRepository.createImage(db, imageData);
          images.push(savedImage);
        } catch (error) {
          console.error(`Failed to upload image ${file.name}:`, error);
          // Continue with other images even if one fails
        }
      }
    }

    return { hotel, images };
  }

  static async addHotelImage(
    db: D1Database,
    r2Bucket: R2Bucket,
    hotelId: number,
    imageFile: File,
    alt?: string,
    publicBaseUrl?: string,
  ): Promise<DatabaseHotelImage> {
    // Verify hotel exists
    const hotel = await HotelRepository.findById(db, hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    // Upload to R2
    const uploadResult = await R2Service.uploadImage(
      r2Bucket,
      imageFile,
      hotelId,
      publicBaseUrl || "",
    );

    // Get next sort order
    const existingImages = await HotelRepository.findImagesByHotelId(
      db,
      hotelId,
    );
    const sortOrder = existingImages.length;

    // Save to database
    const imageData: CreateHotelImageData = {
      hotelId,
      url: uploadResult.url,
      alt: alt || imageFile.name,
      sortOrder,
    };

    return await HotelRepository.createImage(db, imageData);
  }

  static async deleteHotelImage(
    db: D1Database,
    r2Bucket: R2Bucket,
    imageId: number,
  ): Promise<boolean> {
    // Get image details
    const image = await HotelRepository.findImageById(db, imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Extract R2 key from URL (this depends on your URL structure)
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
    return await HotelRepository.deleteImage(db, imageId);
  }

  static async deleteAllHotelImages(
    db: D1Database,
    r2Bucket: R2Bucket,
    hotelId: number,
  ): Promise<boolean> {
    // Get all images for the hotel
    const images = await HotelRepository.findImagesByHotelId(db, hotelId);

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
    return await HotelRepository.deleteImagesByHotelId(db, hotelId);
  }

  static async updateImageSortOrder(
    db: D1Database,
    imageId: number,
    sortOrder: number,
  ): Promise<DatabaseHotelImage> {
    const updated = await HotelRepository.updateImageSortOrder(
      db,
      imageId,
      sortOrder,
    );
    if (!updated) {
      throw new Error("Image not found");
    }
    return updated;
  }

  static async getHotelImages(
    db: D1Database,
    hotelId: number,
  ): Promise<DatabaseHotelImage[]> {
    // Verify hotel exists
    const hotel = await HotelRepository.findById(db, hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    return await HotelRepository.findImagesByHotelId(db, hotelId);
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
