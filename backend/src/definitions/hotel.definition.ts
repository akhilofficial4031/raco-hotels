import { z } from "zod";

import { createRoute, ApiTags } from "../lib/route-wrapper";
import {
  HotelsListResponseSchema,
  CreateHotelRequestSchema,
  UpdateHotelRequestSchema,
  HotelPathParamsSchema,
  HotelQueryParamsSchema,
  HotelWithImagesResponseSchema,
  HotelImageResponseSchema,
  UpdateImageSortOrderSchema,
} from "../schemas";

export const HotelRouteDefinitions = {
  getHotels: createRoute({
    method: "get",
    path: "/hotels",
    summary: "Get all hotels with images",
    description:
      "Retrieve a paginated list of hotels with optional filters including city, country, active status, and text search. Each hotel includes its associated images sorted by display order. Supports advanced filtering for location-based searches and hotel discovery. Query parameters: page (pagination), limit (results per page), city, countryCode (ISO codes like US, CA), isActive (1/0), and search (text across name/description/address). Use cases include booking websites, admin panels, mobile apps, and public hotel discovery APIs.",
    tags: [ApiTags.HOTELS],
    successSchema: HotelsListResponseSchema,
    successDescription: "Hotels with images retrieved successfully",
    querySchema: HotelQueryParamsSchema,
    includeBadRequest: true,
  }),

  getHotelById: createRoute({
    method: "get",
    path: "/hotels/{id}",
    summary: "Get hotel by ID with images",
    description:
      "Retrieve detailed information about a specific hotel including all associated images, amenities, location data, and metadata. Returns comprehensive hotel data suitable for booking interfaces and hotel management systems. Response includes complete property details, location information, all hotel images with metadata (URLs, alt text, sort order), and location-specific information about nearby attractions. Perfect for hotel detail pages, mobile app details, admin views, and third-party booking system integrations.",
    tags: [ApiTags.HOTELS],
    successSchema: HotelWithImagesResponseSchema,
    successDescription: "Hotel with images retrieved successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),

  createHotel: {
    method: "post" as const,
    path: "/hotels",
    summary: "Create hotel with optional images",
    description:
      "Create a new hotel with optional image uploads. Supports both JSON-only creation (application/json) for hotel data only, and multipart form data for hotels with images. For multipart requests, send hotelData as JSON string and images[] as file array. Business rules: hotel slug must be unique, hotel name is required, images are automatically resized and optimized, sorted by upload order. Use cases include hotel onboarding through admin panels, bulk hotel creation with images, mobile app registration, and property management system integrations.",
    tags: [ApiTags.HOTELS],
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateHotelRequestSchema,
          },
          "multipart/form-data": {
            schema: z.object({
              hotelData: z.string().describe("Hotel data as JSON string"),
              "images[]": z
                .array(z.any())
                .optional()
                .describe("Hotel image files (JPEG, PNG, WebP)"),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: HotelWithImagesResponseSchema,
          },
        },
        description: "Hotel created successfully with images",
      },
      400: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
            }),
          },
        },
        description: "Bad request - Invalid hotel data or image format",
      },
      409: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
            }),
          },
        },
        description: "Conflict - Hotel slug already exists",
      },
    },
  },

  updateHotel: {
    method: "put" as const,
    path: "/hotels/{id}",
    summary: "Update hotel with optional image management",
    description:
      "Update an existing hotel with flexible image management options. Supports both JSON-only updates (application/json) for hotel data only, and multipart form data for image management. For multipart requests: hotelData (JSON string), replaceImages (boolean flag), images[] (new files). Image options: add new images (provide images[] without replaceImages), replace all images (replaceImages=true + new images[]), remove all images (replaceImages=true without images[]), no image changes (use JSON). Business rules: hotel must exist, slug uniqueness enforced, existing images preserved unless replaced, sort order maintained automatically. Use cases include hotel information updates, image gallery management, seasonal content updates, mobile app editing.",
    tags: [ApiTags.HOTELS],
    request: {
      params: HotelPathParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: UpdateHotelRequestSchema,
          },
          "multipart/form-data": {
            schema: z.object({
              hotelData: z
                .string()
                .describe("Updated hotel data as JSON string"),
              replaceImages: z
                .string()
                .optional()
                .describe(
                  "Whether to replace all existing images (true/false)",
                ),
              "images[]": z
                .array(z.any())
                .optional()
                .describe("New hotel image files"),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: HotelWithImagesResponseSchema,
          },
        },
        description: "Hotel updated successfully with images",
      },
      400: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
            }),
          },
        },
        description: "Bad request - Invalid hotel data or image format",
      },
      404: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
            }),
          },
        },
        description: "Hotel not found",
      },
      409: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
            }),
          },
        },
        description: "Conflict - Hotel slug already exists",
      },
    },
  },

  deleteHotel: createRoute({
    method: "delete",
    path: "/hotels/{id}",
    summary: "Delete hotel and all associated data",
    description:
      "Permanently delete a hotel record including all associated images from cloud storage, amenity associations, feature associations, location information and metadata. IMPORTANT: This operation is irreversible and affects active bookings (handle carefully), historical booking data (may be preserved based on business rules), and image files in cloud storage (permanently removed). Business rules: only authorized users can delete hotels, consider soft deletion for hotels with booking history, all associated images removed from cloud storage, cleanup includes all related database records. Use cases include hotel decommissioning, admin hotel management, data cleanup operations, property portfolio management.",
    tags: [ApiTags.HOTELS],
    successSchema: z.object({
      success: z.boolean(),
      data: z.object({}),
      message: z.string().optional(),
    }),
    successDescription: "Hotel and all associated data deleted successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),

  deleteHotelImage: createRoute({
    method: "delete",
    path: "/hotels/images/{imageId}",
    summary: "Delete individual hotel image",
    description:
      "Delete a specific hotel image by its ID. This endpoint allows fine-grained control over individual images without affecting other hotel data. Useful for image gallery management and content moderation. The image file is also removed from cloud storage. Use this for targeted image removal when you don't want to update the entire hotel.",
    tags: [ApiTags.HOTELS],
    successSchema: z.object({
      success: z.boolean(),
      data: z.object({}),
      message: z.string().optional(),
    }),
    successDescription: "Hotel image deleted successfully",
    paramsSchema: z.object({
      imageId: z
        .string()
        .transform((v) => parseInt(v, 10))
        .openapi({
          example: "1",
          description: "Image ID",
        }),
    }),
    includeNotFound: true,
  }),

  updateImageSortOrder: createRoute({
    method: "patch",
    path: "/hotels/images/{imageId}/sort-order",
    summary: "Update hotel image display order",
    description:
      "Update the sort order of a specific hotel image to control how images are displayed in galleries and listings. Lower sort order values appear first. This is useful for featuring primary images and organizing visual content.",
    tags: [ApiTags.HOTELS],
    successSchema: HotelImageResponseSchema,
    successDescription: "Image sort order updated successfully",
    paramsSchema: z.object({
      imageId: z
        .string()
        .transform((v) => parseInt(v, 10))
        .openapi({
          example: "1",
          description: "Image ID",
        }),
    }),
    requestSchema: UpdateImageSortOrderSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),
};
