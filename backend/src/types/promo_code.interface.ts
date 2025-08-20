import type {
  HotelScopedEntity,
  ValueType,
  HotelScopedFilters,
  ActiveStatusFilter,
  DateRangeFilter,
} from "./common.interface";

/**
 * Database representation of a promo code
 */
export interface DatabasePromoCode extends HotelScopedEntity {
  code: string;
  type: ValueType;
  value: number; // percent (0..100) or amount in cents
  startDate: string | null;
  endDate: string | null;
  minNights: number | null;
  minAmountCents: number | null;
  maxDiscountCents: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: number;
}

/**
 * Filters for querying promo codes
 */
export interface PromoCodeFilters
  extends HotelScopedFilters,
    ActiveStatusFilter,
    DateRangeFilter {
  code?: string;
  type?: ValueType;
}

/**
 * Data required to create a new promo code
 */
export interface CreatePromoCodeData {
  hotelId: number;
  code: string;
  type: ValueType;
  value: number;
  startDate?: string | null;
  endDate?: string | null;
  minNights?: number | null;
  minAmountCents?: number | null;
  maxDiscountCents?: number | null;
  usageLimit?: number | null;
  usageCount?: number;
  isActive?: number;
}

/**
 * Data that can be updated for a promo code
 */
export interface UpdatePromoCodeData
  extends Partial<Omit<CreatePromoCodeData, "hotelId" | "code">> {}
