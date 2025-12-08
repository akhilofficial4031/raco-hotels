import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { AttractionService } from "../services/attraction.service";

import type { AppContext } from "../types";

export class AttractionController {
  static async getAttractions(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);

        const filters: any = {
          search: query.search,
        };

        if (query.hotelId) {
          filters.hotelId = parseInt(query.hotelId, 10);
        }

        const result = await AttractionService.getAttractions(
          c.env.DB,
          filters,
        );

        // Calculate pagination
        const total = result.items.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const attractions = result.items.slice(offset, offset + limit);

        return ApiResponse.success(c, {
          attractions,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        });
      },
      "operation.fetchAttractionsFailed",
    );
  }

  static async getAttractionById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const attraction = await AttractionService.getAttractionById(
          c.env.DB,
          id,
        );

        if (!attraction) {
          return ApiResponse.notFound(c, "attraction.notFound");
        }

        return ApiResponse.success(c, { attraction });
      },
      "operation.fetchAttractionFailed",
    );
  }

  static async getAttractionBySlug(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const slug = c.req.param("slug");
        const attraction = await AttractionService.getAttractionBySlug(
          c.env.DB,
          slug,
        );

        if (!attraction) {
          return ApiResponse.notFound(c, "attraction.notFound");
        }

        return ApiResponse.success(c, { attraction });
      },
      "operation.fetchAttractionFailed",
    );
  }

  static async createAttraction(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();

        // Validate required fields
        if (
          !payload.hotelId ||
          !payload.name ||
          !payload.slug ||
          !payload.content
        ) {
          return ApiResponse.badRequest(c, "attraction.missingRequiredFields");
        }

        // Get R2 bucket and public URL from environment
        const r2Bucket = c.env.R2_BUCKET;
        const publicBaseUrl = c.env.R2_PUBLIC_BASE_URL || "";

        if (!r2Bucket) {
          return ApiResponse.internalError(c, "system.r2NotConfigured");
        }

        const attraction = await AttractionService.processAndCreateAttraction(
          c.env.DB,
          r2Bucket,
          payload,
          publicBaseUrl,
        );

        return ApiResponse.created(c, { attraction });
      },
      "operation.createAttractionFailed",
    );
  }

  static async updateAttraction(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();

        // Get R2 bucket and public URL from environment
        const r2Bucket = c.env.R2_BUCKET;
        const publicBaseUrl = c.env.R2_PUBLIC_BASE_URL || "";

        if (!r2Bucket) {
          return ApiResponse.internalError(c, "system.r2NotConfigured");
        }

        const attraction = await AttractionService.processAndUpdateAttraction(
          c.env.DB,
          r2Bucket,
          id,
          payload,
          publicBaseUrl,
        );

        return ApiResponse.success(c, { attraction });
      },
      "operation.updateAttractionFailed",
    );
  }

  static async deleteAttraction(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const deleted = await AttractionService.deleteAttraction(c.env.DB, id);

        if (!deleted) {
          return ApiResponse.notFound(c, "attraction.notFound");
        }

        return ApiResponse.success(c, {
          message: "Attraction deleted successfully",
        });
      },
      "operation.deleteAttractionFailed",
    );
  }
}
