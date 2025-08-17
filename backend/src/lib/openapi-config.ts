import type { AppBindings, AppVariables } from "../types";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";

// OpenAPI specification type for enhanced endpoint
interface OpenAPISpec {
  openapi: string;
  info: object;
  servers?: object[];
  tags?: object[];
  paths?: object;
  components?: {
    schemas?: object;
    parameters?: object;
    [key: string]: unknown;
  };
}

// Base OpenAPI configuration
export const baseOpenAPIConfig: OpenAPISpec = {
  openapi: "3.0.0",
  info: {
    title: "Raco Hotels API",
    version: "1.0.0",
    description: `A comprehensive hotel management API with user management, authentication, and hotel operations.

**🔐 Authentication & CSRF Protection**

This API requires both JWT authentication and CSRF tokens for protected operations. 

**🚀 Quick Start for Testing in Swagger:**

**Method 1 - CSRF Bypass (Recommended for Testing):**
1. Click the "Authorize" button below
2. In the **bypassCsrf** field, enter: \`development\`
3. In the **bearerAuth** field, login first with POST /api/auth/login (\`admin@raco.com\` / \`admin123\`)
4. Copy the \`accessToken\` from login response and paste it in bearerAuth field

**Method 2 - Full CSRF Protection:**
1. **Login**: Use POST /api/auth/login with credentials: \`admin@raco.com\` / \`admin123\`
2. **Get Tokens**: Copy both \`accessToken\` and \`csrfToken\` from the login response
3. **Authorize**: Click the "Authorize" button and enter:
   - **bearerAuth**: Paste the access token (with "Bearer " prefix if required)
   - **csrfToken**: Paste the CSRF token here

**Alternative Testing Methods:**
- Use GET /api/auth/csrf-token to get a CSRF token without logging in
- For command line testing: Add header \`X-Bypass-CSRF: development\`

⚠️ All POST/PUT/PATCH/DELETE operations require authentication + either CSRF token OR bypass header.`,
    contact: {
      name: "Raco Hotels Development Team",
      email: "dev@raco-hotels.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Local development server",
    },
    {
      url: "https://api.raco-hotels.com",
      description: "Production server",
    },
  ] as object[],
  tags: [
    {
      name: "Authentication",
      description: "Authentication and authorization operations",
    },
    {
      name: "Amenities",
      description: "Amenity management operations",
    },
    {
      name: "Bookings",
      description: "Hotel booking and reservation management",
    },
    {
      name: "Content",
      description: "Content management operations",
    },
    {
      name: "Features",
      description: "Feature management operations",
    },
    {
      name: "Hotels",
      description: "Hotel management operations",
    },
    {
      name: "Policies",
      description: "Cancellation policy management operations",
    },
    {
      name: "Promotions",
      description: "Promotional codes and discount management",
    },
    {
      name: "Reviews",
      description: "Hotel and booking review management",
    },
    {
      name: "Rooms",
      description: "Room type and availability management",
    },
    {
      name: "System",
      description: "System health and API information endpoints",
    },
    {
      name: "Taxes",
      description: "Tax and fee management operations",
    },
    {
      name: "Users",
      description: "User management operations",
    },
  ] as object[],
} as const;

// Security schemes for OpenAPI
export const securitySchemes = {
  bearerAuth: {
    type: "http" as const,
    scheme: "bearer" as const,
    bearerFormat: "JWT",
    description:
      "JWT access token from login response or browser cookies. Get this from POST /api/auth/login response.",
  },
  cookieAuth: {
    type: "apiKey" as const,
    in: "cookie" as const,
    name: "access_token",
    description:
      "JWT access token stored in HTTP-only cookie (automatically set after login)",
  },
  csrfToken: {
    type: "apiKey" as const,
    in: "header" as const,
    name: "X-CSRF-Token",
    description:
      "🔒 REQUIRED: CSRF token for POST/PUT/PATCH/DELETE operations. Get from /api/auth/csrf-token or login response 'csrfToken' field.",
  },
  bypassCsrf: {
    type: "apiKey" as const,
    in: "header" as const,
    name: "X-Bypass-CSRF",
    description:
      "🔧 DEV ONLY: Set to 'development' to bypass CSRF protection. Use this for testing instead of CSRF token.",
  },
} as const;

/**
 * Enhanced OpenAPI endpoint handler that merges base spec with security schemes
 */
export function createEnhancedOpenAPIHandler(
  app: OpenAPIHono<{ Bindings: AppBindings; Variables: AppVariables }>,
) {
  return async (
    c: Context<{ Bindings: AppBindings; Variables: AppVariables }>,
  ) => {
    try {
      // Get the generated OpenAPI spec from the framework
      const generatedSpec = app.getOpenAPIDocument(baseOpenAPIConfig as any);

      // Enhance with security schemes and other custom configurations
      const enhancedSpec = {
        ...generatedSpec,
        openapi: baseOpenAPIConfig.openapi, // Ensure openapi version is set
        info: baseOpenAPIConfig.info,
        servers: baseOpenAPIConfig.servers,
        tags: baseOpenAPIConfig.tags,
        components: {
          ...generatedSpec.components,
          securitySchemes,
        },
        // Set global security requirements that apply to most endpoints
        security: [
          {
            bearerAuth: [],
            csrfToken: [],
          },
          {
            cookieAuth: [],
            csrfToken: [],
          },
          {
            bearerAuth: [],
            bypassCsrf: [],
          },
          {
            cookieAuth: [],
            bypassCsrf: [],
          },
        ],
      };

      return c.json(enhancedSpec);
    } catch (error) {
      console.error("Error creating enhanced OpenAPI spec:", error);
      return c.json({ error: "Failed to generate OpenAPI spec" }, 500);
    }
  };
}

/**
 * Configure OpenAPI documentation for the app
 */
export function configureOpenAPI(
  app: OpenAPIHono<{ Bindings: AppBindings; Variables: AppVariables }>,
) {
  // Basic OpenAPI documentation endpoint (with proper config)
  app.doc("/openapi-base.json", baseOpenAPIConfig as any);

  // Enhanced OpenAPI endpoint with security schemes
  app.get("/openapi.json", createEnhancedOpenAPIHandler(app));
}
