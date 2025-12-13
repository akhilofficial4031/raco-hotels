import { type PaginationResponse } from "@shared/models";

export type InquiryStatus = "pending" | "addressed" | "confirmed";

export interface Inquiry {
  id: number;
  name: string;
  phone: string;
  date: string;
  message: string;
  status: InquiryStatus;
  remarks: string | null;
  attractionId?: number | null;
  attractionName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryListParamStructure {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InquiryListResponse {
  data: {
    inquiries: Inquiry[];
    pagination: PaginationResponse;
  };
}

export interface InquiryResponse {
  data: {
    inquiry: Inquiry;
    message?: string;
  };
}

export interface CreateInquiryPayload {
  name: string;
  phone: string;
  date: string;
  message: string;
  status?: InquiryStatus;
  remarks?: string | null;
  attractionSlug?: string;
}

export interface UpdateInquiryPayload extends Partial<CreateInquiryPayload> {
  id?: number;
}

export interface InquiryFormData {
  name: string;
  phone: string;
  date: string;
  message: string;
  status: InquiryStatus;
  remarks?: string;
  attractionSlug?: string;
}
