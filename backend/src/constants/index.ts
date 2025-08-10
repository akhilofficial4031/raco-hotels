// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// User Roles
export const USER_ROLES = {
  // Customer is an alias for guest (users who book). Kept as alias to avoid DB migrations
  CUSTOMER: "guest",
  GUEST: "guest",
  STAFF: "staff",
  ADMIN: "admin",
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: "active",
  DISABLED: "disabled",
} as const;

// API Tags for OpenAPI
export const API_TAGS = {
  SYSTEM: "System",
  USERS: "Users",
  AUTH: "Authentication",
  HOTELS: "Hotels",
  AMENITIES: "Amenities",
  FEATURES: "Features",
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
