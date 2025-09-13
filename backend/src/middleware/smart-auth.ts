/**
 * Smart Authentication Middleware
 *
 * This middleware automatically handles authentication and permissions based on
 * the PUBLIC_ROUTES configuration. It provides a unified interface that developers
 * can use without worrying about public vs protected route logic.
 */

import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import {
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  generateCSRFToken,
  COOKIE_CONFIG,
  type JWTPayload,
} from "../config/jwt";
import { isPublicRoute, normalizePath } from "../config/routes";
import { HTTP_STATUS, ERROR_CODES } from "../constants";
import { AuthService } from "../services/auth.service";
import { type UserRole } from "../types";

// Extend the context to include user information
declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

async function handleAccessToken(c: any) {
  const accessToken = getCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME);

  if (!accessToken) {
    return null;
  }

  try {
    const payload = verifyToken(accessToken);
    const user = await AuthService.getUserForToken(c.env.DB, payload.userId);

    if (!user) {
      console.warn(
        "Access token user not found, clearing token and attempting refresh",
      );
      setCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, "", {
        ...COOKIE_CONFIG.OPTIONS,
        maxAge: 0,
      });
      return null;
    }
    return payload;
  } catch {
    setCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, "", {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 0,
    });
    return null;
  }
}

function verifyAndDecodeRefreshToken(
  c: any,
  refreshToken: string,
): JWTPayload & { tokenId: string } {
  let refreshPayload;
  try {
    refreshPayload = verifyToken(refreshToken);
  } catch {
    setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, "", {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 0,
    });
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Session expired, please login again",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }

  if (!refreshPayload || !refreshPayload.tokenId) {
    setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, "", {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 0,
    });
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Invalid session, please login again",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }

  return refreshPayload as JWTPayload & { tokenId: string };
}

async function validateRefreshTokenInKV(
  c: any,
  refreshPayload: { tokenId: string },
  refreshToken: string,
) {
  let storedToken;
  let kvRetries = 3;
  while (kvRetries > 0) {
    try {
      storedToken = await AuthService.getRefreshToken(
        c.env.KV,
        refreshPayload.tokenId,
      );
      break;
    } catch {
      kvRetries--;
      if (kvRetries === 0) {
        throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          message: "Service temporarily unavailable, please try again",
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (!storedToken) {
    setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, "", {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 0,
    });
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Session expired, please login again",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }

  if (storedToken.token !== refreshToken) {
    try {
      await AuthService.revokeRefreshToken(c.env.KV, refreshPayload.tokenId);
    } catch {
      void 0;
    }
    setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, "", {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 0,
    });
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Session expired, please login again",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }
}

async function getUserForRefreshToken(
  c: any,
  refreshPayload: { userId: number; tokenId: string },
) {
  let user;
  let dbRetries = 3;
  while (dbRetries > 0) {
    try {
      user = await AuthService.getUserForToken(c.env.DB, refreshPayload.userId);
      break;
    } catch {
      dbRetries--;
      if (dbRetries === 0) {
        throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          message: "Service temporarily unavailable, please try again",
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (!user) {
    try {
      await AuthService.revokeRefreshToken(c.env.KV, refreshPayload.tokenId);
    } catch {
      void 0;
    }
    setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, "", {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: 0,
    });
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "User account not found, please login again",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }

  return user;
}

async function generateAndStoreNewTokens(
  c: any,
  user: { id: number; email: string; role: UserRole },
  oldTokenId: string,
) {
  // token generation

  const newTokenId = AuthService.generateTokenId();
  const newTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenId: newTokenId,
  };

  const newAccessToken = generateAccessToken(newTokenPayload);
  const newRefreshToken = generateRefreshToken(newTokenPayload);
  const newCsrfToken = generateCSRFToken();

  let storeRetries = 3;
  while (storeRetries > 0) {
    try {
      await Promise.all([
        AuthService.storeRefreshToken(
          c.env.KV,
          newTokenId,
          newRefreshToken,
          user.id,
        ),
        AuthService.storeAccessToken(
          c.env.KV,
          newTokenId,
          newAccessToken,
          user.id,
        ),
      ]);
      break;
    } catch {
      storeRetries--;
      if (storeRetries === 0) {
        throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          message: "Service temporarily unavailable, please try again",
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Clean up old refresh token (don't fail if this doesn't work)
  try {
    await AuthService.revokeRefreshToken(c.env.KV, oldTokenId);
  } catch {
    void 0;
  }

  // Set new cookies
  setCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, newAccessToken, {
    ...COOKIE_CONFIG.OPTIONS,
    maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
  });

  setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, newRefreshToken, {
    ...COOKIE_CONFIG.OPTIONS,
    maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
  });

  setCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, newCsrfToken, {
    ...COOKIE_CONFIG.OPTIONS,
    httpOnly: false,
    maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
  });

  return newTokenPayload;
}

async function handleTokenRefresh(c: any) {
  const refreshToken = getCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME);
  if (!refreshToken) {
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Authentication required - no valid tokens found",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }

  try {
    const refreshPayload = verifyAndDecodeRefreshToken(c, refreshToken);
    await validateRefreshTokenInKV(c, refreshPayload, refreshToken);
    const user = await getUserForRefreshToken(c, refreshPayload);
    const newPayload = await generateAndStoreNewTokens(
      c,
      user,
      refreshPayload.tokenId,
    );
    c.set("user", newPayload);
  } catch (refreshError) {
    if (refreshError instanceof HTTPException) {
      throw refreshError;
    }
    throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      message: "Service temporarily unavailable, please try again",
    });
  }
}

/**
 * Smart JWT Authentication Middleware
 * Automatically refreshes access tokens when they expire
 * Uses refresh tokens to generate new access tokens seamlessly
 * Only returns 401 when refresh token is expired/invalid or user doesn't exist
 */
export const smartAuthMiddleware = createMiddleware(async (c, next) => {
  try {
    // Prevent multiple executions per request when routers are mounted under the same base path
    const alreadyProcessed = c.get("smartAuthProcessed");
    if (alreadyProcessed) {
      return next();
    }
    c.set("smartAuthProcessed", true);

    // Check if this is a public route - if so, skip authentication
    const normalizedPath = normalizePath(c.req.path);
    const method = c.req.method;

    if (isPublicRoute(normalizedPath, method)) {
      return next();
    }

    // Try to authenticate with access token first
    const payload = await handleAccessToken(c);

    if (payload) {
      c.set("user", payload);
      return next();
    }

    // Access token invalid/expired, try to refresh
    await handleTokenRefresh(c);

    // After successful refresh, the user should be set in context
    // Continue with the request
    return next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    // Handle any other unexpected errors as server errors, not auth errors
    throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      message: "Service temporarily unavailable, please try again",
    });
  }
});

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
      console.warn(
        `smartPermissionHandler: user context = ${user ? "FOUND" : "NOT FOUND"} for path ${normalizedPath}`,
      );
      if (!user) {
        console.error(
          "smartPermissionHandler: No user context found - this should not happen after smartAuthMiddleware",
        );
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
