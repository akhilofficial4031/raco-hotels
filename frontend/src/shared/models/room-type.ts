import { type PaginationResponse } from "./common";

export interface RoomTypeImage {
  id: number;
  roomTypeId: number;
  url: string;
  alt: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface RoomTypeAmenity {
  id?: number;
  roomTypeId: number;
  amenityId: number;
  createdAt: string;
}

export interface Room {
  id: number;
  roomTypeId: number;
  roomNumber: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: number;
  hotelId: number;
  name: string;
  slug: string;
  description: string | null;
  baseOccupancy: number;
  maxOccupancy: number;
  basePriceCents: number;
  currencyCode: string;
  sizeSqft: number | null;
  bedType: string | null;
  smokingAllowed: number;
  totalRooms: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  images?: RoomTypeImage[];
  amenities?: RoomTypeAmenity[];
  rooms?: Room[];
}

export interface RoomTypeWithRelations extends RoomType {
  images: RoomTypeImage[];
  amenities: RoomTypeAmenity[];
  rooms: Room[];
}

export interface RoomTypeListParamStructure {
  page: number;
  limit: number;
  hotelId?: string;
  isActive?: string;
  search?: string;
}

export interface RoomTypeListResponse {
  data: {
    roomTypes: RoomTypeWithRelations[];
    pagination: PaginationResponse;
  };
}

export interface RoomTypeResponse {
  data: {
    roomType: RoomTypeWithRelations;
    message?: string;
  };
}

export interface CreateRoomTypePayload {
  hotelId: number;
  name: string;
  slug: string;
  description?: string;
  baseOccupancy?: number;
  maxOccupancy?: number;
  basePriceCents?: number;
  currencyCode?: string;
  sizeSqft?: number;
  bedType?: string;
  smokingAllowed?: number;
  totalRooms?: number;
  isActive?: number;
  amenityIds?: number[];
  images?: {
    url: string;
    alt?: string;
    sortOrder?: number;
  }[];
}

export interface UpdateRoomTypePayload extends Partial<CreateRoomTypePayload> {}

export interface RoomTypeFormData {
  hotelId: number;
  name: string;
  slug: string;
  description?: string;
  baseOccupancy: number;
  maxOccupancy: number;
  basePriceCents: number;
  currencyCode?: string;
  sizeSqft?: number;
  bedType?: string;
  smokingAllowed: number;
  totalRooms: number;
  isActive: number;
  amenityIds?: number[];
}
