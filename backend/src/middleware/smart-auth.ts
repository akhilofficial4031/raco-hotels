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
 * Only returns 401 when refresh token is expired/invalid or user doesn't exist
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
          console.warn(
            "Access token user not found, clearing token and attempting refresh",
          );
          // Clear invalid access token
          setCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, "", {
            ...COOKIE_CONFIG.OPTIONS,
            maxAge: 0,
          });
          // Don't throw here, continue to refresh logic
        } else {
          // Store user information in context and continue
          c.set("user", payload);
          return next();
        }
      } catch (accessTokenError: any) {
        console.warn(
          "Access token verification failed, attempting refresh:",
          accessTokenError.message,
        );
        // Clear invalid access token
        setCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, "", {
          ...COOKIE_CONFIG.OPTIONS,
          maxAge: 0,
        });
        // Continue to refresh logic below
      }
    }

    // No valid access token - try to refresh using refresh token
    if (!refreshToken) {
      console.warn("No refresh token found, authentication required");
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "Authentication required - no valid tokens found",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    // Attempt token refresh with proper error handling
    try {
      console.warn("Attempting to refresh tokens...");

      // Verify refresh token structure and expiration
      let refreshPayload;
      try {
        refreshPayload = verifyToken(refreshToken);
      } catch (refreshTokenError: any) {
        console.warn(
          "Refresh token verification failed:",
          refreshTokenError.message,
        );
        // Clear invalid refresh token
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
        console.warn("Invalid refresh token structure");
        setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, "", {
          ...COOKIE_CONFIG.OPTIONS,
          maxAge: 0,
        });
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "Invalid session, please login again",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }

      // Check if refresh token exists and is valid in KV with retry logic
      let storedToken;
      let kvRetries = 3;
      while (kvRetries > 0) {
        try {
          storedToken = await AuthService.getRefreshToken(
            c.env.KV,
            refreshPayload.tokenId,
          );
          break;
        } catch (kvError: any) {
          kvRetries--;
          console.warn(
            `KV getRefreshToken failed, retries left: ${kvRetries}`,
            kvError.message,
          );
          if (kvRetries === 0) {
            console.error("KV service unavailable after retries");
            throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
              message: "Service temporarily unavailable, please try again",
            });
          }
          // Wait briefly before retry
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (!storedToken) {
        console.warn("Refresh token not found in storage");
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
        console.warn("Refresh token mismatch");
        // Clean up mismatched token
        try {
          await AuthService.revokeRefreshToken(
            c.env.KV,
            refreshPayload.tokenId,
          );
        } catch (revokeError: any) {
          console.error(
            "Failed to revoke mismatched token:",
            revokeError.message,
          );
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

      // Get user to ensure they still exist and are active with retry logic
      let user;
      let dbRetries = 3;
      while (dbRetries > 0) {
        try {
          user = await AuthService.getUserForToken(
            c.env.DB,
            refreshPayload.userId,
          );
          break;
        } catch (dbError: any) {
          dbRetries--;
          console.warn(
            `DB getUserForToken failed, retries left: ${dbRetries}`,
            dbError.message,
          );
          if (dbRetries === 0) {
            console.error("Database service unavailable after retries");
            throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
              message: "Service temporarily unavailable, please try again",
            });
          }
          // Wait briefly before retry
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (!user) {
        console.warn("User not found or inactive, cleaning up tokens");
        // Clean up tokens for non-existent user
        try {
          await AuthService.revokeRefreshToken(
            c.env.KV,
            refreshPayload.tokenId,
          );
        } catch (revokeError: any) {
          console.error(
            "Failed to revoke token for non-existent user:",
            revokeError.message,
          );
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

      console.warn("Generating new tokens for user:", user.email);

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

      // Store new tokens in KV with retry logic
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
        } catch (storeError: any) {
          storeRetries--;
          console.warn(
            `KV storeTokens failed, retries left: ${storeRetries}`,
            storeError.message,
          );
          if (storeRetries === 0) {
            console.error("Failed to store new tokens after retries");
            throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
              message: "Service temporarily unavailable, please try again",
            });
          }
          // Wait briefly before retry
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Clean up old refresh token (don't fail if this doesn't work)
      try {
        await AuthService.revokeRefreshToken(c.env.KV, refreshPayload.tokenId);
      } catch (revokeError: any) {
        console.error(
          "Failed to revoke old refresh token (non-critical):",
          revokeError.message,
        );
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

      // Store user information in context
      c.set("user", newTokenPayload);

      console.log("Token refresh successful, continuing with request");
      // Continue with the request
      return next();
    } catch (refreshError) {
      // Only clear tokens and return 401 for authentication-related errors
      if (refreshError instanceof HTTPException) {
        // This is already a properly handled auth error, re-throw it
        throw refreshError;
      }

      // Log unexpected errors but don't expose internal details
      console.error("Unexpected error during token refresh:", refreshError);

      // For any other unexpected errors, return 500 instead of 401
      throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        message: "Service temporarily unavailable, please try again",
      });
    }
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    console.error("Authentication middleware error:", error);

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
