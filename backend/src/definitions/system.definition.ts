import { createRoute, ApiTags } from "../lib/route-wrapper";
import { HealthCheckResponseSchema } from "../schemas";

export const SystemRouteDefinitions = {
  // GET /health - Health check
  healthCheck: createRoute({
    method: "get",
    path: "/health",
    summary: "Health check",
    description: "Check API health status",
    tags: [ApiTags.SYSTEM],
    successSchema: HealthCheckResponseSchema,
    successDescription: "API is healthy",
  }),

  // GET / - API info
  getApiInfo: createRoute({
    method: "get",
    path: "/",
    summary: "API information",
    description: "Get basic API information and available endpoints",
    tags: [ApiTags.SYSTEM],
    successSchema: HealthCheckResponseSchema,
    successDescription: "API information retrieved",
  }),
};
