/**
 * Smart Authentication Middleware
 *
 * This middleware automatically handles authentication and permissions based on
 * the PUBLIC_ROUTES configuration. It provides a unified interface that developers
 * can use without worrying about public vs protected route logic.
 */

import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { authMiddleware, csrfMiddleware } from "./index";
import { isPublicRoute, normalizePath } from "../config/routes";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

import type { AppBindings, AppVariables } from "../types";
import type { Context, Next } from "hono";

/**
 * Enhanced global middleware that handles public routes and applies authentication selectively
 * This is an improved version of globalAuthMiddleware that's more robust
 */
export function smartAuthMiddleware() {
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

/**
 * Smart permission middleware factory that automatically handles permissions
 * based on the PUBLIC_ROUTES configuration.
 *
 * Usage:
 * ```typescript
 * routes.use("*", smartAuthMiddleware());
 * routes.openapi(definition, smartPermissionHandler(PERMISSIONS.SOME_PERMISSION, controller.method));
 * ```
 *
 * @param permission - The permission to check for protected routes
 * @param handler - The route handler function
 * @returns Middleware that conditionally applies permission checks and executes the handler
 */
export function smartPermissionHandler(
  permission: string,
  // eslint-disable-next-line no-unused-vars
  handler: (c: any) => Promise<any>,
) {
  return async (c: any) => {
    const method = c.req.method;
    const normalizedPath = normalizePath(c.req.path);

    // Only check permissions for protected routes
    if (!isPublicRoute(normalizedPath, method)) {
      const user = c.get("user");
      if (!user) {
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "Authentication required",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }

      // Import permission services dynamically to avoid circular dependencies
      const { assertPermission } = await import("./permissions");
      await assertPermission(c, permission as any);
    }

    return handler(c);
  };
}

/**
 * Create a smart permission middleware that can be used in route chains
 *
 * Usage:
 * ```typescript
 * routes.use("*", smartAuthMiddleware());
 * routes.use("/hotels/*", smartPermissionMiddleware(PERMISSIONS.HOTELS_READ));
 * ```
 *
 * @param permission - The permission to check for protected routes
 * @returns Middleware function
 */
export function smartPermissionMiddleware(permission: string) {
  return createMiddleware(async (c, next) => {
    const method = c.req.method;
    const normalizedPath = normalizePath(c.req.path);

    // Only check permissions for protected routes
    if (!isPublicRoute(normalizedPath, method)) {
      const user = c.get("user");
      if (!user) {
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "Authentication required",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }

      // Import permission services dynamically to avoid circular dependencies
      const { assertPermission } = await import("./permissions");
      await assertPermission(c, permission as any);
    }

    await next();
  });
}

/**
 * Utility function to check if the current request is for a public route
 * Useful for conditional logic in controllers
 *
 * @param c - Hono context
 * @returns true if the current route is public for the current method
 */
export function isCurrentRoutePublic(c: any): boolean {
  const method = c.req.method;
  const normalizedPath = normalizePath(c.req.path);
  return isPublicRoute(normalizedPath, method);
}

/**
 * Decorator-style function for route handlers that need conditional permission checking
 *
 * Usage:
 * ```typescript
 * export const HotelController = {
 *   getHotels: withSmartPermissions(PERMISSIONS.HOTELS_READ, async (c) => {
 *     // Your handler logic here
 *     // Permissions are automatically checked for protected routes
 *   }),
 * };
 * ```
 *
 * @param permission - The permission to check for protected routes
 * @param handler - The route handler function
 * @returns Wrapped handler with automatic permission checking
 */
export function withSmartPermissions(
  permission: string,
  // eslint-disable-next-line no-unused-vars
  handler: (_c: any) => Promise<any>,
) {
  return async (c: any) => {
    const method = c.req.method;
    const normalizedPath = normalizePath(c.req.path);

    // Only check permissions for protected routes
    if (!isPublicRoute(normalizedPath, method)) {
      const user = c.get("user");
      if (!user) {
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "Authentication required",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }

      // Import permission services dynamically to avoid circular dependencies
      const { assertPermission } = await import("./permissions");
      await assertPermission(c, permission as any);
    }

    return handler(c);
  };
}
