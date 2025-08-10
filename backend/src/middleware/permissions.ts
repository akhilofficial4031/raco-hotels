import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import {
  DEFAULT_ROLE_PERMISSIONS,
  type RoutePermission,
  type PermissionKey,
} from "../config/permissions";
import { HTTP_STATUS, ERROR_CODES } from "../constants";
import { PermissionService } from "../services/permission.service";

/**
 * Permission middleware factory: checks if current user has the required permission.
 * Falls back to DEFAULT_ROLE_PERMISSIONS. In future, you can replace the lookup
 * with DB queries to support dynamic roles/permissions.
 */
export function requirePermission(routePermissions: RoutePermission[]) {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "Authentication required",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    const method = c.req.method.toUpperCase() as RoutePermission["method"];
    // Normalize path so that user routes mounted at /api/users match "/users..."
    const path = c.req.path.replace(/^\/api\/users/, "").replace(/^\/api/, "");

    const matched = routePermissions.find(
      (rp) => rp.method === method && rp.pathPattern.test(path),
    );

    if (!matched) {
      return next();
    }

    const role = user.role;
    // Try KV-cached (then DB) permissions first, fallback to default mapping
    let allowed: PermissionKey[] = [];
    const cachedOrDbAllowed = await PermissionService.getRolePermissions(
      c.env.DB,
      c.env.KV,
      role,
    );
    allowed =
      cachedOrDbAllowed.length > 0
        ? cachedOrDbAllowed
        : DEFAULT_ROLE_PERMISSIONS[role] || [];
    const hasPermission = allowed.includes(matched.permission);

    if (!hasPermission) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message: `Missing permission: ${matched.permission}`,
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    await next();
  });
}

/**
 * Check a single permission key for the current user. Throws HTTP 403 if missing.
 */
export async function assertPermission(c: any, permission: PermissionKey) {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Authentication required",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }

  const role = user.role;
  const cachedOrDbAllowed = await PermissionService.getRolePermissions(
    c.env.DB,
    c.env.KV,
    role,
  );
  const allowed =
    cachedOrDbAllowed.length > 0
      ? cachedOrDbAllowed
      : DEFAULT_ROLE_PERMISSIONS[role] || [];

  if (!allowed.includes(permission)) {
    throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
      message: `Missing permission: ${permission}`,
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }
}

/**
 * Middleware: require a single permission key regardless of path/method
 */
export function requirePermissionKey(permission: PermissionKey) {
  return createMiddleware(async (c, next) => {
    await assertPermission(c, permission);
    await next();
  });
}

/**
 * Middleware: map HTTP method -> permission key for a specific route prefix.
 * Example usage in a router:
 * router.use('/users', permissionMatrix({ GET: PERMISSIONS.USERS_READ, POST: PERMISSIONS.USERS_CREATE }))
 */
export function permissionMatrix(
  methodToPermission: Partial<Record<RoutePermission["method"], PermissionKey>>,
) {
  return createMiddleware(async (c, next) => {
    const method = c.req.method.toUpperCase() as RoutePermission["method"];
    const required = methodToPermission[method];
    if (required) {
      await assertPermission(c, required);
    }
    await next();
  });
}
