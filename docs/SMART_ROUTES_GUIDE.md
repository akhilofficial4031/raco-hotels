# Smart Routes System - Developer Guide

This guide explains the new smart routes system that makes it extremely easy for developers to manage public and protected routes. **Now developers only need to update the `PUBLIC_ROUTES` array!**

## 🎯 Goal

The new system automatically handles:
- Route authentication (public vs protected)
- Permission checking
- OpenAPI documentation generation
- Method-specific access control

**Developers only need to remember**: Update `PUBLIC_ROUTES` array in `config/routes.ts`

## 🚀 Quick Start

### 1. Configure Public Routes

In `backend/src/config/routes.ts`, simply add your route to the `PUBLIC_ROUTES` array:

```typescript
export const PUBLIC_ROUTES = [
  // Fully public routes (all methods)
  "/auth/login",
  "/health",
  "/api-info",

  // Method-specific public routes
  "GET:/hotels",        // Only GET is public
  "GET:/room-types",    // Only GET is public
  "GET:/amenities",     // Only GET is public
  
  // Add your new routes here
  "GET:/your-endpoint", // Only GET public
  "/your-fully-public-endpoint", // All methods public
] as const;
```

### 2. Create Route Definitions

Use the new `createRoute()` function that automatically determines public vs authenticated:

```typescript
// backend/src/definitions/your-entity.definition.ts
import { createRoute, ApiTags } from "../lib/route-wrapper";

export const YourEntityRouteDefinitions = {
  // This will automatically be public for GET, protected for POST/PUT/DELETE
  // based on your PUBLIC_ROUTES configuration
  getItems: createRoute({
    method: "get",
    path: "/your-endpoint",
    summary: "Get items",
    // ... other config
  }),

  createItem: createRoute({
    method: "post", 
    path: "/your-endpoint",
    summary: "Create item",
    // ... other config
  }),
};
```

### 3. Create Route Handlers

Use the new `smartPermissionHandler()` for automatic permission checking:

```typescript
// backend/src/routes/your-entity.route.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { smartAuthMiddleware, smartPermissionHandler } from "../middleware/smart-auth";
import { PERMISSIONS } from "../config/permissions";

const routes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Apply smart authentication middleware
routes.use("*", smartAuthMiddleware());

// Smart permission handlers automatically check permissions for protected routes
routes.openapi(
  YourEntityRouteDefinitions.getItems,
  smartPermissionHandler(PERMISSIONS.YOUR_READ, (c) => 
    YourController.getItems(c as AppContext)
  )
);

routes.openapi(
  YourEntityRouteDefinitions.createItem,
  smartPermissionHandler(PERMISSIONS.YOUR_CREATE, (c) => 
    YourController.createItem(c as AppContext)
  )
);
```

## 🔧 How It Works

### Automatic Route Type Detection

The `createRoute()` function automatically:

1. **Checks `PUBLIC_ROUTES` configuration**
2. **Determines if route/method combo is public**
3. **Creates appropriate route type:**
   - Public routes → `createConditionalRoute()` (flexible auth)
   - Protected routes → `createAuthenticatedRoute()` (full auth required)

### Automatic Permission Checking

The `smartPermissionHandler()` automatically:

1. **Checks if current route/method is public**
2. **Skips permission check for public routes**
3. **Applies permission check for protected routes**
4. **Executes your controller method**

### Smart Authentication Middleware

The `smartAuthMiddleware()` automatically:

1. **Checks `PUBLIC_ROUTES` configuration**
2. **Skips authentication for public routes**
3. **Applies authentication for protected routes**
4. **Handles CSRF for state-changing operations**

## 📋 Migration Guide

### Before (Complex)

```typescript
// Definition file - had to choose between createPublicRoute vs createAuthenticatedRoute
getHotels: createPublicRoute({...}),      // Public
createHotel: createAuthenticatedRoute({...}), // Protected

// Route handler - manual conditional logic
hotelRoutes.openapi(HotelRouteDefinitions.getHotels, async (c) => {
  const normalizedPath = normalizePath(c.req.path);
  const method = c.req.method;
  if (!isPublicRoute(normalizedPath, method)) {
    await assertPermission(c, PERMISSIONS.HOTELS_READ);
  }
  return HotelController.getHotels(c as AppContext);
});
```

### After (Simple)

```typescript
// Definition file - use createRoute() for everything
getHotels: createRoute({...}),      // Auto-determined
createHotel: createRoute({...}),    // Auto-determined

// Route handler - automatic permission handling
hotelRoutes.openapi(
  HotelRouteDefinitions.getHotels,
  smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) => 
    HotelController.getHotels(c as AppContext)
  )
);
```

## 🎨 Advanced Usage

### Pattern-Based Public Routes

For dynamic routes, use `PUBLIC_ROUTE_PATTERNS`:

```typescript
export const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/public\/.*$/,     // All routes under /public/
  /^\/hotels\/[^\/]+$/, // Individual hotel pages: /hotels/{id}
];
```

### Controller-Level Smart Permissions

Use the decorator pattern in controllers:

```typescript
import { withSmartPermissions } from "../middleware/smart-auth";

export const HotelController = {
  getHotels: withSmartPermissions(PERMISSIONS.HOTELS_READ, async (c) => {
    // Your logic here - permissions automatically checked for protected routes
    // No permission check for public routes
  }),
};
```

### Conditional Logic in Controllers

Check if current route is public:

```typescript
import { isCurrentRoutePublic } from "../middleware/smart-auth";

export async function someController(c: AppContext) {
  if (isCurrentRoutePublic(c)) {
    // Handle public access
    return getPublicData();
  } else {
    // Handle authenticated access  
    return getPrivateData(c.get("user"));
  }
}
```

## 🧪 Testing Your Routes

### Test Public Access

```bash
# Should work for public routes
curl "http://localhost:8787/api/hotels"

# Should fail for protected methods  
curl -X POST "http://localhost:8787/api/hotels" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hotel"}'
```

### Test Method-Specific Access

```bash
# GET should work (if configured as "GET:/hotels")
curl "http://localhost:8787/api/hotels"

# POST should require authentication
curl -X POST "http://localhost:8787/api/hotels" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hotel"}'
```

## 🔍 Troubleshooting

### Route Still Requires Auth Despite Being in PUBLIC_ROUTES

1. **Check the route format**:
   ```typescript
   // ❌ Wrong
   'GET /hotels'
   
   // ✅ Correct  
   'GET:/hotels'
   ```

2. **Check path normalization**:
   - API requests to `/api/hotels` should have `/hotels` in PUBLIC_ROUTES
   - The system automatically removes `/api` prefix

3. **Verify middleware usage**:
   ```typescript
   // ✅ Use smart middleware
   routes.use("*", smartAuthMiddleware());
   
   // ❌ Don't use old middleware
   routes.use("*", globalAuthMiddleware());
   ```

### Permissions Not Working

1. **Check permission handler**:
   ```typescript
   // ✅ Use smart handler
   smartPermissionHandler(PERMISSIONS.SOME_PERM, controller)
   
   // ❌ Don't use manual checks
   assertPermission(c, PERMISSIONS.SOME_PERM)
   ```

## 📚 Example: Complete New Entity

Here's how to add a complete new entity with public GET and protected POST/PUT/DELETE:

### 1. Update PUBLIC_ROUTES

```typescript
// backend/src/config/routes.ts
export const PUBLIC_ROUTES = [
  // ... existing routes
  "GET:/products", // Only GET is public
] as const;
```

### 2. Create Route Definition

```typescript
// backend/src/definitions/product.definition.ts
import { createRoute, ApiTags } from "../lib/route-wrapper";

export const ProductRouteDefinitions = {
  getProducts: createRoute({
    method: "get",
    path: "/products",
    summary: "Get all products",
    // ... config
  }),
  
  createProduct: createRoute({
    method: "post", 
    path: "/products",
    summary: "Create product",
    // ... config
  }),
};
```

### 3. Create Route Handler

```typescript
// backend/src/routes/product.route.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { smartAuthMiddleware, smartPermissionHandler } from "../middleware/smart-auth";
import { PERMISSIONS } from "../config/permissions";

const productRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

productRoutes.use("*", smartAuthMiddleware());

productRoutes.openapi(
  ProductRouteDefinitions.getProducts,
  smartPermissionHandler(PERMISSIONS.PRODUCTS_READ, (c) => 
    ProductController.getProducts(c as AppContext)
  )
);

productRoutes.openapi(
  ProductRouteDefinitions.createProduct,
  smartPermissionHandler(PERMISSIONS.PRODUCTS_CREATE, (c) => 
    ProductController.createProduct(c as AppContext)
  )
);

export default productRoutes;
```

**That's it!** The system automatically handles:
- ✅ GET `/products` is public (no auth required)
- ✅ POST `/products` requires authentication + PRODUCTS_CREATE permission
- ✅ OpenAPI docs are correctly generated
- ✅ CSRF protection for state-changing operations

## 🎉 Benefits

### For Developers
- **Simple**: Only update `PUBLIC_ROUTES` array
- **Consistent**: Same pattern for all routes
- **Less Error-Prone**: No manual conditional logic
- **Self-Documenting**: Route access is clear from configuration

### For the System
- **Maintainable**: Centralized configuration
- **Flexible**: Supports method-specific access
- **Secure**: Default to protected, opt-in to public
- **Performant**: Efficient route checking

## 🔧 Migration Checklist

- [ ] Update `PUBLIC_ROUTES` array with your routes
- [ ] Replace `createPublicRoute`/`createAuthenticatedRoute` with `createRoute`
- [ ] Replace manual permission checks with `smartPermissionHandler`
- [ ] Replace `globalAuthMiddleware` with `smartAuthMiddleware`
- [ ] Test public routes work without auth
- [ ] Test protected routes require auth + permissions
- [ ] Update any custom middleware to use smart system

---

**Remember**: The old system still works, but the new smart system is much easier to use and maintain!
