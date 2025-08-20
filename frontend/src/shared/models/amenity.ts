import { type PaginationResponse } from "./common";

export interface Amenity {
  id: number;
  code: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmenityListParamStructure {
  status?: string;
  page: number;
  limit: number;
}

export interface AmenityListResponse {
  data: {
    amenities: Amenity[];
    pagination: PaginationResponse;
  };
}

export interface CreateAmenityPayload {
  name: string;
  icon: string;
}

export interface UpdateAmenityPayload extends CreateAmenityPayload {}
