import { USER_ROLES } from "../../constants";

// Canonical permission keys (string-based so they can be stored in DB easily)
export const PERMISSIONS = {
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  // Extend with other modules, e.g.:
  // HOTELS_READ: "hotels.read",
  // AMENITIES_UPDATE: "amenities.update",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Route-level permission mapping helper
export interface RoutePermission {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  // A regex tested against normalized c.req.path (module routers normalize their prefix)
  pathPattern: RegExp;
  permission: PermissionKey;
}

// Default role -> permissions mapping (fallback when DB-driven RBAC is not configured)
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
  ],
  [USER_ROLES.STAFF]: [PERMISSIONS.USERS_READ],
  [USER_ROLES.GUEST]: [],
};
