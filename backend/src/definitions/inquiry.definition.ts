import { createRoute, z } from "@hono/zod-openapi";

import {
  CreateInquiryRequestSchema,
  UpdateInquiryRequestSchema,
  InquiryQueryParamsSchema,
  InquiryListResponseSchema,
  InquiryResponseSchema,
  InquiryIdParamSchema,
  InquiryStatusEnum,
} from "../schemas";

const InquiryTag = "Inquiries";

// Common error response schema
const ErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

export const InquiryRouteDefinitions = {
  // GET /inquiries - Get all inquiries (protected)
  getInquiries: createRoute({
    method: "get",
    path: "/inquiries",
    tags: [InquiryTag],
    summary: "Get all inquiries",
    description: "Retrieve a paginated list of inquiries with optional filters",
    request: {
      query: InquiryQueryParamsSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              data: InquiryListResponseSchema,
            }),
          },
        },
        description: "List of inquiries retrieved successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad request - invalid parameters",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),

  // GET /inquiries/:id - Get inquiry by ID (protected)
  getInquiryById: createRoute({
    method: "get",
    path: "/inquiries/{id}",
    tags: [InquiryTag],
    summary: "Get inquiry by ID",
    description: "Retrieve a specific inquiry by its ID",
    request: {
      params: InquiryIdParamSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              data: InquiryResponseSchema,
            }),
          },
        },
        description: "Inquiry retrieved successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Inquiry not found",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),

  // POST /inquiries - Create inquiry (public)
  createInquiry: createRoute({
    method: "post",
    path: "/inquiries",
    tags: [InquiryTag],
    summary: "Create new inquiry",
    description: "Create a new inquiry (public endpoint)",
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateInquiryRequestSchema,
          },
        },
        description: "Inquiry data to create",
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              data: InquiryResponseSchema,
            }),
          },
        },
        description: "Inquiry created successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad request - invalid data",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),

  // PUT /inquiries/:id - Update inquiry (protected)
  updateInquiry: createRoute({
    method: "put",
    path: "/inquiries/{id}",
    tags: [InquiryTag],
    summary: "Update inquiry",
    description: "Update an existing inquiry",
    request: {
      params: InquiryIdParamSchema,
      body: {
        content: {
          "application/json": {
            schema: UpdateInquiryRequestSchema,
          },
        },
        description: "Inquiry data to update",
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              data: InquiryResponseSchema,
            }),
          },
        },
        description: "Inquiry updated successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad request - invalid data",
      },
      404: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Inquiry not found",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),

  // DELETE /inquiries/:id - Delete inquiry (protected)
  deleteInquiry: createRoute({
    method: "delete",
    path: "/inquiries/{id}",
    tags: [InquiryTag],
    summary: "Delete inquiry",
    description: "Delete an existing inquiry",
    request: {
      params: InquiryIdParamSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              data: z.object({
                message: z.string(),
              }),
            }),
          },
        },
        description: "Inquiry deleted successfully",
      },
      404: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Inquiry not found",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),

  // PATCH /inquiries/:id/status - Update inquiry status (protected)
  updateInquiryStatus: createRoute({
    method: "patch",
    path: "/inquiries/{id}/status",
    tags: [InquiryTag],
    summary: "Update inquiry status",
    description: "Update the status of an inquiry",
    request: {
      params: InquiryIdParamSchema,
      body: {
        content: {
          "application/json": {
            schema: z.object({
              status: InquiryStatusEnum,
            }),
          },
        },
        description: "New status for the inquiry",
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              data: InquiryResponseSchema,
            }),
          },
        },
        description: "Inquiry status updated successfully",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad request - invalid status",
      },
      404: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Inquiry not found",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),

  // GET /inquiries/stats - Get inquiry statistics (protected)
  getInquiryStats: createRoute({
    method: "get",
    path: "/inquiries/stats",
    tags: [InquiryTag],
    summary: "Get inquiry statistics",
    description: "Get statistics about inquiries grouped by status",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              data: z.object({
                stats: z.record(z.string(), z.number()),
              }),
            }),
          },
        },
        description: "Inquiry statistics retrieved successfully",
      },
      401: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Unauthorized",
      },
      500: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),
};
