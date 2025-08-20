import { type PaginationResponse } from "./common";

export interface Feature {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureListParamStructure {
  status?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface FeatureListResponse {
  data: {
    features: Feature[];
    pagination: PaginationResponse;
  };
}

export interface CreateFeaturePayload {
  code: string;
  name: string;
  description?: string | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface UpdateFeaturePayload {
  name: string;
  description?: string | null;
  isVisible: boolean;
  sortOrder: number;
}
