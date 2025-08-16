import type { BaseEntity, BaseFilters } from "./common.interface";

/**
 * Database representation of a feature
 */
export interface DatabaseFeature extends BaseEntity {
  code: string;
  name: string;
  description: string | null;
  isVisible: boolean;
  sortOrder: number;
}

/**
 * Data required to create a new feature
 */
export interface CreateFeatureData {
  code: string;
  name: string;
  description?: string | null;
  isVisible?: boolean;
  sortOrder?: number;
}

/**
 * Data that can be updated for a feature
 */
export interface UpdateFeatureData extends Partial<CreateFeatureData> {}

/**
 * Filters for querying features
 */
export interface FeatureFilters extends BaseFilters {
  code?: string;
  isVisible?: boolean;
}
