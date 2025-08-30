/**
 * Public routes configuration
 * Routes listed here will bypass authentication middleware
 *
 * Format options:
 * - "/auth/login" -> All methods allowed for this route
 * - "GET:/hotel" -> Only GET method allowed for this route
 * - "POST:/auth/login" -> Only POST method allowed for this route
 */
export const PUBLIC_ROUTES = [
  // Authentication routes
  "/auth/login",
  "/auth/logout",
  "/auth/refresh",
  "/auth/csrf-token",
  "/auth/forgot-password",
  "/auth/set-password",

  // System/health routes
  "/health",
  "/env",
  "/api-info",

  // OpenAPI documentation routes
  "/openapi.json",
  "/openapi-base.json",
  "/swagger-ui",
  "/docs",
  "/api-docs",

  // Hotel routes - only GET method is public
  "GET:/hotels",

  // Add other public routes here as needed
  // "/public-endpoint",
  // "GET:/some-route",
] as const;

/**
 * Route patterns that should be public (using regex)
 * Useful for dynamic routes or patterns
 */
export const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  // Example: /^\/public\/.*$/,
];

/**
 * Check if a given path and method combination is public
 * @param path - The request path (without /api prefix)
 * @param method - The HTTP method (GET, POST, PUT, DELETE, etc.)
 * @returns true if the path/method combination is public, false otherwise
 */
export function isPublicRoute(path: string, method?: string): boolean {
  // If no method is provided, use the old behavior for backward compatibility
  if (!method) {
    // Check exact matches (routes without method prefix)
    if (
      PUBLIC_ROUTES.some(
        (route) =>
          typeof route === "string" && !route.includes(":") && route === path,
      )
    ) {
      return true;
    }
    // Check pattern matches
    return PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(path));
  }

  const upperMethod = method.toUpperCase();

  // Check method-specific routes (e.g., "GET:/hotel")
  const methodSpecificRoute = `${upperMethod}:${path}`;
  if (PUBLIC_ROUTES.includes(methodSpecificRoute as any)) {
    return true;
  }

  // Check routes without method prefix (all methods allowed)
  if (
    PUBLIC_ROUTES.some(
      (route) =>
        typeof route === "string" && !route.includes(":") && route === path,
    )
  ) {
    return true;
  }

  // Check pattern matches
  return PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(path));
}

/**
 * Normalize path by removing /api prefix
 * @param path - The full request path
 * @returns normalized path without /api prefix
 */
export function normalizePath(path: string): string {
  return path.replace(/^\/api/, "");
}
