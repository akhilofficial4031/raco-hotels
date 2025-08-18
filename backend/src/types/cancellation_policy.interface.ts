import type {
  HotelScopedEntity,
  ValueType,
  HotelScopedFilters,
  ActiveStatusFilter,
} from "./common.interface";

/**
 * Database representation of a cancellation policy
 */
export interface DatabaseCancellationPolicy extends HotelScopedEntity {
  name: string;
  description: string | null;
  freeCancelUntilHours: number | null;
  penaltyType: ValueType | null;
  penaltyValue: number | null;
  isActive: number;
}

/**
 * Data required to create a new cancellation policy
 */
export interface CreateCancellationPolicyData {
  hotelId: number;
  name: string;
  description?: string | null;
  freeCancelUntilHours?: number | null;
  penaltyType?: ValueType | null;
  penaltyValue?: number | null;
  isActive?: number;
}

/**
 * Data that can be updated for a cancellation policy
 */
export interface UpdateCancellationPolicyData
  extends Partial<Omit<CreateCancellationPolicyData, "hotelId">> {}

/**
 * Filters for querying cancellation policies
 */
export interface CancellationPolicyFilters
  extends HotelScopedFilters,
    ActiveStatusFilter {
  name?: string;
}
