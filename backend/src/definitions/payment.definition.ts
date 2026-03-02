import { createRoute, z } from "@hono/zod-openapi";

import {
  PaymentQueryParamsSchema,
  PaymentListResponseSchema,
} from "../schemas";

const PaymentTag = "Payments";

const ErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

export const PaymentRouteDefinitions = {
  listPayments: createRoute({
    method: "get",
    path: "/payments",
    tags: [PaymentTag],
    summary: "Get all payments",
    description:
      "Retrieve a paginated list of payments with optional filters",
    request: {
      query: PaymentQueryParamsSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().default(true),
              data: PaymentListResponseSchema,
            }),
          },
        },
        description: "List of payments retrieved successfully",
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
