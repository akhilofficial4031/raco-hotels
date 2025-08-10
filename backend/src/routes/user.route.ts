import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { UserController } from "../controllers/user.controller";
import { UserRouteDefinitions } from "../definitions/user.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

// Create user routes with OpenAPI support
const userRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Authentication + CSRF wrapper; permissions are enforced per-route (Option C)
userRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

// Authentication routes moved to auth.ts

// Admin-only routes with single-route permission guards (Option C)
userRoutes.openapi(UserRouteDefinitions.getUsers, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_READ);
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
