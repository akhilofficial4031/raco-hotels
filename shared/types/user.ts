/**
 * User status enumeration
 * Used across both backend and frontend for consistent user status handling
 */

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  SUSPENDED = 'suspended',
  PENDING_ACTIVATION = 'pending_activation',
}

/**
 * Array of all valid user status values
 * Useful for validation and database constraints
 */
export const USER_STATUS_VALUES = Object.values(UserStatus);

/**
 * Type alias for user status string literal union
 */
export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

/**
 * Color mapping for user statuses
 * Used for consistent UI color representation across the application
 */
export const USER_STATUS_COLORS: Record<UserStatusType, string> = {
  [UserStatus.ACTIVE]: 'green',
  [UserStatus.DISABLED]: 'red',
  [UserStatus.SUSPENDED]: 'orange',
  [UserStatus.PENDING_ACTIVATION]: 'blue',
};

/**
 * Status display names for user-friendly representation
 */
export const USER_STATUS_LABELS: Record<UserStatusType, string> = {
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.DISABLED]: 'Disabled',
  [UserStatus.SUSPENDED]: 'Suspended',
  [UserStatus.PENDING_ACTIVATION]: 'Pending Activation',
};
