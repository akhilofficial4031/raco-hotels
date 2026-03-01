/* eslint-disable no-unused-vars */
export enum RoomStatus {
  Available = "available",
  Occupied = "occupied",
  Maintenance = "maintenance",
  OutOfOrder = "out_of_order",
}

export interface IRoom {
  id: number;
  hotelId: number;
  roomTypeId: number;
  roomNumber: string;
  floor: string | null;
  description: string | null;
  status: RoomStatus;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  roomType?: {
    id: number;
    name: string;
  };
}

export interface IRoomFilters {
  hotelId?: number;
  roomTypeId?: number;
  status?: RoomStatus;
  isActive?: number;
  search?: string;
}

export interface ICreateRoom {
  hotelId: number;
  roomTypeId: number;
  roomNumbers: string[];
  floor?: string;
  description?: string;
  status?: RoomStatus;
  isActive?: number;
}

export interface IUpdateRoom extends Partial<Omit<ICreateRoom, "roomNumbers">> {
  roomNumber?: string;
}

export interface IRoomAvailability {
  checkInDate: string;
  checkOutDate: string;
  hotelId: number;
  roomTypes: IRoomType[];
  totalRoomTypesAvailable: number;
}

export interface IRoomType {
  id: number;
  hotelId: number;
  name: string;
  slug: string;
  description: string;
  baseOccupancy: number;
  maxOccupancy: number;
  basePriceCents: number;
  extraAdultChargeCents: number;
  currencyCode: string;
  sizeSqft: number;
  bedType: string;
  smokingAllowed: number;
  totalRooms: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  images: RoomImage[];
  amenities: RoomAmenity[];
  rooms: BookingRoomTypeRooms[];
  addons?: Addon[];
}

export interface BookingRoomTypeRooms {
  floor: string;
  roomDescription: string;
  roomId: number;
  roomNumber: string;
  status: RoomStatus;
  id?: number;
}

export interface RoomImage {
  id: number;
  roomTypeId: number;
  url: string;
  alt: string;
  sortOrder: number;
  createdAt: string;
}

export interface RoomAmenity {
  amenityId: number;
  roomTypeId: number;
  createdAt: string;
}

export interface Room {
  id: number;
  hotelId: number;
  roomTypeId: number;
  roomNumber: string;
  floor: string;
  description: string;
  status: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  roomType: {
    id: number;
    name: string;
  };
}

export interface Addon {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  currencyCode: string;
}
