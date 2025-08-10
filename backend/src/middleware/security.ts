import { createMiddleware } from "hono/factory";

/**
 * Security Headers Middleware
 * Adds security headers similar to Helmet.js
 */
export const securityHeadersMiddleware = createMiddleware(async (c, next) => {
  await next();

  // Set security headers
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // Strict Transport Security (only in production with HTTPS)
  if (process.env.NODE_ENV === "production") {
    c.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", // Allow CDN for Swagger UI
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", // Allow CDN for Swagger UI
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  c.header("Content-Security-Policy", csp);
});

/**
 * Rate Limiting Middleware (Basic implementation)
 * In production, consider using a more sophisticated rate limiter
 */
export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  // This is a basic implementation. In production, use Redis or similar
  // for distributed rate limiting
  const clientIP =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    c.req.header("X-Real-IP") ||
    "unknown";

  // For now, just log the request (implement actual rate limiting as needed)
  console.log(
    `API Request from IP: ${clientIP}, Path: ${c.req.path}, Method: ${c.req.method}`,
  );

  await next();
});
