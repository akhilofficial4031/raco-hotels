/**
 * Smart Route Wrapper
 *
 * This module provides a simplified interface for creating routes that automatically
 * determines whether a route should be public or authenticated based on the
 * PUBLIC_ROUTES configuration.
 *
 * Developers only need to:
 * 1. Update PUBLIC_ROUTES array in config/routes.ts
 * 2. Use createRoute() for all route definitions
 * 3. Use smartPermissionMiddleware() in route handlers
 */

import { createAuthenticatedRoute, createConditionalRoute } from "./openapi";
import { isPublicRoute } from "../config/routes";

interface BaseRouteConfig {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  summary: string;
  description?: string;
  tags?: string[];
  successSchema?: any;
  successDescription?: string;
  requestSchema?: any;
  requestDescription?: string;
  querySchema?: any;
  paramsSchema?: any;
  includeBadRequest?: boolean;
  includeNotFound?: boolean;
  includeConflict?: boolean;
  includeUnauthorized?: boolean;
  includePagination?: boolean;
}

/**
 * Smart route creator that automatically determines whether to create a public or authenticated route
 * based on the PUBLIC_ROUTES configuration. This is the main function developers should use.
 *
 * Usage:
 * ```typescript
 * export const UserRouteDefinitions = {
 *   getUsers: createRoute({
 *     method: "get",
 *     path: "/users",
 *     summary: "Get all users",
 *     // ... other config
 *   }),
 *   createUser: createRoute({
 *     method: "post",
 *     path: "/users",
 *     summary: "Create user",
 *     // ... other config
 *   }),
 * };
 * ```
 *
 * The function will automatically:
 * - Check PUBLIC_ROUTES configuration
 * - Create appropriate route type (public vs authenticated)
 * - Handle method-specific public access (e.g., "GET:/users")
 *
 * @param config - Route configuration
 * @returns Automatically configured route (public or authenticated)
 */
export function createRoute(config: BaseRouteConfig) {
  const method = config.method.toUpperCase();
  const path = config.path;

  // Check if this route/method combination is public
  const isPublic = isPublicRoute(path, method);

  if (isPublic) {
    // For public routes, we still want to include the unauthorized response
    // in case the route has conditional authentication (method-specific public access)
    return createConditionalRoute(config as any);
  } else {
    // For protected routes, use full authentication
    return createAuthenticatedRoute(config as any);
  }
}

/**
 * Smart permission middleware factory that automatically handles permissions
 * based on the PUBLIC_ROUTES configuration.
 *
 * Usage in route handlers:
 * ```typescript
 * import { smartPermissionMiddleware } from "../lib/route-wrapper";
 *
 * hotelRoutes.openapi(HotelRouteDefinitions.getHotels,
 *   smartPermissionMiddleware(PERMISSIONS.HOTELS_READ),
 *   async (c) => {
 *     return HotelController.getHotels(c as AppContext);
 *   }
 * );
 * ```
 *
 * The middleware will automatically:
 * - Skip permission checks for public routes
 * - Apply permission checks for protected routes
 * - Handle method-specific public access
 *
 * @param permission - The permission to check for protected routes
 * @returns Middleware function that conditionally applies permission checks
 */
export function smartPermissionMiddleware(permission: string) {
  return async (_c: any, next: () => Promise<void>) => {
    const method = _c.req.method;
    const path = _c.req.path.replace(/^\/api/, ""); // Normalize path

    // Check if this route/method combination is public
    if (!isPublicRoute(path, method)) {
      // Import assertPermission dynamically to avoid circular dependencies
      const { assertPermission } = await import("../middleware/permissions");
      await assertPermission(_c, permission as any);
    }

    await next();
  };
}

/**
 * Simplified route handler wrapper that automatically handles permissions
 *
 * Usage:
 * ```typescript
 * hotelRoutes.openapi(
 *   HotelRouteDefinitions.getHotels,
 *   createRouteHandler(PERMISSIONS.HOTELS_READ, HotelController.getHotels)
 * );
 * ```
 *
 * @param permission - The permission to check for protected routes
 * @param handler - The actual route handler function
 * @returns Wrapped handler with automatic permission checking
 */
export function createRouteHandler(
  permission: string,
  // eslint-disable-next-line no-unused-vars
  handler: (_c: any) => Promise<any>,
) {
  return async (c: any) => {
    const method = c.req.method;
    const path = c.req.path.replace(/^\/api/, ""); // Normalize path

    // Check if this route/method combination is public
    if (!isPublicRoute(path, method)) {
      // Import assertPermission dynamically to avoid circular dependencies
      const { assertPermission } = await import("../middleware/permissions");
      await assertPermission(c, permission as any);
    }

    return handler(c);
  };
}

// Export the original functions for advanced use cases
export {
  createAuthenticatedRoute,
  createConditionalRoute,
  ApiTags,
} from "./openapi";
