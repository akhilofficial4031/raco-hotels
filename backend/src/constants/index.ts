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
  POLICIES: "Policies",
  AMENITIES: "Amenities",
  FEATURES: "Features",
  ROOMS: "Rooms",
  BOOKINGS: "Bookings",
  REVIEWS: "Reviews",
  CONTENT: "Content",
  TAXES: "Taxes",
  PROMOTIONS: "Promotions",
  PAYMENTS: "Payments",
  NOTIFICATIONS: "Notifications",
  SETTINGS: "Settings",
  REPORTS: "Reports",
} as const;

// Booking Sources
export const BOOKING_SOURCES = {
  WEB: "web",
  FRONT_OFFICE: "front_office",
  PHONE: "phone",
  EMAIL: "email",
  MOBILE_APP: "mobile_app",
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: "card",
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
  UPI: "upi",
  NETBANKING: "netbanking",
  WALLET: "wallet",
  PENDING: "pending",
} as const;

// Payment Processors
export const PAYMENT_PROCESSORS = {
  STRIPE: "stripe",
  RAZORPAY: "razorpay",
  PAYPAL: "paypal",
  FRONT_OFFICE: "front_office",
  MANUAL: "manual",
} as const;

// Booking Status
export const BOOKING_STATUS = {
  DRAFT: "draft",
  RESERVED: "reserved",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
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
