export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationResponse {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}
