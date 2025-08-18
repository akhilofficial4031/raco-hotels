import { type PaginationResponse } from "./common";

export interface User {
  createdAt: string;
  email: string;
  fullName: string | null;
  id: number;
  phone: string | null;
  role: string;
  status: string;
  updatedAt: string;
}

export interface UserListResponse {
  data: {
    users: User[];
    pagination: PaginationResponse;
  };
}

export interface UserListParamStructure {
  page: number;
  limit: number;
  search: string;
  status: string;
  role: string;
}

export interface CreateUserPayload {
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  role: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>
