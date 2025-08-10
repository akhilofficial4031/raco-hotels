import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { USER_ROLES, HTTP_STATUS, ERROR_CODES } from "../constants";

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if the authenticated user has the required role
 */
export function requireRole(...allowedRoles: Array<keyof typeof USER_ROLES>) {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "Authentication required",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    // Check if user's role is in the allowed roles
    const userRole = user.role;
    const hasPermission = allowedRoles.some(
      (role) => userRole === USER_ROLES[role],
    );

    if (!hasPermission) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    await next();
  });
}

/**
 * Admin-only access middleware
 */
export const requireAdmin = requireRole("ADMIN");

/**
 * Staff or Admin access middleware
 */
export const requireStaffOrAdmin = requireRole("STAFF", "ADMIN");

/**
 * Customer (guest) access middleware
 */
export const requireCustomer = requireRole("GUEST", "CUSTOMER");

/**
 * Customer or Staff (or Admin) access middleware
 */
export const requireCustomerOrStaff = requireRole(
  "GUEST",
  "CUSTOMER",
  "STAFF",
  "ADMIN",
);

/**
 * Authenticated user (any role) middleware
 */
export const requireAuth = createMiddleware(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Authentication required",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }

  await next();
});
