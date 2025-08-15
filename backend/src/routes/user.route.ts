import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { isPublicRoute, normalizePath } from "../config/routes";
import { UserController } from "../controllers/user.controller";
import { UserRouteDefinitions } from "../definitions/user.definition";
import { assertPermission } from "../middleware/permissions";
import { globalAuthMiddleware } from "../middleware/public-routes";

import type { AppBindings, AppVariables } from "../types";

// Create user routes with OpenAPI support
const userRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Authentication + CSRF wrapper; permissions are enforced per-route (Option C)
// Use globalAuthMiddleware to properly handle public routes
userRoutes.use("*", globalAuthMiddleware());

// Authentication routes moved to auth.ts

// Admin-only routes with single-route permission guards (Option C)
userRoutes.openapi(UserRouteDefinitions.getUsers, async (c) => {
  // Check if this is a public route - if not, require permissions
  const normalizedPath = normalizePath(c.req.path);
  const method = c.req.method;
  if (!isPublicRoute(normalizedPath, method)) {
    await assertPermission(c, PERMISSIONS.USERS_READ);
  }
  return UserController.getUsers(c as any);
});
userRoutes.openapi(UserRouteDefinitions.getUserById, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_READ);
  return UserController.getUserById(c as any);
});
userRoutes.openapi(UserRouteDefinitions.createUser, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_CREATE);
  return UserController.createUser(c as any);
});
userRoutes.openapi(UserRouteDefinitions.updateUser, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_UPDATE);
  return UserController.updateUser(c as any);
});
userRoutes.openapi(UserRouteDefinitions.deleteUser, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_DELETE);
  return UserController.deleteUser(c as any);
});
userRoutes.openapi(UserRouteDefinitions.toggleUserStatus, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_UPDATE);
  return UserController.toggleUserStatus(c as any);
});
userRoutes.openapi(UserRouteDefinitions.searchUsers, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_READ);
  return UserController.searchUsers(c as any);
});
userRoutes.openapi(UserRouteDefinitions.getUserStats, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_READ);
  return UserController.getUserStats(c as any);
});

// Password change route moved to auth.ts

export default userRoutes;
