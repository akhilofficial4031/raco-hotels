/**
 * Common shared interfaces used across the application
 */

// Base timestamp fields for database entities
export interface BaseTimestamps {
  createdAt: string;
  updatedAt: string;
}

// Base database entity with ID and timestamps
export interface BaseEntity extends BaseTimestamps {
  id: number;
}

// Hotel-scoped entity (entities that belong to a specific hotel)
export interface HotelScopedEntity extends BaseEntity {
  hotelId: number;
}

// Pagination parameters for API requests
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Base filter interface with common search functionality
export interface BaseFilters {
  search?: string;
}

// Hotel-scoped filters (filters that can be applied to hotel-specific data)
export interface HotelScopedFilters extends BaseFilters {
  hotelId?: number;
}

// Active status filter (for entities with isActive field)
export interface ActiveStatusFilter {
  isActive?: number; // 0 | 1
}

// Date range filter
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

// Monetary value (used for pricing, fees, etc.)
export interface MonetaryAmount {
  baseAmountCents: number;
  taxAmountCents: number;
  feeAmountCents: number;
  discountAmountCents: number;
  totalAmountCents: number;
  balanceDueCents: number;
}

// Address information
export interface AddressInfo {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  countryCode: string | null;
}

// Geographic coordinates
export interface GeoCoordinates {
  latitude: number | null;
  longitude: number | null;
}

// Contact information
export interface ContactInfo {
  email: string | null;
  phone: string | null;
}

// Media/Image reference
export interface MediaReference {
  url: string;
  alt: string | null;
  sortOrder?: number;
}

// Database media entity
export interface DatabaseMediaReference extends BaseEntity, MediaReference {}

// Value types for pricing and discounts
export type ValueType = "percent" | "fixed";

// Common status types
export type EntityStatus = "active" | "inactive" | "pending" | "suspended";

// Room status types
export type RoomStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "out_of_order";

// Booking status types
export type BookingStatus =
  | "draft"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

// Payment status types
export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partial_refund";

// Review status types
export type ReviewStatus = "Pending" | "Approved" | "Rejected" | "Hidden";

// Fee/Tax scope types
export type FeeScope = "per_stay" | "per_night" | "per_person";
