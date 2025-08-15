import { type AppContext } from "../types";

export const apiInfo = (c: AppContext) => {
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
          "Option A - Quick Testing (Development Only):",
          "1. Add header 'X-Bypass-CSRF: development' to bypass CSRF in development",
          "",
          "Option B - Full Authentication Flow:",
          "1. Login using POST /api/auth/login with test credentials",
          "2. Copy the CSRF token from the response",
          "3. Use 'Authorize' button in Swagger UI and enter the CSRF token",
          "4. For Bearer token: Extract JWT from browser cookies or use login response",
          "",
          "Option C - Get CSRF Token Only:",
          "1. Call GET /api/auth/csrf-token to get a CSRF token",
          "2. Copy the token from the response",
          "3. Use it in the 'X-CSRF-Token' header for POST/PUT/PATCH/DELETE requests",
        ],
      },
      endpoints: {
        docs: ["/docs", "/swagger-ui", "/api-docs"],
        openapi: "/openapi.json",
        login: "/api/auth/login",
        logout: "/api/auth/logout",
        csrfToken: "/api/auth/csrf-token",
      },
    },
  });
};
