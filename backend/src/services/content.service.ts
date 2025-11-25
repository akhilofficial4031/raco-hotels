import { R2Service } from "./r2.service";
import { ContentRepository } from "../repositories/content.repository";
import { ReviewRepository } from "../repositories/review.repository";

import type {
  HomePageContent,
  PublicHomePageContent,
  TestimonialItem,
} from "../types/content.types";
import type {
  DatabaseContentBlock,
  CreateContentBlockData,
  UpdateContentBlockData,
  ContentBlockFilters,
} from "../types";

export class ContentService {
  /**
   * Get all content blocks with optional filters
   */
  static async getContentBlocks(
    db: D1Database,
    filters: ContentBlockFilters = {},
  ): Promise<{ items: DatabaseContentBlock[] }> {
    const items = await ContentRepository.findAll(db, filters);
    return { items };
  }

  /**
   * Get a single content block by ID
   */
  static async getContentBlockById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseContentBlock | null> {
    return await ContentRepository.findById(db, id);
  }

  /**
   * Create a new content block
   */
  static async createContentBlock(
    db: D1Database,
    data: CreateContentBlockData,
  ): Promise<DatabaseContentBlock> {
    return await ContentRepository.create(db, data);
  }

  /**
   * Update an existing content block
   */
  static async updateContentBlock(
    db: D1Database,
    id: number,
    data: UpdateContentBlockData,
  ): Promise<DatabaseContentBlock> {
    const updated = await ContentRepository.update(db, id, data);
    if (!updated) {
      throw new Error("Content block not found");
    }
    return updated;
  }

  /**
   * Delete a content block
   */
  static async deleteContentBlock(
    db: D1Database,
    id: number,
  ): Promise<boolean> {
    return await ContentRepository.delete(db, id);
  }
  /**
   * Process homepage content by uploading base64 images to R2
   * and replacing them with public URLs
   */
  static async processAndSaveHomepageContent(
    db: D1Database,
    r2Bucket: R2Bucket,
    content: HomePageContent,
    publicBaseUrl: string,
  ): Promise<HomePageContent> {
    // Deep clone to avoid mutating original
    const processedContent = JSON.parse(
      JSON.stringify(content),
    ) as HomePageContent;

    // Track uploaded keys for rollback in case of error
    const uploadedKeys: string[] = [];

    try {
      // Process hero image
      if (
        processedContent.hero &&
        this.isBase64Image(processedContent.hero.image.src)
      ) {
        const result = await this.uploadBase64Image(
          r2Bucket,
          processedContent.hero.image.src,
          publicBaseUrl,
          "cms/hero",
        );
        processedContent.hero.image.src = result.url;
        uploadedKeys.push(result.key);
      }

      // Process aboutUs images
      if (
        processedContent.aboutUs &&
        this.isBase64Image(processedContent.aboutUs.badge.src)
      ) {
        const result = await this.uploadBase64Image(
          r2Bucket,
          processedContent.aboutUs.badge.src,
          publicBaseUrl,
          "cms/aboutUs/badge",
        );
        processedContent.aboutUs.badge.src = result.url;
        uploadedKeys.push(result.key);
      }

      if (
        processedContent.aboutUs &&
        this.isBase64Image(processedContent.aboutUs.image.src)
      ) {
        const result = await this.uploadBase64Image(
          r2Bucket,
          processedContent.aboutUs.image.src,
          publicBaseUrl,
          "cms/aboutUs/image",
        );
        processedContent.aboutUs.image.src = result.url;
        uploadedKeys.push(result.key);
      }

      // Process signatureExperiences images
      if (processedContent.signatureExperiences) {
        for (
          let i = 0;
          i < processedContent.signatureExperiences.images.length;
          i++
        ) {
          if (
            this.isBase64Image(
              processedContent.signatureExperiences.images[i].src,
            )
          ) {
            const result = await this.uploadBase64Image(
              r2Bucket,
              processedContent.signatureExperiences.images[i].src,
              publicBaseUrl,
              `cms/signatureExperiences/images/${i}`,
            );
            processedContent.signatureExperiences.images[i].src = result.url;
            uploadedKeys.push(result.key);
          }
        }

        if (
          this.isBase64Image(processedContent.signatureExperiences.badge.src)
        ) {
          const result = await this.uploadBase64Image(
            r2Bucket,
            processedContent.signatureExperiences.badge.src,
            publicBaseUrl,
            "cms/signatureExperiences/badge",
          );
          processedContent.signatureExperiences.badge.src = result.url;
          uploadedKeys.push(result.key);
        }
      }

      // Process gallery images
      if (processedContent.gallery) {
        for (let i = 0; i < processedContent.gallery.images.length; i++) {
          if (this.isBase64Image(processedContent.gallery.images[i].src)) {
            const result = await this.uploadBase64Image(
              r2Bucket,
              processedContent.gallery.images[i].src,
              publicBaseUrl,
              `cms/gallery/images/${i}`,
            );
            processedContent.gallery.images[i].src = result.url;
            uploadedKeys.push(result.key);
          }
        }
      }

      // Process gravityBar images
      if (
        processedContent.gravityBar &&
        this.isBase64Image(processedContent.gravityBar.image.src)
      ) {
        const result = await this.uploadBase64Image(
          r2Bucket,
          processedContent.gravityBar.image.src,
          publicBaseUrl,
          "cms/gravityBar/image",
        );
        processedContent.gravityBar.image.src = result.url;
        uploadedKeys.push(result.key);
      }

      if (
        processedContent.gravityBar &&
        this.isBase64Image(processedContent.gravityBar.badge.src)
      ) {
        const result = await this.uploadBase64Image(
          r2Bucket,
          processedContent.gravityBar.badge.src,
          publicBaseUrl,
          "cms/gravityBar/badge",
        );
        processedContent.gravityBar.badge.src = result.url;
        uploadedKeys.push(result.key);
      }

      // Process restaurant images
      if (processedContent.restaurant) {
        for (let i = 0; i < processedContent.restaurant.images.length; i++) {
          if (this.isBase64Image(processedContent.restaurant.images[i].src)) {
            const result = await this.uploadBase64Image(
              r2Bucket,
              processedContent.restaurant.images[i].src,
              publicBaseUrl,
              `cms/restaurant/images/${i}`,
            );
            processedContent.restaurant.images[i].src = result.url;
            uploadedKeys.push(result.key);
          }
        }

        if (this.isBase64Image(processedContent.restaurant.badge.src)) {
          const result = await this.uploadBase64Image(
            r2Bucket,
            processedContent.restaurant.badge.src,
            publicBaseUrl,
            "cms/restaurant/badge",
          );
          processedContent.restaurant.badge.src = result.url;
          uploadedKeys.push(result.key);
        }
      }

      // Save to database
      await ContentRepository.saveHomepageContent(db, processedContent);

      return processedContent;
    } catch (error) {
      // Rollback: delete all uploaded images
      console.error("Error processing content, rolling back uploads:", error);
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
   * Get homepage content from database
   */
  static async getHomepageContent(
    db: D1Database,
  ): Promise<HomePageContent | null> {
    const record = await ContentRepository.getHomepageContent(db);
    if (!record) return null;

    try {
      return JSON.parse(record.content) as HomePageContent;
    } catch (error) {
      console.error("Error parsing homepage content JSON:", error);
      return null;
    }
  }

  /**
   * Get public homepage content with testimonials from reviews
   * This combines CMS content with approved reviews
   */
  static async getPublicHomepageContent(
    db: D1Database,
  ): Promise<PublicHomePageContent | null> {
    // Get homepage content
    const content = await this.getHomepageContent(db);
    if (!content) return null;

    // Get approved reviews for testimonials (status = "Approved")
    const reviews = await ReviewRepository.findPublishedReviews(db, 10);

    // Transform reviews into testimonial items
    const testimonialItems: TestimonialItem[] = reviews.map((review) => ({
      name: review.userName || "Anonymous",
      location: "Guest", // Default location since we don't have this field in user table
      avatar: "/avatar.jpg", // Default avatar
      testimonial: review.body || review.title || "",
      rating: review.rating,
    }));

    // Combine content with testimonials
    const publicContent: PublicHomePageContent = {
      ...content,
      testimonials: {
        sectionTag: "TESTIMONIALS",
        title: "MEMORABLE STAYS, SHARED EXPERIENCES",
        items: testimonialItems,
      },
    };

    return publicContent;
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
    const filename = `${Date.now()}-cms-upload${extension}`;
    const file = new File([buffer], filename, { type: mimeType });

    // Upload to R2 (use 0 as hotelId since it's stored in JSON)
    return await R2Service.uploadImage(
      r2Bucket,
      file,
      0,
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
