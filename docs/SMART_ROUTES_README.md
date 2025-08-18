# Smart Routes System 🎯

**The easiest way to manage public and protected routes in Raco Hotels API**

## ⚡ Quick Start

### 1. Add Route to PUBLIC_ROUTES (Only Step Needed!)

```typescript
// backend/src/config/routes.ts
export const PUBLIC_ROUTES = [
  "GET:/hotels",        // Only GET is public
  "/health",            // All methods public
  "POST:/contact",      // Only POST is public
  
  // Add your routes here ↓
  "GET:/your-endpoint", // Your new public route
] as const;
```

### 2. Create Route Definition (Same for All Routes)

```typescript
// backend/src/definitions/your-entity.definition.ts
import { createRoute, ApiTags } from "../lib/route-wrapper";

export const YourEntityRouteDefinitions = {
  getItems: createRoute({        // ← Same function for all routes!
    method: "get",               // Auto-determines public vs protected
    path: "/your-endpoint",      // based on PUBLIC_ROUTES
    summary: "Get items",
    // ... rest of config
  }),
  
  createItem: createRoute({      // ← Same function here too!
    method: "post",              // Will be protected (not in PUBLIC_ROUTES)
    path: "/your-endpoint", 
    summary: "Create item",
    // ... rest of config
  }),
};
```

### 3. Create Route Handler (Automatic Permissions)

```typescript
// backend/src/routes/your-entity.route.ts
import { smartAuthMiddleware, smartPermissionHandler } from "../middleware/smart-auth";

const routes = new OpenAPIHono();

routes.use("*", smartAuthMiddleware());  // ← Handles auth automatically

routes.openapi(
  YourEntityRouteDefinitions.getItems,
  smartPermissionHandler(PERMISSIONS.YOUR_READ, (c) =>    // ← Auto permission check
    YourController.getItems(c)  // Only checks permissions if route is protected
  )
);
```

**That's it!** ✨

- ✅ GET `/your-endpoint` is automatically public (no auth needed)
- ✅ POST `/your-endpoint` is automatically protected (needs auth + permission)
- ✅ OpenAPI docs generated correctly
- ✅ No manual conditional logic needed

## 🆚 Before vs After

### Before (Complex)
```typescript
// ❌ Had to manually choose route type
getItems: createPublicRoute({...}),      // For public
createItem: createAuthenticatedRoute({...}), // For protected

// ❌ Manual conditional permission checking
routes.openapi(definition, async (c) => {
  const path = normalizePath(c.req.path);
  const method = c.req.method;
  if (!isPublicRoute(path, method)) {
    await assertPermission(c, PERMISSIONS.SOME_PERM);
  }
  return controller(c);
});
```

### After (Simple)
```typescript
// ✅ Same function for everything
getItems: createRoute({...}),        // Auto-determined
createItem: createRoute({...}),      // Auto-determined

// ✅ Automatic permission handling
routes.openapi(
  definition,
  smartPermissionHandler(PERMISSIONS.SOME_PERM, controller)
);
```

## 📋 Developer Checklist

To add a new route:

- [ ] Add route to `PUBLIC_ROUTES` array (if it should be public)
- [ ] Use `createRoute()` in definition file
- [ ] Use `smartPermissionHandler()` in route file
- [ ] Test it works

**No more:**
- ❌ Choosing between `createPublicRoute` vs `createAuthenticatedRoute`
- ❌ Manual `isPublicRoute()` checks
- ❌ Conditional permission logic
- ❌ Multiple middleware configurations

## 🔧 Configuration Options

### Method-Specific Public Access
```typescript
export const PUBLIC_ROUTES = [
  "GET:/products",     // Only GET public, POST/PUT/DELETE protected
  "POST:/contact",     // Only POST public
  "/health",           // All methods public
] as const;
```

### Pattern-Based Routes
```typescript
export const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/public\/.*$/,     // All /public/* routes
  /^\/assets\/.*$/,     // All /assets/* routes
];
```

## 🎯 Migration Guide

Run the migration script:
```bash
node backend/scripts/migrate-to-smart-routes.js
```

Or migrate manually:

1. **Update imports:**
   ```typescript
   // From:
   import { createPublicRoute, createAuthenticatedRoute } from "../lib/openapi";
   
   // To:
   import { createRoute } from "../lib/route-wrapper";
   ```

2. **Update route definitions:**
   ```typescript
   // From:
   getItems: createPublicRoute({...}),
   createItem: createAuthenticatedRoute({...}),
   
   // To:
   getItems: createRoute({...}),
   createItem: createRoute({...}),
   ```

3. **Update route handlers:**
   ```typescript
   // From:
   import { globalAuthMiddleware } from "../middleware/public-routes";
   routes.use("*", globalAuthMiddleware());
   
   // To:
   import { smartAuthMiddleware, smartPermissionHandler } from "../middleware/smart-auth";
   routes.use("*", smartAuthMiddleware());
   routes.openapi(def, smartPermissionHandler(PERM, handler));
   ```

## 🧪 Testing

```bash
# Test public access (should work)
curl "http://localhost:8787/api/hotels"

# Test protected access (should require auth)  
curl -X POST "http://localhost:8787/api/hotels" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

## ⚠️ Important Notes

- **Default behavior**: Routes are protected unless explicitly added to `PUBLIC_ROUTES`
- **Path format**: Use `/hotels` in `PUBLIC_ROUTES`, not `/api/hotels` (auto-normalized)
- **Method format**: Use `GET:/hotels` for method-specific access
- **Backward compatibility**: Old system still works alongside new system

## 📚 Complete Example

```typescript
// 1. Configure public routes
// backend/src/config/routes.ts
export const PUBLIC_ROUTES = [
  "GET:/products",  // Browse products publicly
] as const;

// 2. Define routes (same function for all)
// backend/src/definitions/product.definition.ts
import { createRoute, ApiTags } from "../lib/route-wrapper";

export const ProductRouteDefinitions = {
  getProducts: createRoute({
    method: "get",
    path: "/products", 
    summary: "Get products",
    tags: [ApiTags.PRODUCTS],
    // ... config
  }),
  
  createProduct: createRoute({
    method: "post",
    path: "/products",
    summary: "Create product", 
    tags: [ApiTags.PRODUCTS],
    // ... config
  }),
};

// 3. Handle routes (automatic permissions)
// backend/src/routes/product.route.ts
import { smartAuthMiddleware, smartPermissionHandler } from "../middleware/smart-auth";

const productRoutes = new OpenAPIHono();
productRoutes.use("*", smartAuthMiddleware());

productRoutes.openapi(
  ProductRouteDefinitions.getProducts,
  smartPermissionHandler(PERMISSIONS.PRODUCTS_READ, (c) =>
    ProductController.getProducts(c)  // No auth needed (public route)
  )
);

productRoutes.openapi(
  ProductRouteDefinitions.createProduct,
  smartPermissionHandler(PERMISSIONS.PRODUCTS_CREATE, (c) =>
    ProductController.createProduct(c)  // Auth + permission required
  )
);
```

**Result:**
- ✅ `GET /products` works without authentication
- ✅ `POST /products` requires authentication + `PRODUCTS_CREATE` permission
- ✅ OpenAPI docs show correct security requirements
- ✅ Zero manual conditional logic

---

🎉 **That's it!** Enjoy the simplified route management system.

For advanced usage and troubleshooting, see [SMART_ROUTES_GUIDE.md](./SMART_ROUTES_GUIDE.md).
