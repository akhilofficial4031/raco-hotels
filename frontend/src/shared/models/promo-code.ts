import { type Hotel } from "./hotels";
import { type Pagination } from "./base";

export interface PromoCode {
  id: number;
  hotelId: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  startDate: string | null;
  endDate: string | null;
  usageCount: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeWithRelations extends PromoCode {
  hotel?: Hotel;
}

export interface PromoCodeListResponse {
  data: {
    promoCodes: PromoCodeWithRelations[];
    pagination: Pagination;
  };
}

export interface CreatePromoCodePayload {
  hotelId: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  startDate?: string;
  endDate?: string;
  isActive: number;
}

export interface PromoCodeListParamStructure {
  page: number;
  limit: number;
  search: string;
  hotelId: string;
  isActive: string;
  dateRange: [string, string] | null;
}
