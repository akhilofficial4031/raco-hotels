# Public and Protected Routes Guide 🎯

**NEW: Smart Routes System** - Now developers only need to update the `PUBLIC_ROUTES` array!

This guide explains the new simplified approach to creating and configuring public and protected routes in the Raco Hotels API, including support for HTTP method-specific access control.

## Table of Contents

- [🚀 Quick Start (New Method)](#-quick-start-new-method)
- [Overview](#overview)
- [Route Types](#route-types)
- [New Smart Configuration](#new-smart-configuration)
- [Legacy Configuration](#legacy-configuration)
- [Migration Guide](#migration-guide)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start (New Method)

**The easiest way to manage routes:**

### 1. Add route to PUBLIC_ROUTES (Only step needed!)

```typescript
// backend/src/config/routes.ts
export const PUBLIC_ROUTES = [
  'GET:/hotels', // Only GET is public
  '/health', // All methods public
  'POST:/contact', // Only POST is public

  // Add your routes here ↓
  'GET:/your-endpoint', // Your new public route
] as const;
```

### 2. Use createRoute() everywhere (Same for all routes)

```typescript
// backend/src/definitions/your-entity.definition.ts
import { createRoute, ApiTags } from '../lib/route-wrapper';

export const YourEntityRouteDefinitions = {
  getItems: createRoute({
    // ← Same function for all routes!
    method: 'get', // Auto-determines public vs protected
    path: '/your-endpoint', // based on PUBLIC_ROUTES
    // ... config
  }),

  createItem: createRoute({
    // ← Same function here too!
    method: 'post', // Will be protected (not in PUBLIC_ROUTES)
    path: '/your-endpoint',
    // ... config
  }),
};
```

### 3. Use smartPermissionHandler() (Automatic permissions)

```typescript
// backend/src/routes/your-entity.route.ts
import { smartAuthMiddleware, smartPermissionHandler } from '../middleware/smart-auth';

routes.use('*', smartAuthMiddleware()); // ← Handles auth automatically

routes.openapi(
  YourEntityRouteDefinitions.getItems,
  smartPermissionHandler(PERMISSIONS.YOUR_READ, controller.getItems), // ← Auto permission check
);
```

**That's it!** ✨ No more manual conditional logic.

---

## Overview

The Raco Hotels API supports three types of route access:

1. **Fully Public Routes** - No authentication required for any HTTP method
2. **Method-Specific Public Routes** - Public for specific HTTP methods only (e.g., GET public, POST/PUT/DELETE protected)
3. **Fully Protected Routes** - Authentication required for all HTTP methods

**NEW**: The smart routes system automatically handles all of this based on your `PUBLIC_ROUTES` configuration.

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

## New Smart Configuration

**✨ NEW APPROACH**: Developers only need to update the `PUBLIC_ROUTES` array!

### 1. PUBLIC_ROUTES Configuration (Only Thing You Need!)

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

### 3. Smart Route Creation (Automatic)

The new system automatically determines route types:

```typescript
// backend/src/definitions/your-entity.definition.ts
import { createRoute } from '../lib/route-wrapper';

export const YourEntityRouteDefinitions = {
  // This automatically becomes public for GET (based on PUBLIC_ROUTES)
  // and protected for POST/PUT/DELETE
  getItems: createRoute({
    method: 'get',
    path: '/your-endpoint',
    // ... config
  }),
};
```

### 4. Smart Permission Handling (Automatic)

```typescript
// backend/src/routes/your-entity.route.ts
import { smartAuthMiddleware, smartPermissionHandler } from '../middleware/smart-auth';

routes.use('*', smartAuthMiddleware());

routes.openapi(
  YourEntityRouteDefinitions.getItems,
  smartPermissionHandler(
    PERMISSIONS.YOUR_READ,
    (c) => YourController.getItems(c), // Permissions automatically checked only for protected routes
  ),
);
```

---

## Legacy Configuration

**⚠️ DEPRECATED**: The old manual approach (still works but not recommended)

## Migration Guide

### 🔄 From Legacy to Smart Routes

**Before (Complex):**

```typescript
// ❌ Manual route type selection
getHotels: createPublicRoute({...}),      // Had to choose
createHotel: createAuthenticatedRoute({...}), // Had to choose

// ❌ Manual conditional permission checking
hotelRoutes.openapi(HotelRouteDefinitions.getHotels, async (c) => {
  const normalizedPath = normalizePath(c.req.path);
  const method = c.req.method;
  if (!isPublicRoute(normalizedPath, method)) {
    await assertPermission(c, PERMISSIONS.HOTELS_READ);
  }
  return HotelController.getHotels(c);
});
```

**After (Simple):**

```typescript
// ✅ Same function for everything
getHotels: createRoute({...}),        // Auto-determined
createHotel: createRoute({...}),      // Auto-determined

// ✅ Automatic permission handling
hotelRoutes.openapi(
  HotelRouteDefinitions.getHotels,
  smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) =>
    HotelController.getHotels(c)
  )
);
```

### Migration Script

Run the automatic migration:

```bash
node backend/scripts/migrate-to-smart-routes.js
```

### Manual Migration Steps

1. **Update imports:**

   ```typescript
   // From:
   import { createPublicRoute, createAuthenticatedRoute } from '../lib/openapi';

   // To:
   import { createRoute } from '../lib/route-wrapper';
   ```

2. **Update route definitions:**

   ```typescript
   // Replace all createPublicRoute and createAuthenticatedRoute with createRoute
   ```

3. **Update route handlers:**

   ```typescript
   // From:
   import { globalAuthMiddleware } from '../middleware/public-routes';
   routes.use('*', globalAuthMiddleware());

   // To:
   import { smartAuthMiddleware, smartPermissionHandler } from '../middleware/smart-auth';
   routes.use('*', smartAuthMiddleware());
   routes.openapi(def, smartPermissionHandler(PERM, handler));
   ```

---

## Implementation Examples

### Example 1: Making Hotels Browse Public (NEW WAY)

**Step 1:** Configure in `routes.ts` (ONLY STEP NEEDED!)

```typescript
export const PUBLIC_ROUTES = [
  // ... other routes
  'GET:/hotels', // Only GET method is public
] as const;
```

**Step 2:** Use `createRoute()` for everything (AUTOMATIC!)

```typescript
// backend/src/definitions/hotel.definition.ts
import { createRoute } from '../lib/route-wrapper';

export const HotelRouteDefinitions = {
  getHotels: createRoute({
    // ← Same function for all routes!
    method: 'get', // Auto-determines this is public
    path: '/hotels',
    summary: 'Get all hotels',
    // ... other config
  }),

  createHotel: createRoute({
    // ← Same function here too!
    method: 'post', // Auto-determines this is protected
    path: '/hotels',
    // ... config
  }),
};
```

**Step 3:** Use smart permission handler (AUTOMATIC!)

```typescript
// backend/src/routes/hotel.route.ts
import { smartAuthMiddleware, smartPermissionHandler } from '../middleware/smart-auth';

hotelRoutes.use('*', smartAuthMiddleware());

hotelRoutes.openapi(
  HotelRouteDefinitions.getHotels,
  smartPermissionHandler(
    PERMISSIONS.HOTELS_READ,
    (c) => HotelController.getHotels(c), // No manual permission check needed!
  ),
);
```

**That's it!** ✨ The system automatically:

- ✅ Makes GET `/hotels` public (no auth required)
- ✅ Makes POST `/hotels` protected (auth + permission required)
- ✅ Generates correct OpenAPI docs
- ✅ No manual conditional logic needed

### Example 2: Creating a Fully Public Route (NEW WAY)

**Step 1:** Add to PUBLIC_ROUTES (ONLY STEP NEEDED!)

```typescript
export const PUBLIC_ROUTES = [
  // ... other routes
  '/contact', // All methods public
] as const;
```

**Step 2:** Use `createRoute()` (AUTOMATIC!)

```typescript
import { createRoute } from '../lib/route-wrapper';

export const ContactRouteDefinitions = {
  submitContact: createRoute({
    // ← Same function as always!
    method: 'post', // Auto-determines this is public
    path: '/contact',
    summary: 'Submit contact form',
    // ... config
  }),
};
```

**Step 3:** Use smart handler (AUTOMATIC!)

```typescript
contactRoutes.openapi(
  ContactRouteDefinitions.submitContact,
  smartPermissionHandler(
    PERMISSIONS.CONTACT_SUBMIT,
    (c) => ContactController.submitContact(c), // No auth needed - automatically detected!
  ),
);
```

### Example 3: Creating a Fully Protected Route (NEW WAY)

**Step 1:** Do NOT add to PUBLIC_ROUTES (ALREADY PROTECTED BY DEFAULT!)

**Step 2:** Use `createRoute()` (AUTOMATIC!)

```typescript
import { createRoute } from '../lib/route-wrapper';

export const AdminRouteDefinitions = {
  getAnalytics: createRoute({
    // ← Same function as always!
    method: 'get', // Auto-determines this is protected
    path: '/admin/analytics', // (not in PUBLIC_ROUTES)
    summary: 'Get analytics data',
    // ... config
  }),
};
```

**Step 3:** Use smart handler (AUTOMATIC!)

```typescript
adminRoutes.openapi(
  AdminRouteDefinitions.getAnalytics,
  smartPermissionHandler(
    PERMISSIONS.ADMIN_READ,
    (c) => AdminController.getAnalytics(c), // Auth + permission automatically required!
  ),
);
```

**Result**: Route automatically requires authentication + `ADMIN_READ` permission.

## Best Practices

### 1. Security First (EASIER NOW!)

- **Default to protected**: Routes are protected by default unless in `PUBLIC_ROUTES`
- **Use method-specific access**: `"GET:/hotels"` instead of `"/hotels"` when only read access should be public
- **Validate public data**: Always ensure public routes don't expose sensitive information
- **Regular audits**: Review your `PUBLIC_ROUTES` array periodically

### 2. Route Organization (SIMPLER NOW!)

- **Group by functionality**: Organize `PUBLIC_ROUTES` by related features
- **Clear comments**: Explain why each route is public
- **Consistent format**: Use the same format for similar routes

```typescript
export const PUBLIC_ROUTES = [
  // Authentication (fully public)
  '/auth/login',
  '/auth/logout',

  // Browse endpoints (read-only public)
  'GET:/hotels',
  'GET:/room-types',
  'GET:/amenities',

  // Contact/support (fully public)
  '/contact',
  '/health',
] as const;
```

### 3. Testing (SAME AS BEFORE!)

Always test both scenarios:

```bash
# Test public access (should work)
curl "http://localhost:8787/api/hotels"

# Test protected methods (should fail without auth)
curl -X POST "http://localhost:8787/api/hotels" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hotel"}'

# Test protected methods (should work with auth)
curl -X POST "http://localhost:8787/api/hotels" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hotel"}'
```

### 4. Development Workflow (NEW!)

With the smart system, your workflow is:

1. **Add route to `PUBLIC_ROUTES`** (if it should be public)
2. **Use `createRoute()` everywhere** (no thinking required!)
3. **Use `smartPermissionHandler()`** (automatic permissions)
4. **Test it works**

That's it! No more complex decisions or manual conditional logic.

### 5. Documentation (AUTOMATIC!)

- ✅ OpenAPI docs automatically show correct security requirements
- ✅ HTTP status codes are handled automatically (401, 403, etc.)
- ✅ Error messages are consistent across all routes

### 6. Monitoring (SAME AS BEFORE!)

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
