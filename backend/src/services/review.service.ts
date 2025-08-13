import { ReviewRepository } from "../repositories/review.repository";

import type {
  CreateReviewRequestSchema,
  UpdateReviewRequestSchema,
  ReviewQueryParamsSchema,
} from "../schemas";
import type { z } from "zod";

export class ReviewService {
  static async createReview(
    db: D1Database,
    data: z.infer<typeof CreateReviewRequestSchema>,
  ) {
    return await ReviewRepository.create(db, data);
  }

  static async updateReview(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateReviewRequestSchema>,
  ) {
    const existing = await ReviewRepository.findById(db, id);
    if (!existing) throw new Error("Review not found");
    const updated = await ReviewRepository.update(db, id, data);
    if (!updated) throw new Error("Review not found");
    return updated;
  }

  static async getReviewById(db: D1Database, id: number) {
    return await ReviewRepository.findById(db, id);
  }

  static async getReviews(
    db: D1Database,
    query: z.infer<typeof ReviewQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, hotelId, status, search } = query as any;
    const { reviews, total } = await ReviewRepository.findAll(
      db,
      {
        hotelId: hotelId ? parseInt(hotelId as any, 10) : undefined,
        status,
        search,
      },
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return { items: reviews, pagination: { page, limit, total, totalPages } };
  }

  static async deleteReview(db: D1Database, id: number) {
    const existing = await ReviewRepository.findById(db, id);
    if (!existing) throw new Error("Review not found");
    return await ReviewRepository.delete(db, id);
  }
}
