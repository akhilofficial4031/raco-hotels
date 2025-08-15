# Public and Protected Routes Guide

This guide explains how to create and configure public and protected routes in the Raco Hotels API, including support for HTTP method-specific access control.

## Table of Contents

- [Overview](#overview)
- [Route Types](#route-types)
- [Configuration](#configuration)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Raco Hotels API supports three types of route access:

1. **Fully Public Routes** - No authentication required for any HTTP method
2. **Method-Specific Public Routes** - Public for specific HTTP methods only (e.g., GET public, POST/PUT/DELETE protected)
3. **Fully Protected Routes** - Authentication required for all HTTP methods

## Route Types

### 1. Fully Public Routes

Routes that are accessible without authentication for all HTTP methods.

**Examples:**

- `/health` - System health check
- `/api-info` - API information
- `/auth/login` - User authentication

### 2. Method-Specific Public Routes

Routes where only specific HTTP methods are public, while others require authentication.

**Examples:**

- `GET /hotels` - Public (browse hotels)
- `POST /hotels` - Protected (create hotel)
- `PUT /hotels/:id` - Protected (update hotel)
- `DELETE /hotels/:id` - Protected (delete hotel)

### 3. Fully Protected Routes

Routes that require authentication for all HTTP methods.

**Examples:**

- `/users` - User management (admin only)
- `/bookings` - Booking management
- `/admin/*` - Administrative functions

## Configuration

### 1. PUBLIC_ROUTES Configuration

Configure public routes in `backend/src/config/routes.ts`:

```typescript
export const PUBLIC_ROUTES = [
  // Fully public routes (all methods)
  '/auth/login',
  '/auth/logout',
  '/auth/refresh',
  '/health',
  '/api-info',

  // Method-specific public routes
  'GET:/hotels', // Only GET is public
  'GET:/room-types', // Only GET is public
  'GET:/amenities', // Only GET is public

  // Add more routes as needed
] as const;
```

**Format Options:**

- `"/route"` → All HTTP methods are public
- `"GET:/route"` → Only GET method is public
- `"POST:/route"` → Only POST method is public

### 2. Route Pattern Matching

For dynamic route patterns, use `PUBLIC_ROUTE_PATTERNS`:

```typescript
export const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/public\/.*$/, // All routes under /public/
  /^\/hotels\/[^\/]+$/, // Individual hotel pages
];
```

## Implementation Examples

### Example 1: Making Hotels Browse Public

**Step 1:** Configure in `routes.ts`

```typescript
export const PUBLIC_ROUTES = [
  // ... other routes
  'GET:/hotels', // Only GET method is public
] as const;
```

**Step 2:** Update route definition to use `createPublicRoute`

```typescript
// backend/src/definitions/hotel.definition.ts
export const HotelRouteDefinitions = {
  getHotels: createPublicRoute({
    // Changed from createAuthenticatedRoute
    method: 'get',
    path: '/hotels',
    summary: 'Get all hotels',
    // ... other config
  }),

  createHotel: createAuthenticatedRoute({
    // Remains protected
    method: 'post',
    path: '/hotels',
    // ... config
  }),
};
```

**Step 3:** Update route handler to conditionally check permissions

```typescript
// backend/src/routes/hotel.route.ts
import { isPublicRoute, normalizePath } from '../config/routes';

hotelRoutes.openapi(HotelRouteDefinitions.getHotels, async (c) => {
  // Check if this is a public route - if not, require permissions
  const normalizedPath = normalizePath(c.req.path);
  const method = c.req.method;
  if (!isPublicRoute(normalizedPath, method)) {
    await assertPermission(c, PERMISSIONS.HOTELS_READ);
  }
  return HotelController.getHotels(c as AppContext);
});
```

**Step 4:** Use `globalAuthMiddleware` in route setup

```typescript
// backend/src/routes/hotel.route.ts
import { globalAuthMiddleware } from '../middleware/public-routes';

// Replace direct authMiddleware with globalAuthMiddleware
hotelRoutes.use('*', globalAuthMiddleware());
```

### Example 2: Creating a Fully Public Route

**Step 1:** Add to PUBLIC_ROUTES

```typescript
export const PUBLIC_ROUTES = [
  // ... other routes
  '/contact', // All methods public
] as const;
```

**Step 2:** Use `createPublicRoute` in definition

```typescript
export const ContactRouteDefinitions = {
  submitContact: createPublicRoute({
    method: 'post',
    path: '/contact',
    summary: 'Submit contact form',
    // ... config
  }),
};
```

**Step 3:** No permission checks needed in handler

```typescript
contactRoutes.openapi(ContactRouteDefinitions.submitContact, async (c) => {
  // No permission check - fully public
  return ContactController.submitContact(c);
});
```

### Example 3: Creating a Fully Protected Route

**Step 1:** Do NOT add to PUBLIC_ROUTES

**Step 2:** Use `createAuthenticatedRoute` in definition

```typescript
export const AdminRouteDefinitions = {
  getAnalytics: createAuthenticatedRoute({
    method: 'get',
    path: '/admin/analytics',
    summary: 'Get analytics data',
    // ... config
  }),
};
```

**Step 3:** Always check permissions in handler

```typescript
adminRoutes.openapi(AdminRouteDefinitions.getAnalytics, async (c) => {
  await assertPermission(c, PERMISSIONS.ADMIN_READ);
  return AdminController.getAnalytics(c);
});
```

## Best Practices

### 1. Security First

- Default to protected routes - only make routes public when necessary
- Use method-specific public access when possible
- Always validate that public routes don't expose sensitive data

### 2. Route Organization

- Group related routes together in the PUBLIC_ROUTES array
- Use clear comments to explain why routes are public
- Keep the list organized and easy to maintain

### 3. Testing

Always test both scenarios:

```bash
# Test public access (should work)
curl "http://localhost:8787/api/hotels"

# Test protected methods (should fail)
curl -X POST "http://localhost:8787/api/hotels" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hotel"}'
```

### 4. Documentation

- Update OpenAPI documentation to reflect public vs protected endpoints
- Use appropriate HTTP status codes (401 for authentication required)
- Provide clear error messages

### 5. Monitoring

- Log public route access for analytics
- Monitor for abuse of public endpoints
- Implement rate limiting for public routes if needed

## Troubleshooting

### Route Still Returns 401 Even Though Configured as Public

**Symptoms:**

- Route is in PUBLIC_ROUTES
- Still getting "Authentication required" error

**Causes & Solutions:**

1. **Permission check in route handler**

   ```typescript
   // ❌ Problem: Always checking permissions
   await assertPermission(c, PERMISSIONS.SOME_PERMISSION);

   // ✅ Solution: Conditional permission check
   if (!isPublicRoute(normalizedPath, method)) {
     await assertPermission(c, PERMISSIONS.SOME_PERMISSION);
   }
   ```

2. **Using createAuthenticatedRoute instead of createPublicRoute**

   ```typescript
   // ❌ Problem: Forces authentication at OpenAPI level
   getItems: createAuthenticatedRoute({...})

   // ✅ Solution: Use createPublicRoute for public endpoints
   getItems: createPublicRoute({...})
   ```

3. **Not using globalAuthMiddleware**

   ```typescript
   // ❌ Problem: Direct authMiddleware bypasses public route checks
   routes.use('*', authMiddleware);

   // ✅ Solution: Use globalAuthMiddleware
   routes.use('*', globalAuthMiddleware());
   ```

### Method-Specific Access Not Working

**Check the route format:**

```typescript
// ❌ Wrong format
'GET /hotels';

// ✅ Correct format
'GET:/hotels';
```

### Path Normalization Issues

**Check that paths are normalized correctly:**

```typescript
// API request: /api/hotels
// Normalized path: /hotels (removes /api prefix)
// PUBLIC_ROUTES should contain: "GET:/hotels"
```

## File Structure

When implementing public/protected routes, you'll typically modify these files:

```
backend/src/
├── config/
│   └── routes.ts              # PUBLIC_ROUTES configuration
├── definitions/
│   └── [entity].definition.ts # Route definitions (public vs authenticated)
├── routes/
│   └── [entity].route.ts      # Route handlers with conditional permissions
└── middleware/
    ├── public-routes.ts       # globalAuthMiddleware
    └── permissions.ts         # assertPermission helper
```

## Examples in the Codebase

See these files for working examples:

- **Hotel routes:** `backend/src/routes/hotel.route.ts`
- **Public routes config:** `backend/src/config/routes.ts`
- **Route definitions:** `backend/src/definitions/hotel.definition.ts`
- **Global auth middleware:** `backend/src/middleware/public-routes.ts`

## Security Considerations

1. **Data Exposure**: Ensure public routes don't expose sensitive information
2. **Rate Limiting**: Consider implementing rate limiting for public endpoints
3. **Input Validation**: Always validate input even on public routes
4. **Logging**: Log access to public routes for monitoring
5. **CORS**: Configure CORS appropriately for public routes

## Future Enhancements

Potential improvements to the public/protected route system:

1. **Route-level rate limiting**
2. **API key authentication for public routes**
3. **Dynamic route configuration via database**
4. **Role-based public access (e.g., public for authenticated users)**
5. **Geographic restrictions for public routes**
