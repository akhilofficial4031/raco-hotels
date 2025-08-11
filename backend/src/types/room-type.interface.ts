export interface DatabaseRoomType {
  id: number;
  hotelId: number;
  name: string;
  slug: string;
  description: string;
  baseOccupancy: number | null;
  maxOccupancy: number | null;
  basePriceCents: number | null;
  currencyCode: string | null;
  sizeSqft: number | null;
  bedType: string | null;
  smokingAllowed: boolean;
  totalRooms: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  images: DatabaseRoomTypeImage[];
  amenities: DatabaseRoomTypeAmenity[];
}

export interface DatabaseRoomTypeImage {
  id: number;
  roomTypeId: number;
  url: string;
  alt: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface DatabaseRoomTypeAmenity {
  id: number;
  roomTypeId: number;
  amenityId: number;
  createdAt: string;
}

export interface DatabaseRoom {
  id: number;
  hotelId: number;
  roomTypeId: number;
  roomNumber: string;
  floor: string | null;
  description: string | null;
  status: "available" | "occupied" | "maintenance" | "out_of_order";
  isActive: number;
  createdAt: string;
  updatedAt: string;
}
