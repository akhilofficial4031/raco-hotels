import { createRoute } from "@hono/zod-openapi";
import { type z } from "zod";

import { API_TAGS, HTTP_STATUS } from "../constants";
import { ErrorResponseSchema } from "../schemas";

// OpenAPI route creation helpers
interface BaseRouteConfig {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  summary: string;
  description: string;
  tags: string[];
  successSchema: z.ZodSchema;
  successDescription?: string;
  requestSchema?: z.ZodSchema;
  requestDescription?: string;
  querySchema?: z.ZodSchema;
  paramsSchema?: z.ZodSchema;
  includeBadRequest?: boolean;
  includeNotFound?: boolean;
  includeConflict?: boolean;
  includeUnauthorized?: boolean;
  includePagination?: boolean;
}

export function createPublicRoute(config: BaseRouteConfig) {
  const responses: Record<number, any> = {
    [HTTP_STATUS.OK]: {
      description: config.successDescription || "Successful response",
      content: {
        "application/json": {
          schema: config.successSchema,
        },
      },
    },
  };

  // Add common error responses
  if (config.includeBadRequest) {
    responses[HTTP_STATUS.BAD_REQUEST] = {
      description: "Bad request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    };
  }

  if (config.includeNotFound) {
    responses[HTTP_STATUS.NOT_FOUND] = {
      description: "Resource not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    };
  }

  if (config.includeConflict) {
    responses[HTTP_STATUS.CONFLICT] = {
      description: "Resource conflict",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    };
  }

  responses[HTTP_STATUS.INTERNAL_SERVER_ERROR] = {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  };

  const route: any = {
    method: config.method,
    path: config.path,
    summary: config.summary,
    description: config.description,
    tags: config.tags,
    responses,
  };

  // Add request body if provided
  if (config.requestSchema) {
    route.request = {
      body: {
        description: config.requestDescription || "Request body",
        content: {
          "application/json": {
            schema: config.requestSchema,
          },
        },
        required: true,
      },
    };
  }

  // Add query parameters if provided
  if (config.querySchema) {
    route.request = {
      ...route.request,
      query: config.querySchema,
    };
  }

  // Add path parameters if provided
  if (config.paramsSchema) {
    route.request = {
      ...route.request,
      params: config.paramsSchema,
    };
  }

  return createRoute(route);
}

export function createAuthenticatedRoute(config: BaseRouteConfig) {
  const route = createPublicRoute(config);

  // Add unauthorized response for authenticated routes
  const responses = { ...route.responses };
  responses[HTTP_STATUS.UNAUTHORIZED] = {
    description: "Unauthorized access",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  };

  return createRoute({
    ...route,
    responses,
    security: [
      {
        bearerAuth: [],
        csrfToken: [], // Add CSRF token requirement for authenticated routes
      },
      {
        bypassCsrf: [], // Alternative: allow development bypass
      },
    ],
  });
}

export function createConditionalRoute(config: BaseRouteConfig) {
  const route = createPublicRoute(config);

  // Add unauthorized response but no security requirement
  // (let middleware handle authentication based on method)
  const responses = { ...route.responses };
  responses[HTTP_STATUS.UNAUTHORIZED] = {
    description: "Unauthorized access",
    content: {
      "application/json": {
        schema: ErrorResponseSchema,
      },
    },
  };

  return createRoute({
    ...route,
    responses,
    // No security requirement - handled by middleware
  });
}

// Export API tags for consistency
export { API_TAGS as ApiTags };
