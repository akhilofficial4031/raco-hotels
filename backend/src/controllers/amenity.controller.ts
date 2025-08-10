import {
  AmenityResponse,
  ApiResponse,
  handleAsyncRoute,
} from "../lib/responses";
import { AmenityService } from "../services/amenity.service";

import type { AppContext } from "../types";

export class AmenityController {
  static async getAmenities(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const isActive = query.isActive
          ? parseInt(query.isActive, 10)
          : undefined;
        const result = await AmenityService.getAmenities(c.env.DB, {
          page: String(page),
          limit: String(limit),
          city: query.city,
          countryCode: query.countryCode,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          search: query.search,
        } as any);
        return AmenityResponse.amenitiesList(
          c,
          result.items,
          result.pagination,
        );
      },
      "operation.fetchAmenitiesFailed",
    );
  }

  static async getAmenityById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await AmenityService.getAmenityById(c.env.DB, id);
        if (!item) return AmenityResponse.amenityNotFound(c);
        return AmenityResponse.amenityRetrieved(c, item);
      },
      "operation.fetchAmenityFailed",
    );
  }

  static async createAmenity(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        try {
          const created = await AmenityService.createAmenity(c.env.DB, payload);
          return AmenityResponse.amenityCreated(c, created);
        } catch (e) {
          if (e instanceof Error && e.message.includes("slug")) {
            return ApiResponse.conflict(c, e.message);
          }
          throw e;
        }
      },
      "operation.createAmenityFailed",
    );
  }

  static async updateAmenity(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        try {
          const updated = await AmenityService.updateAmenity(
            c.env.DB,
            id,
            payload,
          );
          return AmenityResponse.amenityUpdated(c, updated);
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === "Amenity not found")
              return AmenityResponse.amenityNotFound(c);
          }
          throw e;
        }
      },
      "operation.updateAmenityFailed",
    );
  }
  static async deleteAmenity(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await AmenityService.deleteAmenity(c.env.DB, id);
          if (!deleted) return AmenityResponse.amenityNotFound(c);
          return AmenityResponse.amenityDeleted(c);
        } catch (e) {
          if (e instanceof Error && e.message === "Amenity not found") {
            return AmenityResponse.amenityNotFound(c);
          }
          throw e;
        }
      },
      "operation.deleteAmenityFailed",
    );
  }
}
