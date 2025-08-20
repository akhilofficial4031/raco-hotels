import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

// Import OpenAPI configuration
import { apiInfo } from "./lib/api-info";
import { configureOpenAPI } from "./lib/openapi-config";
// Import routes
import { securityHeadersMiddleware, rateLimitMiddleware } from "./middleware";
import amenityRoutes from "./routes/amenity.route";
import authRoutes from "./routes/auth.route";
import availabilityRoutes from "./routes/availability.route";
import bookingRoutes from "./routes/booking.route";
import cancellationPolicyRoutes from "./routes/cancellation_policy.route";
import contentRoutes from "./routes/content.route";
import customerRoutes from "./routes/customer.route";
import featureRoutes from "./routes/feature.route";
import hotelRoutes from "./routes/hotel.route";
import promoCodeRoutes from "./routes/promo_code.route";
import reviewRoutes from "./routes/review.route";
import roomRoutes from "./routes/room.route";
import roomPublicRoutes from "./routes/room_public.route";
import roomTypeRoutes from "./routes/room_type.route";
import systemRoutes from "./routes/system.route";
import taxFeeRoutes from "./routes/tax_fee.route";
// Import middleware and utilities
import userRoutes from "./routes/user.route";
import { i18nMiddleware } from "./utils/i18n";
import { getLocalizedMessage } from "./utils/i18n";

// Import types
import type { AppBindings, AppVariables } from "./types";

// Create main app with OpenAPI support
const app = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Add CORS middleware
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Frontend dev servers
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Accept-Language",
      "X-CSRF-Token",
    ],
    credentials: true, // Allow cookies to be sent
  }),
);

// Add security headers middleware
app.use("*", securityHeadersMiddleware);

// Add rate limiting middleware
app.use("*", rateLimitMiddleware);

// Add i18n middleware
app.use("*", i18nMiddleware());

// Add request logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  console.warn(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);
  await next();
  const end = Date.now();
  console.warn(
    `[${new Date().toISOString()}] ${c.req.method} ${c.req.url} - ${c.res.status} (${end - start}ms)`,
  );
});

// Register API routes - adding back in groups to identify problematic route
app.route("/api", amenityRoutes);
app.route("/api", featureRoutes);
app.route("/api", hotelRoutes);
app.route("/api", roomTypeRoutes);
app.route("/api", roomRoutes);
app.route("/api", roomPublicRoutes);
app.route("/api", availabilityRoutes);
app.route("/api", bookingRoutes);
app.route("/api", reviewRoutes);
app.route("/api", contentRoutes);
app.route("/api", taxFeeRoutes);
app.route("/api", cancellationPolicyRoutes);
app.route("/api", promoCodeRoutes);
app.route("/api", userRoutes);
app.route("/api", customerRoutes);
app.route("/api", authRoutes);
app.route("/api", systemRoutes);

// Legacy hotel routes removed in favor of /api/hotels router

// OpenAPI routes are now properly configured

// Swagger UI endpoint with enhanced configuration
app.get(
  "/swagger-ui",
  swaggerUI({
    url: "/openapi.json",
    persistAuthorization: true,
    tryItOutEnabled: true,
  }),
);

// Alternative Swagger UI paths for convenience
app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
    persistAuthorization: true,
    tryItOutEnabled: true,
  }),
);
app.get(
  "/api-docs",
  swaggerUI({
    url: "/openapi.json",
    persistAuthorization: true,
    tryItOutEnabled: true,
  }),
);

// Environment check endpoint
app.get("/env", (c) => {
  const hasDB = Boolean(c.env.DB);
  const hasKV = Boolean(c.env.KV);
  const hasR2 = Boolean(c.env.R2_BUCKET);
  return c.json({
    success: true,
    data: {
      d1: hasDB,
      kv: hasKV,
      r2: hasR2,
      timestamp: new Date().toISOString(),
    },
  });
});

// API information endpoint with authentication details
app.get("/api-info", apiInfo);

// Global error handler
app.onError((err, c) => {
  console.error(`[${new Date().toISOString()}] Global Error:`, err);

  // If it's an HTTPException with a proper status code, preserve it
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  // For other errors, return 500
  const errorMessage = getLocalizedMessage(c, "system.unexpectedError");
  const errorCode = getLocalizedMessage(c, "errorCodes.internalError");

  return c.json(
    {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && { details: err.message }),
      },
    },
    500,
  );
});

// 404 handler
app.notFound((c) => {
  const errorCode = getLocalizedMessage(c, "errorCodes.notFound");
  const errorMessage = getLocalizedMessage(c, "system.notFoundEndpoint");
  const suggestion = getLocalizedMessage(c, "system.checkDocumentation");

  return c.json(
    {
      success: false,
      error: {
        code: errorCode,
        message: `${errorMessage}: ${c.req.method} ${c.req.url}`,
        suggestion,
      },
    },
    404,
  );
});

// Configure OpenAPI documentation AFTER all routes are registered
configureOpenAPI(app);

// Mount API under /api for local proxy convenience
export default app;
