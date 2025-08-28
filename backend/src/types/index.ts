import type { JWTPayload } from "../config/jwt";
import type { Context } from "hono";

/**
 * Base context type for Hono with Cloudflare bindings
 */
export interface AppBindings {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  KV: KVNamespace;
  // Optional vars from wrangler [vars]
  R2_PUBLIC_BASE_URL?: string;
  EMAIL_API_KEY?: string;
}

/**
 * Context variables
 */
export interface AppVariables {
  user?: JWTPayload;
}

/**
 * Application context type
 */
export type AppContext = Context<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>;

/**
 * API Response types
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Common interfaces and types
export type {
  BaseTimestamps,
  BaseEntity,
  HotelScopedEntity,
  PaginationParams,
  PaginatedResponse,
  BaseFilters,
  HotelScopedFilters,
  ActiveStatusFilter,
  DateRangeFilter,
  MonetaryAmount,
  AddressInfo,
  GeoCoordinates,
  ContactInfo,
  MediaReference,
  DatabaseMediaReference,
  ValueType,
  EntityStatus,
  RoomStatus,
  BookingStatus,
  PaymentStatus,
  ReviewStatus,
  FeeScope,
} from "./common.interface";

// User-related types
export type {
  UserRole,
  UserStatus,
  DatabaseUser,
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from "./user.interface";

// Customer-related types
export type {
  DatabaseCustomer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerSearchFilters,
  CustomerWithBookingStats,
  CustomerBookingHistory,
} from "./customer.interface";

// Hotel-related types
export type {
  DatabaseHotel,
  DatabaseHotelWithRelations,
  LocationInfoImage,
  LocationInfoSection,
  HotelFilters,
  CreateHotelData,
  UpdateHotelData,
  DatabaseHotelImage,
  CreateHotelImageData,
} from "./hotel.interface";

// Amenity-related types
export type {
  DatabaseAmenity,
  CreateAmenityData,
  UpdateAmenityData,
  AmenityFilters,
} from "./amenity.interface";

// Addon-related types
export type {
  DatabaseAddon,
  CreateAddonData,
  UpdateAddonData,
  AddonFilters,
  DatabaseRoomTypeAddon,
} from "./addon.interface";

// Feature-related types
export type {
  DatabaseFeature,
  CreateFeatureData,
  UpdateFeatureData,
  FeatureFilters,
} from "./feature.interface";

// Room type-related types
export type {
  DatabaseRoomType,
  DatabaseRoomTypeImage,
  DatabaseRoomTypeAmenity,
  RoomTypeFilters,
  CreateRoomTypeData,
  CreateRoomTypeImageData,
  UpdateRoomTypeData,
  UpdateRoomTypeImageData,
} from "./room_type.interface";

// Room-related types
export type {
  DatabaseRoom,
  RoomFilters,
  CreateRoomData,
  CreateRoomsData,
  UpdateRoomData,
} from "./room.interface";

// Review-related types
export type {
  DatabaseReview,
  CreateReviewData,
  UpdateReviewData,
  ReviewFilters,
} from "./review.interface";

// Content-related types
export type {
  DatabaseContentBlock,
  CreateContentBlockData,
  UpdateContentBlockData,
  ContentBlockFilters,
} from "./content.interface";

// Cancellation policy-related types
export type {
  DatabaseCancellationPolicy,
  CreateCancellationPolicyData,
  UpdateCancellationPolicyData,
  CancellationPolicyFilters,
} from "./cancellation_policy.interface";

// Promo code-related types
export type {
  DatabasePromoCode,
  PromoCodeFilters,
  CreatePromoCodeData,
  UpdatePromoCodeData,
} from "./promo_code.interface";

// Tax and fee-related types
export type {
  DatabaseTaxFee,
  TaxFeeFilters,
  CreateTaxFeeData,
  UpdateTaxFeeData,
} from "./tax_fee.interface";

// Booking-related types
export type {
  DatabaseBooking,
  CreateBookingData,
  UpdateBookingData,
} from "./booking.interface";

// Booking draft-related types
export type {
  DatabaseBookingDraft,
  CreateBookingDraftData,
  UpdateBookingDraftData,
} from "./booking_draft.interface";

// Availability-related types
export type {
  AvailabilityFilters,
  AvailabilitySearchParams,
} from "./availability.interface";
