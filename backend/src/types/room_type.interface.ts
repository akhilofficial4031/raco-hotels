import type {
  HotelScopedEntity,
  HotelScopedFilters,
  ActiveStatusFilter,
  DatabaseMediaReference,
} from "./common.interface";

/**
 * Database representation of a room type
 */
export interface DatabaseRoomType extends HotelScopedEntity {
  name: string;
  slug: string;
  description: string | null;
  baseOccupancy: number | null;
  maxOccupancy: number | null;
  basePriceCents: number | null;
  currencyCode: string | null;
  sizeSqft: number | null;
  bedType: string | null;
  smokingAllowed: number;
  totalRooms: number;
  isActive: number;
  images?: DatabaseRoomTypeImage[];
  amenities?: DatabaseRoomTypeAmenity[];
}

/**
 * Database representation of a room type image
 */
export interface DatabaseRoomTypeImage extends DatabaseMediaReference {
  roomTypeId: number;
}

/**
 * Database representation of a room type amenity association
 */
export interface DatabaseRoomTypeAmenity {
  id: number;
  roomTypeId: number;
  amenityId: number;
  createdAt: string;
}

/**
 * Filters for querying room types
 */
export interface RoomTypeFilters
  extends HotelScopedFilters,
    ActiveStatusFilter {
  name?: string;
  minOccupancy?: number;
  maxOccupancy?: number;
  minPrice?: number;
  maxPrice?: number;
  bedType?: string;
  smokingAllowed?: number;
}

/**
 * Data required to create a new room type
 */
export interface CreateRoomTypeData {
  hotelId: number;
  name: string;
  slug: string;
  description?: string | null;
  baseOccupancy?: number | null;
  maxOccupancy?: number | null;
  basePriceCents?: number | null;
  currencyCode?: string | null;
  sizeSqft?: number | null;
  bedType?: string | null;
  smokingAllowed?: number;
  totalRooms?: number;
  isActive?: number;
}

/**
 * Data required to create a new room type image
 */
export interface CreateRoomTypeImageData {
  roomTypeId: number;
  url: string;
  alt?: string | null;
  sortOrder?: number;
}

/**
 * Data that can be updated for a room type
 */
export interface UpdateRoomTypeData
  extends Partial<Omit<CreateRoomTypeData, "hotelId">> {}

/**
 * Data that can be updated for a room type image
 */
export interface UpdateRoomTypeImageData
  extends Partial<Omit<CreateRoomTypeImageData, "roomTypeId">> {}
