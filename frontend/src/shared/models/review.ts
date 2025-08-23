import { type PaginationResponse } from "./common";

export interface Review {
  id: string;
  hotelName: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  status: string;
  createdAt: string;
  publishedAt: string;
}

export interface ReviewListParamStructure {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface ReviewListResponse {
  data: {
    reviews: Review[];
    pagination: PaginationResponse;
  };
}
