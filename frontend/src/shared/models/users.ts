import { PaginationResponse } from "./common";

export interface User {
  createdAt: string;
  email: string;
  firstName: string;
  id: number;
  phone: string;
  role: string;
  status: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: User[];
  pagination: PaginationResponse;
}
