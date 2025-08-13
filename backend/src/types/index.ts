import type { JWTPayload } from "../config/jwt";
import type { Context } from "hono";

// Base context type for Hono with Cloudflare bindings
export interface AppBindings {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  KV: KVNamespace;
  // Optional vars from wrangler [vars]
  R2_PUBLIC_BASE_URL?: string;
}

// Context variables
export interface AppVariables {
  user?: JWTPayload;
}

export type AppContext = Context<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>;

// API Response types
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

// Re-export user-related types from user.interface.ts
export type {
  UserRole,
  UserStatus,
  DatabaseUser,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  PaginationParams,
  PaginatedResponse,
} from "./user.interface";

export type {
  DatabaseHotel,
  HotelFilters,
  CreateHotelData,
  UpdateHotelData,
  DatabaseHotelImage,
  CreateHotelImageData,
} from "./hotel.interface";

export type {
  DatabaseAmenity,
  CreateAmenityData,
  UpdateAmenityData,
} from "./amenity.interface";

export type {
  DatabaseFeature,
  CreateFeatureData,
  UpdateFeatureData,
} from "./feature.interface";

export type {
  DatabaseRoomType,
  DatabaseRoomTypeImage,
  DatabaseRoomTypeAmenity,
  DatabaseRoom,
} from "./room-type.interface";

export type { DatabaseReview } from "./review.interface";
export type {
  DatabaseContentBlock,
  CreateContentBlockData,
  UpdateContentBlockData,
} from "./content.interface";
export type { DatabaseTaxFee, DatabasePromoCode } from "./tax_promo.interface";
export type {
  DatabaseCancellationPolicy,
  CreateCancellationPolicyData,
  UpdateCancellationPolicyData,
} from "./cancellation_policy.interface";
