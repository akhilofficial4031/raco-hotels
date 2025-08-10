import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

// Import OpenAPI configuration
import { configureOpenAPI } from "./lib/openapi-config";
// Import routes
import { securityHeadersMiddleware, rateLimitMiddleware } from "./middleware";
import amenityRoutes from "./routes/amenity.route";
import authRoutes from "./routes/auth.route";
import featureRoutes from "./routes/feature.route";
import hotelRoutes from "./routes/hotel.route";
import systemRoutes from "./routes/system.route";
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

// Register API routes
app.route("/api/amenities", amenityRoutes);
app.route("/api/features", featureRoutes);
app.route("/api/hotels", hotelRoutes);
app.route("/api/users", userRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/system", systemRoutes);

// Legacy hotel routes removed in favor of /api/hotels router

// Configure OpenAPI documentation
configureOpenAPI(app);

// Swagger UI endpoint with enhanced configuration
app.get(
  "/swagger-ui",
  swaggerUI({
    url: "/openapi.json",
  }),
);

// Alternative Swagger UI paths for convenience
app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  }),
);
app.get(
  "/api-docs",
  swaggerUI({
    url: "/openapi.json",
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
app.get("/api-info", (c) => {
  return c.json({
    success: true,
    data: {
      title: "Raco Hotels API",
      version: "1.0.0",
      description: "A comprehensive hotel management API with authentication",
      authentication: {
        methods: ["JWT Bearer Token", "HTTP-only Cookies"],
        testCredentials: {
          email: "admin@raco.com",
          password: "admin123",
          note: "Use POST /auth/login to get authentication tokens",
        },
        instructions: [
          "1. Login using POST /api/auth/login with test credentials",
          "2. Copy the CSRF token from the response",
          "3. Use 'Authorize' button in Swagger UI",
          "4. For Bearer token: Extract JWT from browser cookies or use login response",
          "5. For CSRF token: Use the csrfToken from login response",
          "6. Test protected endpoints",
        ],
      },
      endpoints: {
        docs: ["/docs", "/swagger-ui", "/api-docs"],
        openapi: "/openapi.json",
        login: "/api/auth/login",
        logout: "/api/auth/logout",
      },
    },
  });
});

// Global error handler
app.onError((err, c) => {
  console.error(`[${new Date().toISOString()}] Global Error:`, err);

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

// Mount API under /api for local proxy convenience
export default app;
