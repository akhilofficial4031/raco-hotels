import type { USER_ROLES, USER_STATUS } from "../constants";
import type { BaseEntity, BaseFilters } from "./common.interface";

// User role and status types
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/**
 * Database representation of a user
 */
export interface DatabaseUser extends BaseEntity {
  email: string;
  passwordHash: string | null;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
}

/**
 * Data required to create a new user
 */
export interface CreateUserData {
  email: string;
  passwordHash?: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Data that can be updated for a user
 */
export interface UpdateUserData extends Partial<CreateUserData> {}

/**
 * Filters for querying users
 */
export interface UserFilters extends BaseFilters {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
}
