import { type Amenity } from "./amenity";
import { type PaginationResponse } from "./common";
import { type Feature } from "./featuers";

export interface LocationInfoImage {
  url: string;
  alt: string;
}

export interface LocationInfo {
  heading: string;
  subHeading: string;
  bulletPoints: string[];
  description: string;
  images: LocationInfoImage[];
}

export interface HotelImage {
  id: number;
  hotelId: number;
  url: string;
  alt: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Hotel {
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
  locationInfo: LocationInfo[] | null;
  amenities: number[] | Amenity[] | null;
  features: number[] | Feature[] | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  images?: HotelImage[]; // Optional for when hotel data includes images
}

export interface HotelListResponse {
  data: {
    hotels: Hotel[];
    pagination: PaginationResponse;
  };
}

export interface HotelListParamStructure {
  page: number;
  limit: number;
  search: string;
  status: string;
  city: string;
  starRating: string;
}

export interface HotelResponse {
  data: HotelDetailsResponse;
}

export interface HotelDetailsResponse {
  hotel: Hotel;
}

export interface CreateHotelPayload {
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  locationInfo?: LocationInfo[];
  amenities?: number[];
  features?: number[];
  isActive?: number;
}

export type UpdateHotelPayload = Partial<CreateHotelPayload>;
