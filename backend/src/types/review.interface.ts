import type {
  HotelScopedEntity,
  ReviewStatus,
  HotelScopedFilters,
} from "./common.interface";

/**
 * Database representation of a review
 */
export interface DatabaseReview extends HotelScopedEntity {
  userId: number | null;
  bookingId: number | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  publishedAt: string | null;
}

/**
 * Data required to create a new review
 */
export interface CreateReviewData {
  hotelId: number;
  userId?: number | null;
  bookingId?: number | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  status?: ReviewStatus;
}

/**
 * Data that can be updated for a review
 */
export interface UpdateReviewData
  extends Partial<Omit<CreateReviewData, "hotelId">> {
  publishedAt?: string | null;
}

/**
 * Filters for querying reviews
 */
export interface ReviewFilters extends HotelScopedFilters {
  userId?: number;
  bookingId?: number;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
}
