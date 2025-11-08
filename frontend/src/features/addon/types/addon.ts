import { type PaginationResponse } from "@shared/models";

export interface Addon {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  unitType: string;
  isActive: number;
}

export interface AddonInBooking extends Addon {
  priceCents: number;
}

export interface AddonResponseInBooking {
  addon: Addon;
  bookingAddon: BookingAddon;
}

export interface BookingAddon {
  addonId: number;
  bookingId: number;
  createdAt: string;
  id: number;
  notes: string | null;
  priceCents: number;
  quantity: number;
  roomTypeId: number;
  updatedAt: string;
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
