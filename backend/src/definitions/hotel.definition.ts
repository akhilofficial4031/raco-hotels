import { z } from "zod";

import { createRoute, ApiTags } from "../lib/route-wrapper";
import {
  HotelResponseSchema,
  HotelsListResponseSchema,
  CreateHotelRequestSchema,
  UpdateHotelRequestSchema,
  HotelPathParamsSchema,
  HotelQueryParamsSchema,
  HotelWithImagesResponseSchema,
  HotelImageResponseSchema,
  HotelImagesListResponseSchema,
  UpdateImageSortOrderSchema,
} from "../schemas";

export const HotelRouteDefinitions = {
  // All routes now use createRoute() - it automatically determines public vs authenticated
  // based on PUBLIC_ROUTES configuration in config/routes.ts
  getHotels: createRoute({
    method: "get",
    path: "/hotels",
    summary: "Get all hotels",
    description:
      "Retrieve a list of hotels with optional filters and pagination",
    tags: [ApiTags.HOTELS],
    successSchema: HotelsListResponseSchema,
    successDescription: "Hotels retrieved successfully",
    querySchema: HotelQueryParamsSchema,
    includeBadRequest: true,
  }),

  getHotelById: createRoute({
    method: "get",
    path: "/hotels/{id}",
    summary: "Get hotel by ID",
    description: "Retrieve a specific hotel by its ID",
    tags: [ApiTags.HOTELS],
    successSchema: HotelResponseSchema,
    successDescription: "Hotel retrieved successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),

  createHotel: createRoute({
    method: "post",
    path: "/hotels",
    summary: "Create hotel",
    description: "Create a new hotel",
    tags: [ApiTags.HOTELS],
    successSchema: HotelResponseSchema,
    successDescription: "Hotel created successfully",
    requestSchema: CreateHotelRequestSchema,
    includeBadRequest: true,
    includeConflict: true,
  }),

  updateHotel: createRoute({
    method: "put",
    path: "/hotels/{id}",
    summary: "Update hotel",
    description: "Update an existing hotel",
    tags: [ApiTags.HOTELS],
    successSchema: HotelResponseSchema,
    successDescription: "Hotel updated successfully",
    paramsSchema: HotelPathParamsSchema,
    requestSchema: UpdateHotelRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),

  deleteHotel: createRoute({
    method: "delete",
    path: "/hotels/{id}",
    summary: "Delete hotel",
    description: "Delete an existing hotel",
    tags: [ApiTags.HOTELS],
    successSchema: HotelResponseSchema,
    successDescription: "Hotel deleted successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),

  // Hotel with images routes
  getHotelWithImages: createRoute({
    method: "get",
    path: "/hotels/{id}/with-images",
    summary: "Get hotel with images",
    description: "Retrieve a hotel with all its images",
    tags: [ApiTags.HOTELS],
    successSchema: HotelWithImagesResponseSchema,
    successDescription: "Hotel with images retrieved successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),

  createHotelWithImages: {
    method: "post" as const,
    path: "/hotels/with-images",
    summary: "Create hotel with images",
    description:
      "Create a new hotel with multiple images (multipart/form-data)",
    tags: [ApiTags.HOTELS],
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({
              hotelData: z.string().describe("Hotel data as JSON string"),
              "images[]": z.array(z.any()).optional().describe("Image files"),
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
        description: "Hotel with images created successfully",
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
        description: "Bad request",
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
        description: "Conflict (slug already exists)",
      },
    },
  },

  updateHotelWithImages: {
    method: "put" as const,
    path: "/hotels/{id}/with-images",
    summary: "Update hotel with images",
    description:
      "Update an existing hotel and optionally add/replace images (multipart/form-data)",
    tags: [ApiTags.HOTELS],
    request: {
      params: HotelPathParamsSchema,
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({
              hotelData: z.string().describe("Hotel data as JSON string"),
              replaceImages: z
                .string()
                .optional()
                .describe("Whether to replace all images (true/false)"),
              "images[]": z.array(z.any()).optional().describe("Image files"),
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
        description: "Hotel with images updated successfully",
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
        description: "Bad request",
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
        description: "Conflict (slug already exists)",
      },
    },
  },

  // Hotel image management routes
  getHotelImages: createRoute({
    method: "get",
    path: "/hotels/{id}/images",
    summary: "Get hotel images",
    description: "Retrieve all images for a specific hotel",
    tags: [ApiTags.HOTELS],
    successSchema: HotelImagesListResponseSchema,
    successDescription: "Hotel images retrieved successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),

  addHotelImage: {
    method: "post" as const,
    path: "/hotels/{id}/images",
    summary: "Add hotel image",
    description: "Add a new image to a hotel (multipart/form-data)",
    tags: [ApiTags.HOTELS],
    request: {
      params: HotelPathParamsSchema,
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({
              image: z.any().describe("Image file"),
              alt: z.string().optional().describe("Alt text for the image"),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: HotelImageResponseSchema,
          },
        },
        description: "Hotel image added successfully",
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
        description: "Bad request",
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
    },
  },

  deleteHotelImage: createRoute({
    method: "delete",
    path: "/hotels/images/{imageId}",
    summary: "Delete hotel image",
    description: "Delete a specific hotel image",
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
    summary: "Update image sort order",
    description: "Update the sort order of a hotel image",
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
