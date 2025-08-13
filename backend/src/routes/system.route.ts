import { OpenAPIHono } from "@hono/zod-openapi";

import { SystemController } from "../controllers/system.controller";
import { SystemRouteDefinitions } from "../definitions/system.definition";

import type { AppBindings } from "../types";

// Create system routes with OpenAPI support
const systemRoutes = new OpenAPIHono<{ Bindings: AppBindings }>();

// Register system routes with their definitions and controllers
systemRoutes.openapi(
  SystemRouteDefinitions.healthCheck,
  SystemController.healthCheck,
);
systemRoutes.openapi(
  SystemRouteDefinitions.getApiInfo,
  SystemController.getApiInfo,
);

export default systemRoutes;
