import { OpenAPIHono } from "@hono/zod-openapi";

import { AuthController } from "../controllers/auth.controller";
import { AuthRouteDefinitions } from "../definitions/auth.definition";
import { smartAuthMiddleware } from "../middleware/smart-auth";

import type { AppBindings, AppVariables } from "../types";

// Create auth routes with OpenAPI support
const authRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Public routes (no authentication required)
authRoutes.openapi(AuthRouteDefinitions.login, AuthController.login);
authRoutes.openapi(AuthRouteDefinitions.logout, AuthController.logout);
authRoutes.openapi(AuthRouteDefinitions.refresh, AuthController.refresh);
authRoutes.openapi(
  AuthRouteDefinitions.getCsrfToken,
  AuthController.getCsrfToken,
);
authRoutes.openapi(
  AuthRouteDefinitions.forgotPassword,
  AuthController.forgotPassword,
);
authRoutes.openapi(
  AuthRouteDefinitions.resetPassword,
  AuthController.resetPassword,
);

// Apply auth middleware to protected routes
authRoutes.use("/auth/change-password", smartAuthMiddleware);
authRoutes.use("/auth/revoke-all-sessions", smartAuthMiddleware);
authRoutes.use("/auth/verify", smartAuthMiddleware);

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
