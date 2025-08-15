import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { verifyCSRFToken } from "../config/jwt";
import { COOKIE_CONFIG } from "../config/jwt";
import { isPublicRoute, normalizePath } from "../config/routes";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

/**
 * CSRF Protection Middleware
 * Verifies CSRF token for state-changing operations (POST, PUT, PATCH, DELETE)
 */
export const csrfMiddleware = createMiddleware(async (c, next) => {
  const method = c.req.method.toUpperCase();

  // Skip CSRF for public routes
  const normalizedPath = normalizePath(c.req.path);
  if (isPublicRoute(normalizedPath)) {
    return next();
  }

  // Only check CSRF for state-changing methods
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    // Check for development bypass header (for testing purposes)
    const bypassCsrf = c.req.header("X-Bypass-CSRF") === "development";
    const isDevelopment = process.env.NODE_ENV !== "production";

    if (bypassCsrf && isDevelopment) {
      console.warn("⚠️  CSRF protection bypassed for development testing");
      return next();
    }

    // Get CSRF token from header or body
    const csrfTokenFromHeader = c.req.header("X-CSRF-Token");
    const csrfTokenFromCookie = getCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME);

    if (!csrfTokenFromHeader) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message:
          "CSRF token missing from request header. Add 'X-CSRF-Token' header with token from /api/auth/csrf-token or login response.",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    if (!csrfTokenFromCookie) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message:
          "CSRF token missing from cookie. Call /api/auth/csrf-token or login to set CSRF cookie.",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    // Verify both tokens match and are valid
    if (csrfTokenFromHeader !== csrfTokenFromCookie) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message:
          "CSRF token mismatch. The token in X-CSRF-Token header must match the token in the csrf_token cookie.",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    if (!verifyCSRFToken(csrfTokenFromHeader)) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message:
          "Invalid CSRF token. Generate a new token using /api/auth/csrf-token endpoint.",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }
  }

  await next();
});
