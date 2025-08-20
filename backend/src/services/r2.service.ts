export interface ImageUploadResult {
  url: string;
  key: string;
  size: number;
}

export class R2Service {
  /**
   * Upload an image file to R2 storage
   * @param r2Bucket - The R2 bucket binding from Cloudflare Workers
   * @param file - The file to upload
   * @param hotelId - The hotel ID for organizing files
   * @param publicBaseUrl - Base URL for constructing public URLs
   * @param entityType - Type of entity (hotels, room-types, etc.)
   * @param entityId - Optional entity ID for additional organization
   * @returns Promise with upload result containing URL and metadata
   */
  static async uploadImage(
    r2Bucket: R2Bucket,
    file: File,
    hotelId: number,
    publicBaseUrl: string,
    entityType: string = "hotels",
    entityId?: number,
  ): Promise<ImageUploadResult> {
    // Validate file type
    if (!this.isValidImageType(file.type)) {
      throw new Error(
        `Invalid image type: ${file.type}. Allowed types: JPEG, PNG, WebP`,
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(
        `File size too large: ${file.size} bytes. Maximum allowed: ${maxSize} bytes`,
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = this.getFileExtension(file.name);
    const entityPath = entityId ? `${entityType}/${entityId}` : entityType;
    const key = `hotels/${hotelId}/${entityPath}/images/${timestamp}-${this.sanitizeFilename(file.name)}${extension}`;

    try {
      // Upload to R2
      const object = await r2Bucket.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
          cacheControl: "public, max-age=31536000", // 1 year cache
        },
        customMetadata: {
          originalName: file.name,
          hotelId: hotelId.toString(),
          uploadTimestamp: timestamp.toString(),
        },
      });

      if (!object) {
        throw new Error("Failed to upload image to R2");
      }

      // Build public URL using configured base
      const publicUrl = publicBaseUrl
        ? `${publicBaseUrl.replace(/\/$/, "")}/${key}`
        : `r2://${key}`;

      return {
        url: publicUrl,
        key: key,
        size: file.size,
      };
    } catch (error) {
      console.error("R2 upload error:", error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete an image from R2 storage
   * @param r2Bucket - The R2 bucket binding
   * @param key - The object key to delete
   */
  static async deleteImage(r2Bucket: R2Bucket, key: string): Promise<void> {
    try {
      await r2Bucket.delete(key);
    } catch (error) {
      console.error("R2 delete error:", error);
      throw new Error(
        `Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get image metadata from R2
   * @param r2Bucket - The R2 bucket binding
   * @param key - The object key
   */
  static async getImageMetadata(
    r2Bucket: R2Bucket,
    key: string,
  ): Promise<R2Object | null> {
    try {
      return await r2Bucket.head(key);
    } catch (error) {
      console.error("R2 metadata error:", error);
      return null;
    }
  }

  /**
   * Validate if the file type is an allowed image type
   */
  private static isValidImageType(mimeType: string): boolean {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    return allowedTypes.includes(mimeType.toLowerCase());
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot > 0 ? filename.substring(lastDot) : "";
  }

  /**
   * Sanitize filename for safe storage
   */
  private static sanitizeFilename(filename: string): string {
    // Remove extension for sanitization
    const name = filename.substring(0, filename.lastIndexOf(".")) || filename;

    // Replace unsafe characters and limit length
    return name
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50)
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Batch delete multiple images
   * @param r2Bucket - The R2 bucket binding
   * @param keys - Array of object keys to delete
   */
  static async deleteMultipleImages(
    r2Bucket: R2Bucket,
    keys: string[],
  ): Promise<void> {
    try {
      // R2 doesn't have native batch delete, so we'll delete individually
      await Promise.all(keys.map((key) => r2Bucket.delete(key)));
    } catch (error) {
      console.error("R2 batch delete error:", error);
      throw new Error(
        `Failed to delete images: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
