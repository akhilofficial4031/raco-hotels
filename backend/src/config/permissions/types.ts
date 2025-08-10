import { USER_ROLES } from "../../constants";

// Canonical permission keys (string-based so they can be stored in DB easily)
export const PERMISSIONS = {
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  // Extend with other modules, e.g.:
  HOTELS_READ: "hotels.read",
  HOTELS_CREATE: "hotels.create",
  HOTELS_UPDATE: "hotels.update",
  HOTELS_DELETE: "hotels.delete",

  AMENITIES_READ: "amenities.read",
  AMENITIES_CREATE: "amenities.create",
  AMENITIES_UPDATE: "amenities.update",
  AMENITIES_DELETE: "amenities.delete",

  FEATURES_READ: "features.read",
  FEATURES_CREATE: "features.create",
  FEATURES_UPDATE: "features.update",
  FEATURES_DELETE: "features.delete",
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
    PERMISSIONS.HOTELS_READ,
    PERMISSIONS.HOTELS_CREATE,
    PERMISSIONS.HOTELS_UPDATE,
    PERMISSIONS.HOTELS_DELETE,
    PERMISSIONS.AMENITIES_READ,
    PERMISSIONS.AMENITIES_CREATE,
    PERMISSIONS.AMENITIES_UPDATE,
    PERMISSIONS.AMENITIES_DELETE,
    PERMISSIONS.FEATURES_READ,
    PERMISSIONS.FEATURES_CREATE,
    PERMISSIONS.FEATURES_UPDATE,
    PERMISSIONS.FEATURES_DELETE,
  ],
  [USER_ROLES.STAFF]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.HOTELS_READ,
    PERMISSIONS.AMENITIES_READ,
    PERMISSIONS.FEATURES_READ,
  ],
  [USER_ROLES.GUEST]: [],
};
