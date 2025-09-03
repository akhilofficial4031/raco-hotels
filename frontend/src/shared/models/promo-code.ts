import { type PaginationResponse } from "./common";
import { type Hotel } from "./hotels";

export interface PromoCode {
  id: number;
  hotelId: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  startDate?: string;
  endDate?: string;
  minNights?: number;
  minAmountCents?: number;
  maxDiscountCents?: number;
  usageLimit?: number;
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
    pagination: PaginationResponse;
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
