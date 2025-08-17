import { ApiResponse, HotelResponse, handleAsyncRoute } from "../lib/responses";
import { HotelService } from "../services/hotel.service";

import type { AppContext } from "../types";

export class HotelController {
  static async getHotels(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const isActive = query.isActive
          ? parseInt(query.isActive, 10)
          : undefined;
        const result = await HotelService.getHotels(c.env.DB, {
          page: String(page),
          limit: String(limit),
          city: query.city,
          countryCode: query.countryCode,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          search: query.search,
        } as any);
        return HotelResponse.hotelsList(c, result.items, result.pagination);
      },
      "operation.fetchHotelsFailed",
    );
  }

  static async getHotelById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const result = await HotelService.getHotelWithImages(c.env.DB, id);
        if (!result) return HotelResponse.hotelNotFound(c);
        return HotelResponse.hotelWithImagesRetrieved(
          c,
          result.hotel,
          result.images,
        );
      },
      "operation.fetchHotelFailed",
    );
  }

  static async createHotel(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const contentType = c.req.header("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
          // Handle multipart form data (hotel with images)
          const formData = await c.req.formData();

          // Extract hotel data from form
          const hotelDataStr = formData.get("hotelData");
          if (!hotelDataStr || typeof hotelDataStr !== "string") {
            return ApiResponse.badRequest(c, "Hotel data is required");
          }

          let hotelData;
          try {
            hotelData = JSON.parse(hotelDataStr);
          } catch {
            return ApiResponse.badRequest(c, "Invalid hotel data JSON");
          }

          // Extract image files
          const imageFiles: File[] = [];
          for (const [key, value] of formData.entries()) {
            if (key.startsWith("images[") && value instanceof File) {
              imageFiles.push(value);
            }
          }

          try {
            const result = await HotelService.createHotelWithImages(
              c.env.DB,
              c.env.R2_BUCKET,
              hotelData,
              imageFiles,
              c.env.R2_PUBLIC_BASE_URL || "",
            );

            return HotelResponse.hotelWithImagesCreated(
              c,
              result.hotel,
              result.images,
            );
          } catch (e) {
            if (e instanceof Error && e.message.includes("slug")) {
              return ApiResponse.conflict(c, e.message);
            }
            throw e;
          }
        } else {
          // Handle JSON payload (hotel only)
          const payload = await c.req.json();
          try {
            const created = await HotelService.createHotel(c.env.DB, payload);
            // Return as hotel with images format but with empty images array
            return HotelResponse.hotelWithImagesCreated(c, created, []);
          } catch (e) {
            if (e instanceof Error && e.message.includes("slug")) {
              return ApiResponse.conflict(c, e.message);
            }
            throw e;
          }
        }
      },
      "operation.createHotelFailed",
    );
  }

  static async updateHotel(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const contentType = c.req.header("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
          // Handle multipart form data (hotel with image management)
          const formData = await c.req.formData();

          // Extract hotel data from form
          const hotelDataStr = formData.get("hotelData");
          if (!hotelDataStr || typeof hotelDataStr !== "string") {
            return ApiResponse.badRequest(c, "Hotel data is required");
          }

          let hotelData;
          try {
            hotelData = JSON.parse(hotelDataStr);
          } catch {
            return ApiResponse.badRequest(c, "Invalid hotel data JSON");
          }

          // Extract replace images flag
          const replaceImages = formData.get("replaceImages") === "true";

          // Extract image files
          const imageFiles: File[] = [];
          for (const [key, value] of formData.entries()) {
            if (key.startsWith("images[") && value instanceof File) {
              imageFiles.push(value);
            }
          }

          try {
            const result = await HotelService.updateHotelWithImages(
              c.env.DB,
              c.env.R2_BUCKET,
              id,
              hotelData,
              imageFiles.length > 0 ? imageFiles : undefined,
              replaceImages,
              c.env.R2_PUBLIC_BASE_URL || "",
            );

            return HotelResponse.hotelWithImagesUpdated(
              c,
              result.hotel,
              result.images,
            );
          } catch (e) {
            if (e instanceof Error) {
              if (e.message === "Hotel not found")
                return HotelResponse.hotelNotFound(c);
              if (e.message.includes("slug")) {
                return ApiResponse.conflict(c, e.message);
              }
            }
            throw e;
          }
        } else {
          // Handle JSON payload (hotel data only)
          const payload = await c.req.json();
          try {
            const updated = await HotelService.updateHotel(
              c.env.DB,
              id,
              payload,
            );
            // Get current images to return complete hotel with images
            const images = await HotelService.getHotelImages(c.env.DB, id);
            return HotelResponse.hotelWithImagesUpdated(c, updated, images);
          } catch (e) {
            if (e instanceof Error) {
              if (e.message === "Hotel not found")
                return HotelResponse.hotelNotFound(c);
              if (e.message.includes("slug")) {
                return ApiResponse.conflict(c, e.message);
              }
            }
            throw e;
          }
        }
      },
      "operation.updateHotelFailed",
    );
  }
  static async deleteHotel(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await HotelService.deleteHotel(c.env.DB, id);
          if (!deleted) return HotelResponse.hotelNotFound(c);
          return HotelResponse.hotelDeleted(c);
        } catch (e) {
          if (e instanceof Error && e.message === "Hotel not found") {
            return HotelResponse.hotelNotFound(c);
          }
          throw e;
        }
      },
      "operation.deleteHotelFailed",
    );
  }

  static async deleteHotelImage(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const imageId = parseInt(c.req.param("imageId"), 10);
        try {
          const deleted = await HotelService.deleteHotelImage(
            c.env.DB,
            c.env.R2_BUCKET,
            imageId,
          );
          if (!deleted) return ApiResponse.notFound(c, "Image not found");
          return HotelResponse.hotelImageDeleted(c);
        } catch (e) {
          if (e instanceof Error && e.message === "Image not found") {
            return ApiResponse.notFound(c, "Image not found");
          }
          throw e;
        }
      },
      "operation.deleteHotelImageFailed",
    );
  }

  static async updateImageSortOrder(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const imageId = parseInt(c.req.param("imageId"), 10);
        const payload = await c.req.json();

        if (typeof payload.sortOrder !== "number") {
          return ApiResponse.badRequest(c, "Sort order must be a number");
        }

        try {
          const updated = await HotelService.updateImageSortOrder(
            c.env.DB,
            imageId,
            payload.sortOrder,
          );
          return HotelResponse.hotelImageUpdated(c, updated);
        } catch (e) {
          if (e instanceof Error && e.message === "Image not found") {
            return ApiResponse.notFound(c, "Image not found");
          }
          throw e;
        }
      },
      "operation.updateImageSortOrderFailed",
    );
  }
}
