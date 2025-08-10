## Permissions and RBAC

This backend uses a simple permission model with optional DB-backed configuration and a short‑lived KV cache. It lets you grant fine-grained access (e.g., staff can list users, admin can create/update/delete).

### Core ideas

- Permission keys (strings) represent actions, e.g., `users.read`, `users.create`.
- Routes map to permission keys using regex matchers.
- Roles map to permissions in two ways:
  - Code defaults in `backend/src/config/permissions.ts`
  - Optional DB tables (`role`, `permission`, `role_permission`)
- KV cache stores flattened role→permissions for ~120s to reduce DB reads.

### Where things live

- Permission configuration directory: `backend/src/config/permissions/`
  - `types.ts`: `PERMISSIONS`, `DEFAULT_ROLE_PERMISSIONS`, shared types
  - `users.ts`: legacy regex mapping for Users routes (not required with Option C)
  - `index.ts`: re-exports for easy `../config/permissions` imports
- Middleware that enforces permissions: `backend/src/middleware/permissions.ts`
  - `assertPermission(permission)` — inline check; works with DB/KV
  - `requirePermissionKey(permission)` — per-route middleware
  - `requirePermission(routePermissions)` and `permissionMatrix(...)` — legacy alternatives
- KV-cached permission fetch: `backend/src/services/permission.service.ts`
- Optional DB schema for dynamic roles/permissions:
  - `backend/drizzle/migrations/0001_permissions_rbac.sql`
  - `backend/drizzle/schema/permission.ts` (`role`, `permission`, `role_permission`)

## How to protect a route

1. Choose or create a permission key

- Update `PERMISSIONS` in `backend/src/config/permissions/types.ts` if needed:

```ts
export const PERMISSIONS = {
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  // Add more here, e.g. HOTELS_READ: "hotels.read"
} as const;
```

2. Enforce permission per route (recommended)

Use single-route guards. This works seamlessly with DB-backed roles via `PermissionService` (KV-cached) and falls back to code defaults when DB is empty.

- If you are using OpenAPI route definitions (recommended):

```ts
import { PERMISSIONS } from '../config/permissions';
import { assertPermission } from '../middleware/permissions';

userRoutes.openapi(UserRouteDefinitions.getUsers, async (c) => {
  await assertPermission(c, PERMISSIONS.USERS_READ);
  return UserController.getUsers(c as any);
});
```

- If you are using plain Hono routes, you can also attach a middleware:

```ts
import { requirePermissionKey } from '../middleware/permissions';
import { PERMISSIONS } from '../config/permissions';

userRoutes.get('/users', requirePermissionKey(PERMISSIONS.USERS_READ), UserController.getUsers);
```

## How to change who can access

Option A: Code defaults

- Edit `DEFAULT_ROLE_PERMISSIONS` in `backend/src/config/permissions/types.ts`:

```ts
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: [users.read, users.create, users.update, users.delete],
  staff: [users.read],
  guest: [],
};
```

- Example: to let staff create users, add `users.create` to `staff`.

Option B: DB-backed (recommended for future custom roles)

1. Ensure migration `0001_permissions_rbac.sql` is applied.
2. Seed tables:
   - Insert role: `INSERT INTO role(name, display_name) VALUES ('manager','Manager');`
   - Insert permissions if missing: `INSERT INTO permission(key, description) VALUES ('users.read','Read users');`
   - Link: `INSERT INTO role_permission(role_id, permission_id) VALUES (?, ?);`
3. No code changes required. The middleware fetches role→permissions from DB and caches them in KV.

## KV cache behavior

- Key: `perms:role:<roleName>` → JSON array of permission keys
- TTL: ~120 seconds
- On admin changes to roles/permissions, delete the role key to force refresh (you can wire this into your admin endpoints):

```ts
await c.env.KV.delete(`perms:role:${roleName}`);
```

## Examples

- Staff can list users, admin can do everything
  - Already configured by defaults (`staff` has `users.read`)
- Grant staff the ability to create users
  - Add `users.create` to `staff` in `DEFAULT_ROLE_PERMISSIONS`, or add in DB via `role_permission`
- Add a new protected route `/users/:id/status` (PATCH)
  - Map regex in `USER_ROUTE_PERMISSIONS` to `users.update` (already present)

## Notes

- Roles currently supported in code: `admin`, `staff`, `guest` (with `customer` alias pointing to `guest`).
- If a role has no DB mapping, code defaults apply. If neither exist for a role, permission is denied.
- Keep using `authMiddleware` for authentication and `csrfMiddleware` for state-changing requests.
