import type {
  BaseEntity,
  BaseFilters,
  ActiveStatusFilter,
} from "./common.interface";

/**
 * Database representation of an addon
 */
export interface DatabaseAddon extends BaseEntity {
  name: string;
  description: string | null;
  category: string | null;
  unitType: string;
  isActive: number;
  sortOrder: number;
  imageUrl: string | null;
}

/**
 * Data required to create a new addon
 */
export interface CreateAddonData {
  name: string;
  description?: string | null;
  category?: string | null;
  unitType: string;
  isActive: number;
  sortOrder: number;
  imageUrl?: string | null;
}

/**
 * Data that can be updated for an addon
 */
export interface UpdateAddonData extends Partial<CreateAddonData> {}

/**
 * Filters for querying addons
 */
export interface AddonFilters extends BaseFilters, ActiveStatusFilter {
  category?: string;
  unitType?: string;
}

export interface DatabaseRoomTypeAddon extends BaseEntity {
  roomTypeId: number;
  addonId: number;
  priceCents: number;
  currencyCode: string;
  maxQuantity: number | null;
  minQuantity: number;
  isAvailable: number;
  specialInstructions: string | null;
}
