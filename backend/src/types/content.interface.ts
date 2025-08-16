import type { BaseEntity, HotelScopedFilters } from "./common.interface";

/**
 * Database representation of a content block
 */
export interface DatabaseContentBlock extends BaseEntity {
  hotelId: number | null;
  page: string;
  section: string;
  title: string | null;
  body: string | null;
  mediaUrl: string | null;
  sortOrder: number;
  isVisible: number;
}

/**
 * Data required to create a new content block
 */
export interface CreateContentBlockData {
  hotelId?: number | null;
  page: string;
  section: string;
  title?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  sortOrder?: number;
  isVisible?: number;
}

/**
 * Data that can be updated for a content block
 */
export interface UpdateContentBlockData
  extends Partial<CreateContentBlockData> {}

/**
 * Filters for querying content blocks
 */
export interface ContentBlockFilters extends HotelScopedFilters {
  page?: string;
  section?: string;
  isVisible?: number;
}
