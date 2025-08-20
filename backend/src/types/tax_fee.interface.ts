import type {
  HotelScopedEntity,
  ValueType,
  FeeScope,
  HotelScopedFilters,
  ActiveStatusFilter,
} from "./common.interface";

/**
 * Database representation of a tax or fee
 */
export interface DatabaseTaxFee extends HotelScopedEntity {
  name: string;
  type: ValueType;
  value: number; // percent (0..100) or amount in cents
  scope: FeeScope;
  includedInPrice: number; // 0/1
  isActive: number; // 0/1
}

/**
 * Filters for querying tax fees
 */
export interface TaxFeeFilters extends HotelScopedFilters, ActiveStatusFilter {
  name?: string;
  type?: ValueType;
  scope?: FeeScope;
  includedInPrice?: number;
}

/**
 * Data required to create a new tax fee
 */
export interface CreateTaxFeeData {
  hotelId: number;
  name: string;
  type: ValueType;
  value: number;
  scope: FeeScope;
  includedInPrice?: number;
  isActive?: number;
}

/**
 * Data that can be updated for a tax fee
 */
export interface UpdateTaxFeeData
  extends Partial<Omit<CreateTaxFeeData, "hotelId">> {}
