import { OpenAPIHono } from "@hono/zod-openapi";

import { UserRouteDefinitions } from "./definitions/user";
import { UserController } from "../controllers/user.controller";
import { authMiddleware, requireAdmin, csrfMiddleware } from "../middleware";

import type { AppBindings, AppVariables } from "../types";

// Create user routes with OpenAPI support
const userRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Apply middleware globally (except for public routes)
userRoutes.use("*", async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;

  // Skip middleware for public routes
  if (path.includes("/login") || path.includes("/logout")) {
    return next();
  }

  // Apply auth middleware for all other routes
  await authMiddleware(c, async () => {
    // Apply admin middleware for admin-only routes
    if (!path.includes("/change-password")) {
      await requireAdmin(c, async () => {
        // Apply CSRF for state-changing operations
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
          await csrfMiddleware(c, next);
        } else {
          await next();
        }
      });
    } else {
      // Apply CSRF for password change
      await csrfMiddleware(c, next);
    }
  });
});

// Authentication routes moved to auth.ts

// Admin-only routes
userRoutes.openapi(UserRouteDefinitions.getUsers, UserController.getUsers);
userRoutes.openapi(
  UserRouteDefinitions.getUserById,
  UserController.getUserById,
);
userRoutes.openapi(UserRouteDefinitions.createUser, UserController.createUser);
userRoutes.openapi(UserRouteDefinitions.updateUser, UserController.updateUser);
userRoutes.openapi(UserRouteDefinitions.deleteUser, UserController.deleteUser);
userRoutes.openapi(
  UserRouteDefinitions.toggleUserStatus,
  UserController.toggleUserStatus,
);
userRoutes.openapi(
  UserRouteDefinitions.searchUsers,
  UserController.searchUsers,
);
userRoutes.openapi(
  UserRouteDefinitions.getUserStats,
  UserController.getUserStats,
);

// Password change route moved to auth.ts

export default userRoutes;
