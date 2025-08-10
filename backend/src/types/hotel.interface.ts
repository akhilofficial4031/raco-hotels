export interface DatabaseHotel {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  starRating: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface HotelFilters {
  city?: string;
  countryCode?: string;
  isActive?: number;
  search?: string;
}

export interface CreateHotelData extends Partial<DatabaseHotel> {
  name: string;
}

export type UpdateHotelData = Partial<DatabaseHotel>;
