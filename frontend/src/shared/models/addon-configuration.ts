import { type RoomType } from "./room-type";

export interface AddonConfiguration {
  id: number;
  roomTypeId: number;
  addonId: number;
  priceCents: number;
  currencyCode: string;
  maxQuantity: number | null;
  minQuantity: number;
  isAvailable: number;
  specialInstructions: string | null;
  createdAt: string;
  updatedAt: string;
  roomType: Pick<RoomType, "id" | "name">;
}

export interface AddonConfigurationListResponse {
  data: {
    configurations: AddonConfiguration[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  };
}

export interface AddonConfigurationListParamStructure {
  page: number;
  limit: number;
  search?: string;
}

export interface UpdateAddonConfigurationPayload {
  priceCents: number;
}
