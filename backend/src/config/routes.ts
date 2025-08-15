/**
 * Public routes configuration
 * Routes listed here will bypass authentication middleware
 */
export const PUBLIC_ROUTES = [
  // Authentication routes
  "/auth/login",
  "/auth/logout",
  "/auth/refresh",

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

  // Add other public routes here as needed
  // "/public-endpoint",
] as const;

/**
 * Route patterns that should be public (using regex)
 * Useful for dynamic routes or patterns
 */
export const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  // Example: /^\/public\/.*$/,
];

/**
 * Check if a given path is public
 * @param path - The request path (without /api prefix)
 * @returns true if the path is public, false otherwise
 */
export function isPublicRoute(path: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(path as any)) {
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
