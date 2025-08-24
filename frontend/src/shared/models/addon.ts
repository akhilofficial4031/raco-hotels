import { type PaginationResponse } from "./common";

export interface Addon {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  unitType: string;
  isActive: number;
}

export interface AddonListParamStructure {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  isActive?: number;
  unitType?: string;
}

export interface AddonListResponse {
  data: {
    addons: Addon[];
    pagination: PaginationResponse;
  };
}

export interface CreateAddonPayload {
  name: string;
  description?: string | null;
  category?: string | null;
  unitType?: string;
  isActive?: number;
}

export interface UpdateAddonPayload extends Partial<CreateAddonPayload> {}

export interface AddonResponse {
  data: {
    addon: Addon;
  };
}
