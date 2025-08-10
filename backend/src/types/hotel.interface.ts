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
  // Optional JSON array with information about nearby locations, attractions, etc.
  locationInfo: LocationInfoSection[] | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationInfoImage {
  url: string;
  alt?: string | null;
}

export interface LocationInfoSection {
  heading: string;
  subHeading?: string | null;
  bulletPoints?: string[] | null;
  description?: string | null;
  images?: LocationInfoImage[] | null;
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
