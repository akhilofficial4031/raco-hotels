import { z } from "zod";

import { createRoute, ApiTags } from "../lib/route-wrapper";
import {
  HotelsListResponseSchema,
  CreateHotelRequestSchema,
  UpdateHotelRequestSchema,
  HotelPathParamsSchema,
  HotelQueryParamsSchema,
  HotelWithImagesResponseSchema,
  HotelWithAllRelationsResponseSchema,
  HotelImageResponseSchema,
  UpdateImageSortOrderSchema,
} from "../schemas";

export const HotelRouteDefinitions = {
  getHotels: createRoute({
    method: "get",
    path: "/hotels",
    summary: "Get all hotels with all relations",
    description:
      "Retrieve a paginated list of hotels with optional filters including city, country, active status, and text search. Each hotel includes its associated images sorted by display order, all connected features, and all amenities. Supports advanced filtering for location-based searches and hotel discovery. Query parameters: page (pagination), limit (results per page), city, countryCode (ISO codes like US, CA), isActive (1/0), and search (text across name/description/address). Use cases include booking websites, admin panels, mobile apps, and public hotel discovery APIs.",
    tags: [ApiTags.HOTELS],
    successSchema: HotelsListResponseSchema,
    successDescription: "Hotels with all relations retrieved successfully",
    querySchema: HotelQueryParamsSchema,
    includeBadRequest: true,
  }),

  getHotelById: createRoute({
    method: "get",
    path: "/hotels/{id}",
    summary: "Get hotel by ID with all relations",
    description:
      "Retrieve detailed information about a specific hotel including all associated images, features, amenities, location data, and metadata. Returns comprehensive hotel data suitable for booking interfaces and hotel management systems. Response includes complete property details, location information, all hotel images with metadata (URLs, alt text, sort order), all associated features, all amenities, and location-specific information about nearby attractions. Perfect for hotel detail pages, mobile app details, admin views, and third-party booking system integrations.",
    tags: [ApiTags.HOTELS],
    successSchema: HotelWithAllRelationsResponseSchema,
    successDescription: "Hotel with all relations retrieved successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),

  createHotel: createRoute({
    method: "post",
    path: "/hotels",
    summary: "Create hotel",
    description: "Create a new hotel with hotel information.",
    tags: [ApiTags.HOTELS],
    requestSchema: CreateHotelRequestSchema,
    successSchema: HotelWithImagesResponseSchema,
    successDescription: "Hotel created successfully",
    includeBadRequest: true,
    includeConflict: true,
  }),

  updateHotel: createRoute({
    method: "put",
    path: "/hotels/{id}",
    summary: "Update hotel",
    description: "Update an existing hotel information.",
    tags: [ApiTags.HOTELS],
    paramsSchema: HotelPathParamsSchema,
    requestSchema: UpdateHotelRequestSchema,
    successSchema: HotelWithImagesResponseSchema,
    successDescription: "Hotel updated successfully",
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),

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
