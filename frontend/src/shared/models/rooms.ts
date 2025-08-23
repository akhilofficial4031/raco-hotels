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
