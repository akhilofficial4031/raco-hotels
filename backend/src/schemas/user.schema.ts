import { z } from "zod";

import { getMessage, DEFAULT_LOCALE } from "../config/messages";
import { USER_ROLES, USER_STATUS } from "../constants";

// User role and status enums
const UserRoleSchema = z.enum([
  USER_ROLES.GUEST,
  USER_ROLES.STAFF,
  USER_ROLES.ADMIN,
]);
const UserStatusSchema = z.enum([USER_STATUS.ACTIVE, USER_STATUS.DISABLED]);

// Base User Schema
export const UserSchema = z
  .object({
    id: z.number().int().positive().openapi({
      example: 1,
      description: "Unique user identifier",
    }),
    email: z.string().email().openapi({
      example: "john.doe@example.com",
      description: "User email address",
    }),
    fullName: z.string().nullable().openapi({
      example: "John Doe",
      description: "User full name",
    }),
    phone: z.string().nullable().openapi({
      example: "+1234567890",
      description: "User phone number",
    }),
    role: UserRoleSchema.openapi({
      example: USER_ROLES.GUEST,
      description: "User role",
    }),
    status: UserStatusSchema.openapi({
      example: USER_STATUS.ACTIVE,
      description: "User status",
    }),
    createdAt: z.string().openapi({
      example: "2024-01-01T00:00:00.000Z",
      description: "User creation timestamp",
    }),
    updatedAt: z.string().openapi({
      example: "2024-01-01T00:00:00.000Z",
      description: "User last update timestamp",
    }),
  })
  .openapi("User");

// Create User Request Schema
export const CreateUserRequestSchema = z
  .object({
    email: z.string().email().openapi({
      example: "john.doe@example.com",
      description: "User email address",
    }),
    password: z
      .string()
      .min(8, getMessage("password.tooShort", DEFAULT_LOCALE))
      .max(128, getMessage("password.tooLong", DEFAULT_LOCALE))
      .regex(/[A-Z]/, getMessage("password.missingUppercase", DEFAULT_LOCALE))
      .regex(/[a-z]/, getMessage("password.missingLowercase", DEFAULT_LOCALE))
      .regex(/\d/, getMessage("password.missingNumber", DEFAULT_LOCALE))
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        getMessage("password.missingSpecialChar", DEFAULT_LOCALE),
      )
      .optional()
      .openapi({
        example: "SecurePass123!",
        description:
          "User password (8-128 chars, must include uppercase, lowercase, number, and special character) - Optional",
      }),
    fullName: z.string().optional().openapi({
      example: "John Doe",
      description: "User full name",
    }),
    phone: z.string().optional().openapi({
      example: "+1234567890",
      description: "User phone number",
    }),
    role: UserRoleSchema.optional().default(USER_ROLES.GUEST).openapi({
      example: USER_ROLES.GUEST,
      description: "User role",
    }),
  })
  .openapi("CreateUserRequest");

// Update User Request Schema
export const UpdateUserRequestSchema = z
  .object({
    email: z.string().email().optional().openapi({
      example: "john.doe@example.com",
      description: "User email address",
    }),
    fullName: z.string().optional().openapi({
      example: "John Doe",
      description: "User full name",
    }),
    phone: z.string().optional().openapi({
      example: "+1234567890",
      description: "User phone number",
    }),
    role: UserRoleSchema.optional().openapi({
      example: USER_ROLES.STAFF,
      description: "User role",
    }),
    status: UserStatusSchema.optional().openapi({
      example: USER_STATUS.ACTIVE,
      description: "User status",
    }),
  })
  .openapi("UpdateUserRequest");

// Login Request Schema
export const LoginRequestSchema = z
  .object({
    email: z.string().email().openapi({
      example: "john.doe@example.com",
      description: "User email address",
    }),
    password: z.string().openapi({
      example: "SecurePass123!",
      description: "User password",
    }),
  })
  .openapi("LoginRequest");

// Change Password Request Schema
export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().openapi({
      example: "OldPass123!",
      description: "Current password",
    }),
    newPassword: z
      .string()
      .min(8, getMessage("password.tooShort", DEFAULT_LOCALE))
      .max(128, getMessage("password.tooLong", DEFAULT_LOCALE))
      .regex(/[A-Z]/, getMessage("password.missingUppercase", DEFAULT_LOCALE))
      .regex(/[a-z]/, getMessage("password.missingLowercase", DEFAULT_LOCALE))
      .regex(/\d/, getMessage("password.missingNumber", DEFAULT_LOCALE))
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        getMessage("password.missingSpecialChar", DEFAULT_LOCALE),
      )
      .openapi({
        example: "NewSecurePass123!",
        description:
          "New password (8-128 chars, must include uppercase, lowercase, number, and special character)",
      }),
  })
  .openapi("ChangePasswordRequest");

// Query Parameters Schema
export const UserQueryParamsSchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .openapi({
        example: "1",
        description: "Page number for pagination",
      }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .openapi({
        example: "10",
        description: "Number of items per page",
      }),
    role: UserRoleSchema.optional().openapi({
      example: USER_ROLES.GUEST,
      description: "Filter by user role",
    }),
    status: UserStatusSchema.optional().openapi({
      example: USER_STATUS.ACTIVE,
      description: "Filter by user status",
    }),
    search: z.string().optional().openapi({
      example: "john",
      description: "Search in user name or email",
    }),
  })
  .openapi("UserQueryParams");

// Path Parameters Schema
export const UserPathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .openapi({
        example: "1",
        description: "User ID",
      }),
  })
  .openapi("UserPathParams");

// Response Schemas
export const UserResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      user: UserSchema,
      message: z.string().openapi({ example: "User retrieved successfully" }),
    }),
  })
  .openapi("UserResponse");

export const UsersListResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      users: z.array(UserSchema),
      pagination: z.object({
        page: z.number().openapi({ example: 1 }),
        limit: z.number().openapi({ example: 10 }),
        total: z.number().openapi({ example: 50 }),
        totalPages: z.number().openapi({ example: 5 }),
      }),
      message: z.string().openapi({ example: "Users retrieved successfully" }),
    }),
  })
  .openapi("UsersListResponse");

export const CreateUserResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      user: UserSchema,
      message: z.string().openapi({ example: "User created successfully" }),
    }),
  })
  .openapi("CreateUserResponse");

export const UpdateUserResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      user: UserSchema,
      message: z.string().openapi({ example: "User updated successfully" }),
    }),
  })
  .openapi("UpdateUserResponse");

export const DeleteUserResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      message: z.string().openapi({ example: "User deleted successfully" }),
    }),
  })
  .openapi("DeleteUserResponse");

// Login Response Schema
export const LoginResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      user: UserSchema,
      token: z.string().openapi({
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        description: "JWT authentication token",
      }),
      message: z.string().openapi({ example: "Login successful" }),
    }),
  })
  .openapi("LoginResponse");

// Change Password Response Schema
export const ChangePasswordResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      message: z.string().openapi({ example: "Password changed successfully" }),
    }),
  })
  .openapi("ChangePasswordResponse");

// Error Response Schema
export const ErrorResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: false }),
    error: z.object({
      code: z.string().openapi({ example: "USER_NOT_FOUND" }),
      message: z.string().openapi({ example: "User not found" }),
      details: z.any().optional(),
    }),
  })
  .openapi("ErrorResponse");
