import { type PaginationResponse } from "@shared/models/common";

import { type Amenity } from "../../amenities/types/amenity";
import { type Feature } from "../../feature/types/featuers";

export interface LocationInfoImage {
  url: string;
  alt: string;
}

// Form-specific interfaces for handling file uploads
export interface LocationInfoImageForm {
  file?: File;
  alt: string;
  // For edit mode - existing images
  id?: number;
  url?: string;
}

export interface LocationInfo {
  heading: string;
  subHeading: string;
  bulletPoints: string[];
  description: string;
  images: LocationInfoImage[];
}

// Form-specific interface for handling file uploads
export interface LocationInfoForm {
  heading: string;
  subHeading: string;
  bulletPoints: string[];
  description: string;
  images: LocationInfoImageForm[];
}

export interface HotelSignatureItem {
  title: string;
  description: string;
}

export interface HotelSignature {
  title: string;
  description: string;
  items: HotelSignatureItem[];
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
  tagline?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutDescription?: string;
  aboutStatement?: string;
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
  signature: HotelSignature | null;
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
  tagline?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutDescription?: string;
  aboutStatement?: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  locationInfo?: LocationInfo[];
  signature?: HotelSignature;
  amenities?: number[];
  features?: number[];
  isActive?: number;
}

// Form-specific payload that uses file uploads for location info images
export interface CreateHotelFormPayload {
  name: string;
  tagline?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutDescription?: string;
  aboutStatement?: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  locationInfo?: LocationInfoForm[];
  signature?: HotelSignature;
  amenities?: number[];
  features?: number[];
  isActive?: number;
}

export type UpdateHotelPayload = Partial<CreateHotelPayload>;
