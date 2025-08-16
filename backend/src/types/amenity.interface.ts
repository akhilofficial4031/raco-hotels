import type {
  BaseEntity,
  BaseFilters,
  ActiveStatusFilter,
} from "./common.interface";

/**
 * Database representation of an amenity
 */
export interface DatabaseAmenity extends BaseEntity {
  name: string;
  icon: string;
}

/**
 * Data required to create a new amenity
 */
export interface CreateAmenityData {
  name: string;
  icon: string;
}

/**
 * Data that can be updated for an amenity
 */
export interface UpdateAmenityData extends Partial<CreateAmenityData> {}

/**
 * Filters for querying amenities
 */
export interface AmenityFilters extends BaseFilters, ActiveStatusFilter {
  name?: string;
}
