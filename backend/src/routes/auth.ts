import { OpenAPIHono } from "@hono/zod-openapi";

import { AuthRouteDefinitions } from "./definitions/auth";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware, csrfMiddleware } from "../middleware";

import type { AppBindings, AppVariables } from "../types";

// Create auth routes with OpenAPI support
const authRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Apply middleware for protected routes
authRoutes.use("*", async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;

  // Skip middleware for public routes
  if (
    path.includes("/login") ||
    path.includes("/logout") ||
    path.includes("/refresh")
  ) {
    return next();
  }

  // Apply auth middleware for protected routes
  await authMiddleware(c, async () => {
    // Apply CSRF for state-changing operations
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

// Public routes (no authentication required)
authRoutes.openapi(AuthRouteDefinitions.login, AuthController.login);
authRoutes.openapi(AuthRouteDefinitions.logout, AuthController.logout);
authRoutes.openapi(AuthRouteDefinitions.refresh, AuthController.refresh);

// Protected routes (authentication required)
authRoutes.openapi(
  AuthRouteDefinitions.changePassword,
  AuthController.changePassword,
);
authRoutes.openapi(
  AuthRouteDefinitions.revokeAllSessions,
  AuthController.revokeAllSessions,
);
authRoutes.openapi(AuthRouteDefinitions.verify, AuthController.verify);

export default authRoutes;
