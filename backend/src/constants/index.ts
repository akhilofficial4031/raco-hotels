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
  STAFF: "staff",
  ADMIN: "admin",
} as const;

// API Tags for OpenAPI
export const API_TAGS = {
  SYSTEM: "System",
  USERS: "Users",
  CUSTOMERS: "Customers",
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
  ADDONS: "Addons",
  DASHBOARD: "Dashboard",
  PUBLIC: "Public API",
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
  CONFIRMED: "confirmed",
  CHECKEDIN: "checkedin",
  CHECKEDOUT: "checkedout",
  CANCELLED: "cancelled",
  NOSHOW: "noshow",
  PAID: "paid",
  PARTIAL_PAID: "partial_paid",
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

// Tax Rates (as multipliers, e.g. 0.05 = 5%)
export const TAX_RATES = {
  ROOM_TAX: 0.05,
  EXTRA_ADULT_TAX: 0.05,
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
