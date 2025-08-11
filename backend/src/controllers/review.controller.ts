import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { ReviewService } from "../services/review.service";

import type { AppContext } from "../types";

export class ReviewController {
  static async getReviews(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const result = await ReviewService.getReviews(c.env.DB, {
          page: String(page),
          limit: String(limit),
          hotelId: query.hotelId,
          status: query.status,
          search: query.search,
        } as any);
        return ApiResponse.success(c, {
          reviews: result.items,
          pagination: result.pagination,
        });
      },
      "operation.fetchReviewsFailed",
    );
  }

  static async getReviewById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await ReviewService.getReviewById(c.env.DB, id);
        if (!item) return ApiResponse.notFound(c, "Review not found");
        return ApiResponse.success(c, { review: item });
      },
      "operation.fetchReviewFailed",
    );
  }

  static async createReview(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const created = await ReviewService.createReview(c.env.DB, payload);
        return ApiResponse.created(c, { review: created });
      },
      "operation.createReviewFailed",
    );
  }

  static async updateReview(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        try {
          const updated = await ReviewService.updateReview(
            c.env.DB,
            id,
            payload,
          );
          return ApiResponse.success(c, { review: updated });
        } catch (e) {
          if (e instanceof Error && e.message === "Review not found")
            return ApiResponse.notFound(c, e.message);
          throw e;
        }
      },
      "operation.updateReviewFailed",
    );
  }

  static async deleteReview(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await ReviewService.deleteReview(c.env.DB, id);
          if (!deleted) return ApiResponse.notFound(c, "Review not found");
          return ApiResponse.success(c, {});
        } catch (e) {
          if (e instanceof Error && e.message === "Review not found")
            return ApiResponse.notFound(c, e.message);
          throw e;
        }
      },
      "operation.deleteReviewFailed",
    );
  }
}
