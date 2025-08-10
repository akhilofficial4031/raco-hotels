import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { verifyCSRFToken } from "../config/jwt";
import { COOKIE_CONFIG } from "../config/jwt";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

/**
 * CSRF Protection Middleware
 * Verifies CSRF token for state-changing operations (POST, PUT, PATCH, DELETE)
 */
export const csrfMiddleware = createMiddleware(async (c, next) => {
  const method = c.req.method.toUpperCase();

  // Only check CSRF for state-changing methods
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    // Get CSRF token from header or body
    const csrfTokenFromHeader = c.req.header("X-CSRF-Token");
    const csrfTokenFromCookie = getCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME);

    if (!csrfTokenFromHeader) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message: "CSRF token missing from request header",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    if (!csrfTokenFromCookie) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message: "CSRF token missing from cookie",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    // Verify both tokens match and are valid
    if (csrfTokenFromHeader !== csrfTokenFromCookie) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message: "CSRF token mismatch",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }

    if (!verifyCSRFToken(csrfTokenFromHeader)) {
      throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
        message: "Invalid CSRF token",
        cause: ERROR_CODES.UNAUTHORIZED_ACCESS,
      });
    }
  }

  await next();
});
