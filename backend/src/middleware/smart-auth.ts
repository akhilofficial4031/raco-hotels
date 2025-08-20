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

// Extend the context to include user information
declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

/**
 * Smart JWT Authentication Middleware
 * Automatically refreshes access tokens when they expire
 * Uses refresh tokens to generate new access tokens seamlessly
 */
export const smartAuthMiddleware = createMiddleware(async (c, next) => {
  try {
    // Check if this is a public route - if so, skip authentication
    const normalizedPath = normalizePath(c.req.path);
    const method = c.req.method;
    if (isPublicRoute(normalizedPath, method)) {
      return next();
    }

    // Get tokens from HTTP-only cookies
    const accessToken = getCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME);
    const refreshToken = getCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME);

    // If we have an access token, try to verify it first
    if (accessToken) {
      try {
        // First, try to verify the access token
        const payload = verifyToken(accessToken);

        // Verify user still exists and is active
        const user = await AuthService.getUserForToken(
          c.env.DB,
          payload.userId,
        );
        if (!user) {
          throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
            message: "User not found or inactive",
            cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
          });
        }

        // Store user information in context
        c.set("user", payload);
        return next();
      } catch {
        // Access token is invalid/expired, try to refresh it below
      }
    }

    // No access token or access token is invalid - try to refresh using refresh token
    if (!refreshToken) {
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "No valid tokens found",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    try {
      // Verify refresh token
      const refreshPayload = verifyToken(refreshToken);

      if (!refreshPayload || !refreshPayload.tokenId) {
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "Invalid refresh token",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }

      // Check if refresh token exists and is valid in KV
      const storedToken = await AuthService.getRefreshToken(
        c.env.KV,
        refreshPayload.tokenId,
      );

      if (!storedToken || storedToken.token !== refreshToken) {
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "Invalid refresh token",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }

      // Get user to ensure they still exist and are active
      const user = await AuthService.getUserForToken(
        c.env.DB,
        refreshPayload.userId,
      );

      if (!user) {
        // Remove invalid token from KV
        await AuthService.revokeRefreshToken(c.env.KV, refreshPayload.tokenId);
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "User not found or inactive",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }

      // Generate new token ID for security
      const newTokenId = AuthService.generateTokenId();

      // Generate new tokens
      const newTokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenId: newTokenId,
      };

      const newAccessToken = generateAccessToken(newTokenPayload);
      const newRefreshToken = generateRefreshToken(newTokenPayload);
      const newCsrfToken = generateCSRFToken();

      // Remove old refresh token and store new one
      await AuthService.revokeRefreshToken(c.env.KV, refreshPayload.tokenId);
      await AuthService.storeRefreshToken(
        c.env.KV,
        newTokenId,
        newRefreshToken,
        user.id,
      );

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

      // Store user information in context
      c.set("user", newTokenPayload);

      // Continue with the request
      return next();
    } catch {
      // Refresh token is also invalid, user needs to login again
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "Session expired, please login again",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    // Handle any other errors
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Authentication failed",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }
});

/**
 * Optional Smart Authentication Middleware
 * Adds user context if token is present, but doesn't require it
 * Also handles automatic token refresh
 */
export const optionalSmartAuthMiddleware = createMiddleware(async (c, next) => {
  try {
    const accessToken = getCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME);
    const refreshToken = getCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME);

    if (accessToken) {
      try {
        const payload = verifyToken(accessToken);
        // For optional auth, we don't check KV storage to avoid performance impact
        // Only check if user still exists
        const user = await AuthService.getUserForToken(
          c.env.DB,
          payload.userId,
        );
        if (user) {
          c.set("user", payload);
        }
      } catch {
        // Try to refresh token if access token is expired
        if (refreshToken) {
          try {
            const refreshPayload = verifyToken(refreshToken);
            if (refreshPayload && refreshPayload.tokenId) {
              const storedToken = await AuthService.getRefreshToken(
                c.env.KV,
                refreshPayload.tokenId,
              );

              if (storedToken && storedToken.token === refreshToken) {
                const user = await AuthService.getUserForToken(
                  c.env.DB,
                  refreshPayload.userId,
                );

                if (user) {
                  // Generate new tokens
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

                  // Store new refresh token
                  await AuthService.storeRefreshToken(
                    c.env.KV,
                    newTokenId,
                    newRefreshToken,
                    user.id,
                  );

                  // Set new cookies
                  setCookie(
                    c,
                    COOKIE_CONFIG.ACCESS_TOKEN_NAME,
                    newAccessToken,
                    {
                      ...COOKIE_CONFIG.OPTIONS,
                      maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
                    },
                  );

                  setCookie(
                    c,
                    COOKIE_CONFIG.REFRESH_TOKEN_NAME,
                    newRefreshToken,
                    {
                      ...COOKIE_CONFIG.OPTIONS,
                      maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
                    },
                  );

                  setCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, newCsrfToken, {
                    ...COOKIE_CONFIG.OPTIONS,
                    httpOnly: false,
                    maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
                  });

                  c.set("user", newTokenPayload);
                }
              }
            }
          } catch {
            // Silently ignore refresh errors for optional auth
          }
        }
      }
    }
  } catch {
    // Silently ignore authentication errors for optional auth
  }

  await next();
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
