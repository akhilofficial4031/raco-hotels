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

  // Room public routes
  "GET:/public/rooms",

  // Booking routes - temporarily public for testing
  "POST:/bookings",

  // room availability
  "GET:/availability",
  // Content routes - public read access
  "GET:/content/homepage",
  "GET:/public/homepage",

  // Add other public routes here as needed
  // "/public-endpoint",
  // "GET:/some-route",
] as const;

/**
 * Route patterns that should be public (using regex)
 * Useful for dynamic routes or patterns
 */
export const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  // Public room routes with dynamic IDs
  /^\/public\/rooms\/[^/]+$/,

  // Public room types by hotel
  /^\/room-types\/hotel\/[^/]+$/,

  // Public hotel routes by slug
  // Matches /hotels/slug/{slug} for public hotel access by slug
  /^\/hotels\/slug\/[a-zA-Z0-9_-]+$/,

  //Public hotel routes by id
  /^\/hotels\/[^/]+$/,

  //Public roomtypes routes by id
  /^\/room-types\/[^/]+$/,
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
    const exactMatch = PUBLIC_ROUTES.some(
      (route) =>
        typeof route === "string" && !route.includes(":") && route === path,
    );
    if (exactMatch) {
      return true;
    }
    // Check pattern matches
    const patternMatch = PUBLIC_ROUTE_PATTERNS.some((pattern) =>
      pattern.test(path),
    );
    return patternMatch;
  }

  const upperMethod = method.toUpperCase();

  // Check method-specific routes (e.g., "GET:/hotels")
  const methodSpecificRoute = `${upperMethod}:${path}`;
  const methodSpecificMatch = PUBLIC_ROUTES.includes(
    methodSpecificRoute as any,
  );
  if (methodSpecificMatch) {
    return true;
  }

  // Check routes without method prefix (all methods allowed)
  const globalMethodMatch = PUBLIC_ROUTES.some(
    (route) =>
      typeof route === "string" && !route.includes(":") && route === path,
  );
  if (globalMethodMatch) {
    return true;
  }

  // Check pattern matches - only for GET method for hotel slug routes
  const patternMatch = PUBLIC_ROUTE_PATTERNS.some((pattern) => {
    const isMatch = pattern.test(path);
    // For hotel slug routes, only allow GET method
    if (isMatch && path.match(/^\/hotels\/slug\/[a-zA-Z0-9_-]+$/)) {
      return upperMethod === "GET";
    }
    return isMatch;
  });
  return patternMatch;
}

/**
 * Normalize path by removing /api prefix
 * @param path - The full request path
 * @returns normalized path without /api prefix
 */
export function normalizePath(path: string): string {
  // Remove /api prefix if present, otherwise return as-is
  const normalized = path.replace(/^\/api(?=\/|$)/, "");
  // Ensure path starts with / if not empty
  return normalized === ""
    ? "/"
    : normalized.startsWith("/")
      ? normalized
      : `/${normalized}`;
}
