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
};
