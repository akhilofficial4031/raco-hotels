import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import {
  verifyToken,
  type JWTPayload,
  COOKIE_CONFIG,
  TokenExpiredError,
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
 * JWT Authentication Middleware
 * Verifies JWT token from HTTP-only cookies with automatic refresh
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    // Check if this is a public route - if so, skip authentication
    const normalizedPath = normalizePath(c.req.path);
    const method = c.req.method;
    if (isPublicRoute(normalizedPath, method)) {
      return next();
    }

    // Get access token from HTTP-only cookie
    const accessToken = getCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME);

    if (!accessToken) {
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "Authentication required",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    let payload: JWTPayload | null = null;
    let tokenRefreshed = false;

    try {
      // Try to verify the access token
      payload = verifyToken(accessToken);

      // If token has a tokenId, verify it exists in KV
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
    } catch (error) {
      // Check if this is a token expiration error
      if (error instanceof TokenExpiredError) {
        // Access token expired - try to refresh using refresh token
        const refreshToken = getCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME);

        if (!refreshToken) {
          throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
            message: "Session expired, please login",
            cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
          });
        }

        // Attempt to refresh tokens
        const refreshResult = await AuthService.refreshTokens(
          c.env.KV,
          c.env.DB,
          refreshToken,
        );

        if (!refreshResult) {
          throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
            message: "Session expired, please login",
            cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
          });
        }

        // Successfully refreshed - set new cookies
        setCookie(
          c,
          COOKIE_CONFIG.ACCESS_TOKEN_NAME,
          refreshResult.accessToken,
          {
            ...COOKIE_CONFIG.OPTIONS,
            maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
          },
        );

        setCookie(
          c,
          COOKIE_CONFIG.REFRESH_TOKEN_NAME,
          refreshResult.refreshToken,
          {
            ...COOKIE_CONFIG.OPTIONS,
            maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
          },
        );

        setCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, refreshResult.csrfToken, {
          ...COOKIE_CONFIG.OPTIONS,
          httpOnly: false, // CSRF token needs to be accessible to JavaScript
          maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
        });

        // Use the new token payload
        payload = refreshResult.payload;
        tokenRefreshed = true;
      } else if (error instanceof HTTPException) {
        throw error;
      } else {
        // Other JWT errors (invalid signature, malformed, etc.)
        throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
          message: "Invalid authentication",
          cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
        });
      }
    }

    if (!payload) {
      throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
        message: "Authentication required",
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

    // Handle unexpected errors
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: "Authentication failed",
      cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
    });
  }
});

/**
 * Optional Authentication Middleware
 * Adds user context if token is present, but doesn't require it
 * Attempts automatic refresh if access token is expired
 */
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  try {
    const accessToken = getCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME);

    if (accessToken) {
      let payload: JWTPayload | null = null;

      try {
        payload = verifyToken(accessToken);

        // For optional auth, we don't check KV storage to avoid performance impact
        // Only check if user still exists
        const user = await AuthService.getUserForToken(
          c.env.DB,
          payload.userId,
        );
        if (user) {
          c.set("user", payload);
        }
      } catch (error) {
        // If access token expired, try to refresh
        if (error instanceof TokenExpiredError) {
          const refreshToken = getCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME);

          if (refreshToken) {
            const refreshResult = await AuthService.refreshTokens(
              c.env.KV,
              c.env.DB,
              refreshToken,
            );

            if (refreshResult) {
              // Successfully refreshed - set new cookies
              setCookie(
                c,
                COOKIE_CONFIG.ACCESS_TOKEN_NAME,
                refreshResult.accessToken,
                {
                  ...COOKIE_CONFIG.OPTIONS,
                  maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
                },
              );

              setCookie(
                c,
                COOKIE_CONFIG.REFRESH_TOKEN_NAME,
                refreshResult.refreshToken,
                {
                  ...COOKIE_CONFIG.OPTIONS,
                  maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
                },
              );

              setCookie(
                c,
                COOKIE_CONFIG.CSRF_TOKEN_NAME,
                refreshResult.csrfToken,
                {
                  ...COOKIE_CONFIG.OPTIONS,
                  httpOnly: false,
                  maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
                },
              );

              // Set user context with refreshed token
              c.set("user", refreshResult.payload);
            }
          }
        }
        // Silently ignore other authentication errors for optional auth
      }
    }
  } catch {
    // Silently ignore all errors for optional auth
  }

  await next();
});
