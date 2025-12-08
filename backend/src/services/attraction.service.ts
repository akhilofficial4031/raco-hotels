import { R2Service } from "./r2.service";
import { AttractionRepository } from "../repositories/attraction.repository";

import type {
  Attraction,
  CreateAttractionData,
  UpdateAttractionData,
  AttractionFilters,
  AttractionContent,
} from "../types/attraction.interface";

export class AttractionService {
  /**
   * Get all attractions with optional filters
   */
  static async getAttractions(
    db: D1Database,
    filters: AttractionFilters = {},
  ): Promise<{ items: Attraction[] }> {
    const items = await AttractionRepository.findAll(db, filters);
    return { items };
  }

  /**
   * Get a single attraction by ID
   */
  static async getAttractionById(
    db: D1Database,
    id: number,
  ): Promise<Attraction | null> {
    return await AttractionRepository.findById(db, id);
  }

  /**
   * Get a single attraction by slug
   */
  static async getAttractionBySlug(
    db: D1Database,
    slug: string,
  ): Promise<Attraction | null> {
    return await AttractionRepository.findBySlug(db, slug);
  }

  /**
   * Process attraction content by uploading base64 images to R2
   * and replacing them with public URLs
   */
  static async processAndCreateAttraction(
    db: D1Database,
    r2Bucket: R2Bucket,
    data: CreateAttractionData,
    publicBaseUrl: string,
  ): Promise<Attraction> {
    // Process images in content
    const processedContent = await this.processAttractionImages(
      r2Bucket,
      data.content,
      publicBaseUrl,
      `attractions/${data.slug}`,
    );

    // Create attraction with processed content
    const created = await AttractionRepository.create(db, {
      ...data,
      content: processedContent,
    });

    // Fetch and return with relations
    const attraction = await AttractionRepository.findById(db, created.id);
    if (!attraction) {
      throw new Error("Failed to retrieve created attraction");
    }
    return attraction;
  }

  /**
   * Process attraction content by uploading base64 images to R2
   * and replacing them with public URLs for updates
   */
  static async processAndUpdateAttraction(
    db: D1Database,
    r2Bucket: R2Bucket,
    id: number,
    data: UpdateAttractionData,
    publicBaseUrl: string,
  ): Promise<Attraction> {
    // Get existing attraction to get slug
    const existing = await AttractionRepository.findById(db, id);
    if (!existing) {
      throw new Error("Attraction not found");
    }

    const slug = data.slug || existing.slug;

    // Process images in content if provided
    let processedContent = data.content;
    if (data.content) {
      processedContent = await this.processAttractionImages(
        r2Bucket,
        data.content,
        publicBaseUrl,
        `attractions/${slug}`,
      );
    }

    // Update attraction with processed content
    const updated = await AttractionRepository.update(db, id, {
      ...data,
      content: processedContent,
    });

    if (!updated) {
      throw new Error("Failed to update attraction");
    }

    // Fetch and return with relations
    const attraction = await AttractionRepository.findById(db, id);
    if (!attraction) {
      throw new Error("Failed to retrieve updated attraction");
    }
    return attraction;
  }

  /**
   * Delete an attraction
   */
  static async deleteAttraction(db: D1Database, id: number): Promise<boolean> {
    return await AttractionRepository.delete(db, id);
  }

  /**
   * Process all images in attraction content
   */
  private static async processAttractionImages(
    r2Bucket: R2Bucket,
    content: AttractionContent,
    publicBaseUrl: string,
    basePath: string,
  ): Promise<AttractionContent> {
    const processedContent = JSON.parse(
      JSON.stringify(content),
    ) as AttractionContent;
    const uploadedKeys: string[] = [];

    try {
      // Process hero image
      if (
        processedContent.hero &&
        this.isBase64Image(processedContent.hero.imageUrl)
      ) {
        const result = await this.uploadBase64Image(
          r2Bucket,
          processedContent.hero.imageUrl,
          publicBaseUrl,
          `${basePath}/hero`,
        );
        processedContent.hero.imageUrl = result.url;
        uploadedKeys.push(result.key);
      }

      // Process aboutSection images
      if (processedContent.aboutSection?.images) {
        for (let i = 0; i < processedContent.aboutSection.images.length; i++) {
          if (this.isBase64Image(processedContent.aboutSection.images[i])) {
            const result = await this.uploadBase64Image(
              r2Bucket,
              processedContent.aboutSection.images[i],
              publicBaseUrl,
              `${basePath}/about/${i}`,
            );
            processedContent.aboutSection.images[i] = result.url;
            uploadedKeys.push(result.key);
          }
        }
      }

      // Process carouselSection images
      if (processedContent.carouselSection?.images) {
        for (
          let i = 0;
          i < processedContent.carouselSection.images.length;
          i++
        ) {
          if (this.isBase64Image(processedContent.carouselSection.images[i])) {
            const result = await this.uploadBase64Image(
              r2Bucket,
              processedContent.carouselSection.images[i],
              publicBaseUrl,
              `${basePath}/carousel/${i}`,
            );
            processedContent.carouselSection.images[i] = result.url;
            uploadedKeys.push(result.key);
          }
        }
      }

      // Process feature images
      if (processedContent.feature?.images) {
        for (let i = 0; i < processedContent.feature.images.length; i++) {
          if (this.isBase64Image(processedContent.feature.images[i])) {
            const result = await this.uploadBase64Image(
              r2Bucket,
              processedContent.feature.images[i],
              publicBaseUrl,
              `${basePath}/feature/${i}`,
            );
            processedContent.feature.images[i] = result.url;
            uploadedKeys.push(result.key);
          }
        }
      }

      // Process gallery images
      if (processedContent.gallery?.images) {
        for (let i = 0; i < processedContent.gallery.images.length; i++) {
          if (this.isBase64Image(processedContent.gallery.images[i])) {
            const result = await this.uploadBase64Image(
              r2Bucket,
              processedContent.gallery.images[i],
              publicBaseUrl,
              `${basePath}/gallery/${i}`,
            );
            processedContent.gallery.images[i] = result.url;
            uploadedKeys.push(result.key);
          }
        }
      }

      return processedContent;
    } catch (error) {
      // Rollback: delete all uploaded images
      console.error(
        "Error processing attraction images, rolling back uploads:",
        error,
      );
      if (uploadedKeys.length > 0) {
        try {
          await R2Service.deleteMultipleImages(r2Bucket, uploadedKeys);
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
      }
      throw error;
    }
  }

  /**
   * Check if a string is a base64 encoded image
   */
  private static isBase64Image(str: string): boolean {
    if (!str || typeof str !== "string") return false;
    return str.startsWith("data:image/");
  }

  /**
   * Upload a base64 encoded image to R2
   */
  private static async uploadBase64Image(
    r2Bucket: R2Bucket,
    base64String: string,
    publicBaseUrl: string,
    entityType: string,
  ): Promise<{ url: string; key: string }> {
    // Extract mime type and base64 data
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid base64 image format");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Convert base64 to buffer
    const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Get file extension from mime type
    const extension = this.getExtensionFromMimeType(mimeType);

    // Create a File-like object
    const filename = `${Date.now()}-attraction-upload${extension}`;
    const file = new File([buffer], filename, { type: mimeType });

    // Upload to R2
    return await R2Service.uploadImage(
      r2Bucket,
      file,
      0, // hotelId not needed for attractions
      publicBaseUrl,
      entityType,
    );
  }

  /**
   * Get file extension from MIME type
   */
  private static getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    return map[mimeType.toLowerCase()] || ".jpg";
  }
}
