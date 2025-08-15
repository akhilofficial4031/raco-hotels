import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { verifyToken, type JWTPayload } from "../config/jwt";
import { COOKIE_CONFIG } from "../config/jwt";
import { HTTP_STATUS, ERROR_CODES } from "../constants";
import { AuthService } from "../services/auth.service";
import { isPublicRoute, normalizePath } from "../config/routes";

// Extend the context to include user information
declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from HTTP-only cookies
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    // Check if this is a public route - if so, skip authentication
    const normalizedPath = normalizePath(c.req.path);
    if (isPublicRoute(normalizedPath)) {
      return next();
    }
    // Get access token from HTTP-only cookie
    const accessToken = getCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME);

    if (!accessToken) {
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "Access token not found",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    // Verify the token
    const payload = verifyToken(accessToken);

    if (!payload) {
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "Invalid access token",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    // If token has a tokenId, verify it exists in KV (for refresh tokens validation)
    if (payload.tokenId) {
      const storedToken = await AuthService.getRefreshToken(
        c.env.KV,
        payload.tokenId,
      );
      if (!storedToken) {
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "Token session expired",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }
    }

    // Verify user still exists and is active
    const user = await AuthService.getUserForToken(c.env.DB, payload.userId);
    if (!user) {
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "User not found or inactive",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    // Store user information in context
    c.set("user", payload);

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    // Handle JWT verification errors
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Token verification failed",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }
});

/**
 * Optional Authentication Middleware
 * Adds user context if token is present, but doesn't require it
 */
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  try {
    const accessToken = getCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME);

    if (accessToken) {
      const payload = verifyToken(accessToken);
      if (payload) {
        // For optional auth, we don't check KV storage to avoid performance impact
        // Only check if user still exists
        const user = await AuthService.getUserForToken(
          c.env.DB,
          payload.userId,
        );
        if (user) {
          c.set("user", payload);
        }
      }
    }
  } catch {
    // Silently ignore authentication errors for optional auth
  }

  await next();
});
