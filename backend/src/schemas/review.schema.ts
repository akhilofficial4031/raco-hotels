import { z } from "zod";

export const ReviewSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    userId: z.number().int().nullable().openapi({ example: 2 }),
    bookingId: z.number().int().nullable().openapi({ example: 3 }),
    rating: z.number().int().min(1).max(5).openapi({ example: 5 }),
    title: z.string().nullable().openapi({ example: "Great stay" }),
    body: z.string().nullable().openapi({ example: "Clean and comfy" }),
    status: z.string().openapi({ example: "pending" }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    publishedAt: z
      .string()
      .nullable()
      .openapi({ example: "2024-01-02T00:00:00.000Z" }),
  })
  .openapi("Review");

export const CreateReviewRequestSchema = z
  .object({
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    userId: z.number().int().optional().openapi({ example: 2 }),
    bookingId: z.number().int().optional().openapi({ example: 3 }),
    rating: z.number().int().min(1).max(5).openapi({ example: 5 }),
    title: z.string().optional().openapi({ example: "Great stay" }),
    body: z.string().optional().openapi({ example: "Clean and comfy" }),
    status: z.string().optional().openapi({ example: "pending" }),
    publishedAt: z
      .string()
      .optional()
      .openapi({ example: "2024-01-02T00:00:00.000Z" }),
  })
  .openapi("CreateReviewRequest");

export const UpdateReviewRequestSchema =
  CreateReviewRequestSchema.partial().openapi("UpdateReviewRequest");

export const ReviewPathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Review ID" }),
  })
  .openapi("ReviewPathParams");

export const ReviewQueryParamsSchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1))
      .openapi({ example: "1" }),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 10))
      .openapi({ example: "10" }),
    hotelId: z.string().optional().openapi({ example: "1" }),
    status: z.string().optional().openapi({ example: "approved" }),
  })
  .openapi("ReviewQueryParams");

export const ReviewResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      review: ReviewSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("ReviewResponse");

export const ReviewsListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      reviews: z.array(ReviewSchema),
      pagination: z
        .object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        })
        .optional(),
      message: z.string().optional(),
    }),
  })
  .openapi("ReviewsListResponse");
