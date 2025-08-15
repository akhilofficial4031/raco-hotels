import { authMiddleware, csrfMiddleware } from "./index";
import { isPublicRoute, normalizePath } from "../config/routes";

import type { AppBindings, AppVariables } from "../types";
import type { Context, Next } from "hono";

/**
 * Global middleware to handle public routes and apply authentication selectively
 * This middleware should be applied globally to automatically handle public/private route logic
 */
export function globalAuthMiddleware() {
  return async (
    c: Context<{ Bindings: AppBindings; Variables: AppVariables }>,
    next: Next,
  ) => {
    const fullPath = c.req.path;
    const normalizedPath = normalizePath(fullPath);
    const method = c.req.method;

    // Skip authentication for public routes
    if (isPublicRoute(normalizedPath, method)) {
      return next();
    }
    // Apply authentication middleware for protected routes
    await authMiddleware(c, async () => {
      // Apply CSRF for state-changing operations on protected routes
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        await csrfMiddleware(c, next);
      } else {
        await next();
      }
    });
  };
}
