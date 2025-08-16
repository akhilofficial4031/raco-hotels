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

  BOOKINGS_READ: "bookings.read",
  BOOKINGS_CREATE: "bookings.create",
  BOOKINGS_UPDATE: "bookings.update",
  BOOKINGS_DELETE: "bookings.delete",

  ROOMS_READ: "rooms.read",
  ROOMS_CREATE: "rooms.create",
  ROOMS_UPDATE: "rooms.update",
  ROOMS_DELETE: "rooms.delete",

  ROOM_TYPES_READ: "room_types.read",
  ROOM_TYPES_CREATE: "room_types.create",
  ROOM_TYPES_UPDATE: "room_types.update",
  ROOM_TYPES_DELETE: "room_types.delete",

  CANCELLATION_POLICIES_READ: "cancellation_policies.read",
  CANCELLATION_POLICIES_CREATE: "cancellation_policies.create",
  CANCELLATION_POLICIES_UPDATE: "cancellation_policies.update",
  CANCELLATION_POLICIES_DELETE: "cancellation_policies.delete",

  AVAILABILITY_READ: "availability.read",
  AVAILABILITY_CREATE: "availability.create",
  AVAILABILITY_UPDATE: "availability.update",
  AVAILABILITY_DELETE: "availability.delete",

  CONTENT_READ: "content.read",
  CONTENT_CREATE: "content.create",
  CONTENT_UPDATE: "content.update",
  CONTENT_DELETE: "content.delete",

  PROMO_CODES_READ: "promo_codes.read",
  PROMO_CODES_CREATE: "promo_codes.create",
  PROMO_CODES_UPDATE: "promo_codes.update",
  PROMO_CODES_DELETE: "promo_codes.delete",

  REVIEWS_READ: "reviews.read",
  REVIEWS_CREATE: "reviews.create",
  REVIEWS_UPDATE: "reviews.update",
  REVIEWS_DELETE: "reviews.delete",
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
    PERMISSIONS.BOOKINGS_READ,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.BOOKINGS_DELETE,
  ],
  [USER_ROLES.STAFF]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.HOTELS_READ,
    PERMISSIONS.AMENITIES_READ,
    PERMISSIONS.FEATURES_READ,
    PERMISSIONS.BOOKINGS_READ,
    PERMISSIONS.BOOKINGS_UPDATE,
  ],
  [USER_ROLES.GUEST]: [],
};
