import type { UserStatus as UserStatusType } from "../../../shared/types/user";
import type { USER_ROLES } from "../constants";
import type { BaseEntity, BaseFilters } from "./common.interface";

// User role and status types
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = (typeof UserStatusType)[keyof typeof UserStatusType];

/**
 * Database representation of a user
 */
export interface DatabaseUser extends BaseEntity {
  email: string;
  passwordHash?: string | null; // Made optional for safe queries
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpiresAt?: string | null;
  emailVerified?: number;
  emailVerificationToken?: string | null;
}

/**
 * Safe user data excluding sensitive authentication fields
 */
export interface SafeUserData extends BaseEntity {
  email: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | null;
  emailVerified?: number;
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
