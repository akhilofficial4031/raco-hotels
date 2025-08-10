import type { USER_ROLES, USER_STATUS } from "../constants";

// User role and status types
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// Database User type (matching schema)
export interface DatabaseUser {
  id: number;
  email: string;
  passwordHash: string | null;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// User creation data interface
export interface CreateUserData {
  email: string;
  passwordHash?: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}

// User update data interface
export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}

// User filtering interface
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
