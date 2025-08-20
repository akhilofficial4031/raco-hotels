import type {
  HotelScopedEntity,
  RoomStatus,
  HotelScopedFilters,
  ActiveStatusFilter,
} from "./common.interface";

/**
 * Database representation of a room
 */
export interface DatabaseRoom extends HotelScopedEntity {
  roomTypeId: number;
  roomNumber: string;
  floor: string | null;
  description: string | null;
  status: RoomStatus;
  isActive: number;
}

/**
 * Filters for querying rooms
 */
export interface RoomFilters extends HotelScopedFilters, ActiveStatusFilter {
  roomTypeId?: number;
  status?: RoomStatus;
  floor?: string;
  roomNumber?: string;
}

/**
 * Data required to create a new room
 */
export interface CreateRoomData {
  hotelId: number;
  roomTypeId: number;
  roomNumber: string;
  floor?: string | null;
  description?: string | null;
  status?: RoomStatus;
  isActive?: number;
}

/**
 * Data that can be updated for a room
 */
export interface UpdateRoomData
  extends Partial<Omit<CreateRoomData, "hotelId">> {}
