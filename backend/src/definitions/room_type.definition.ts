import { z } from "zod";

import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  RoomTypesListResponseSchema,
  RoomTypePathParamsSchema,
  RoomTypeQueryParamsSchema,
  RoomTypeResponseSchema,
  CreateRoomTypeRequestSchema,
  UpdateRoomTypeRequestSchema,
  RoomTypeImageSchema,
} from "../schemas";

export const RoomTypeRouteDefinitions = {
  getRoomTypes: createRoute({
    method: "get",
    path: "/room-types",
    summary: "Get all room types",
    description: "Retrieve a list of room types with filters and pagination",
    tags: [ApiTags.ROOMS],
    successSchema: RoomTypesListResponseSchema,
    successDescription: "Room types retrieved successfully",
    querySchema: RoomTypeQueryParamsSchema,
    includeBadRequest: true,
  }),
  getRoomTypeById: createRoute({
    method: "get",
    path: "/room-types/{id}",
    summary: "Get room type by ID",
    description: "Retrieve a specific room type by ID",
    tags: [ApiTags.ROOMS],
    successSchema: RoomTypeResponseSchema,
    successDescription: "Room type retrieved successfully",
    paramsSchema: RoomTypePathParamsSchema,
    includeNotFound: true,
  }),
  createRoomType: createRoute({
    method: "post",
    path: "/room-types",
    summary: "Create room type",
    description: "Create a new room type, with optional amenities and images",
    tags: [ApiTags.ROOMS],
    successSchema: RoomTypeResponseSchema,
    successDescription: "Room type created successfully",
    requestSchema: CreateRoomTypeRequestSchema,
    includeBadRequest: true,
    includeConflict: true,
  }),
  updateRoomType: createRoute({
    method: "put",
    path: "/room-types/{id}",
    summary: "Update room type",
    description:
      "Update a room type; if amenityIds/images arrays are provided they replace existing",
    tags: [ApiTags.ROOMS],
    successSchema: RoomTypeResponseSchema,
    successDescription: "Room type updated successfully",
    paramsSchema: RoomTypePathParamsSchema,
    requestSchema: UpdateRoomTypeRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),
  deleteRoomType: createRoute({
    method: "delete",
    path: "/room-types/{id}",
    summary: "Delete room type",
    description: "Delete a room type",
    tags: [ApiTags.ROOMS],
    successSchema: RoomTypeResponseSchema,
    successDescription: "Room type deleted successfully",
    paramsSchema: RoomTypePathParamsSchema,
    includeNotFound: true,
  }),

  uploadRoomTypeImages: {
    method: "post" as const,
    path: "/room-types/{id}/images",
    summary: "Upload images for room type",
    description:
      "Upload one or more images for a room type to R2 cloud storage. Images are automatically resized and optimized. Supports JPEG, PNG, and WebP formats up to 10MB each. Images are stored with organized naming conventions and metadata.",
    tags: [ApiTags.ROOMS],
    request: {
      params: RoomTypePathParamsSchema,
      body: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                images: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "binary",
                  },
                  minItems: 1,
                  maxItems: 10,
                  description:
                    "Image files to upload (max 10 files, 10MB each)",
                },
                replaceImages: {
                  type: "string",
                  enum: ["true", "false"],
                  description:
                    "Whether to replace all existing images (default: false)",
                  example: "false",
                },
              },
              required: ["images"],
            },
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                roomType: z.object({
                  id: z.number(),
                  name: z.string(),
                }),
                images: z.array(RoomTypeImageSchema),
              }),
              message: z.string().optional(),
            }),
          },
        },
        description: "Images uploaded successfully",
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
        description: "Bad request - Invalid image format or size",
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
        description: "Room type not found",
      },
    },
  },

  deleteRoomTypeImage: {
    method: "delete" as const,
    path: "/room-types/images/{imageId}",
    summary: "Delete individual room type image",
    description:
      "Delete a specific room type image by its ID. This endpoint allows fine-grained control over individual images without affecting other room type data. The image file is also removed from cloud storage.",
    tags: [ApiTags.ROOMS],
    request: {
      params: z.object({
        imageId: z
          .string()
          .transform((v) => parseInt(v, 10))
          .openapi({
            example: "1",
            description: "Image ID",
          }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              data: z.object({}),
              message: z.string().optional(),
            }),
          },
        },
        description: "Room type image deleted successfully",
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
        description: "Image not found",
      },
    },
  },

  updateRoomTypeImageSortOrder: {
    method: "patch" as const,
    path: "/room-types/images/{imageId}/sort-order",
    summary: "Update room type image display order",
    description:
      "Update the sort order of a specific room type image to control how images are displayed in galleries. Lower sort order values appear first.",
    tags: [ApiTags.ROOMS],
    request: {
      params: z.object({
        imageId: z
          .string()
          .transform((v) => parseInt(v, 10))
          .openapi({
            example: "1",
            description: "Image ID",
          }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              sortOrder: z.number().int().min(0).openapi({
                example: 0,
                description: "New sort order value",
              }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                image: RoomTypeImageSchema,
              }),
              message: z.string().optional(),
            }),
          },
        },
        description: "Image sort order updated successfully",
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
        description: "Bad request - Invalid sort order",
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
        description: "Image not found",
      },
    },
  },
};
