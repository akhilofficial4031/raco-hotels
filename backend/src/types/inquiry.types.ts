import type { z } from "zod";
import type {
  CreateInquiryRequestSchema,
  UpdateInquiryRequestSchema,
  InquiryQueryParamsSchema,
  InquirySchema,
} from "../schemas/inquiry.schema";

// Database types
export type DatabaseInquiry = z.infer<typeof InquirySchema> & {
  attractionId?: number | null;
  attraction?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

// Request types
export type CreateInquiryData = z.infer<typeof CreateInquiryRequestSchema> & {
  attractionSlug?: string;
};
export type UpdateInquiryData = z.infer<typeof UpdateInquiryRequestSchema> & {
  attractionSlug?: string;
};

// Query types
export type InquiryFilters = {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type InquiryQueryParams = z.infer<typeof InquiryQueryParamsSchema>;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Response types
export interface InquiryListResult {
  items: DatabaseInquiry[];
  pagination: PaginationResult;
}
