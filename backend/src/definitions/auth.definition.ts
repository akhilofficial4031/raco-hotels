import { z } from "zod";

import {
  createPublicRoute,
  createAuthenticatedRoute,
  ApiTags,
} from "../lib/openapi";

// Request schemas
const LoginRequestSchema = z.object({
  email: z.string().email().openapi({ example: "admin@raco.com" }),
  password: z.string().min(1).openapi({ example: "admin123" }),
});

const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1).openapi({ example: "currentPassword" }),
  newPassword: z.string().min(8).openapi({ example: "newSecurePassword123!" }),
});

// Response schemas
const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      id: z.number(),
      email: z.string(),
      fullName: z.string().nullable(),
      role: z.enum(["guest", "staff", "admin"]),
      status: z.enum(["active", "disabled"]),
    }),
    csrfToken: z.string(),
    expiresIn: z.number(),
  }),
});

const AuthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      user: z
        .object({
          id: z.number(),
          email: z.string(),
          fullName: z.string().nullable(),
          role: z.enum(["guest", "staff", "admin"]),
          status: z.enum(["active", "disabled"]),
        })
        .optional(),
      csrfToken: z.string().optional(),
      expiresIn: z.number().optional(),
    })
    .optional(),
});

const CsrfTokenResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    csrfToken: z.string(),
    note: z.string(),
    expiresIn: z.number(),
  }),
});

export const AuthRouteDefinitions = {
  // POST /auth/login
  login: createPublicRoute({
    method: "post",
    path: "/auth/login",
    tags: [ApiTags.AUTH],
    summary: "User login",
    description: "Authenticate user with email and password",
    successSchema: LoginResponseSchema,
    successDescription: "Login successful",
    requestSchema: LoginRequestSchema,
    requestDescription: "Login credentials",
    includeBadRequest: true,
    includeUnauthorized: true,
  }),

  // POST /auth/logout
  logout: createPublicRoute({
    method: "post",
    path: "/auth/logout",
    tags: [ApiTags.AUTH],
    summary: "User logout",
    description: "Logout user and clear authentication cookies",
    successSchema: AuthResponseSchema,
    successDescription: "Logout successful",
  }),

  // POST /auth/refresh
  refresh: createPublicRoute({
    method: "post",
    path: "/auth/refresh",
    tags: [ApiTags.AUTH],
    summary: "Refresh access token",
    description: "Refresh access token using refresh token",
    successSchema: AuthResponseSchema,
    successDescription: "Token refreshed successfully",
    includeUnauthorized: true,
  }),

  // POST /auth/change-password
  changePassword: createAuthenticatedRoute({
    method: "post",
    path: "/auth/change-password",
    tags: [ApiTags.AUTH],
    summary: "Change password",
    description: "Change user password (requires authentication)",
    successSchema: AuthResponseSchema,
    successDescription: "Password changed successfully",
    requestSchema: ChangePasswordRequestSchema,
    requestDescription: "Password change data",
    includeBadRequest: true,
  }),

  // POST /auth/revoke-all-sessions
  revokeAllSessions: createAuthenticatedRoute({
    method: "post",
    path: "/auth/revoke-all-sessions",
    tags: [ApiTags.AUTH],
    summary: "Revoke all sessions",
    description: "Revoke all refresh tokens for the current user",
    successSchema: AuthResponseSchema,
    successDescription: "All sessions revoked successfully",
  }),

  // GET /auth/verify
  verify: createAuthenticatedRoute({
    method: "get",
    path: "/auth/verify",
    tags: [ApiTags.AUTH],
    summary: "Verify authentication",
    description: "Verify current authentication status and get user info",
    successSchema: AuthResponseSchema,
    successDescription: "Authentication verified",
  }),

  // GET /auth/csrf-token
  getCsrfToken: createPublicRoute({
    method: "get",
    path: "/auth/csrf-token",
    tags: [ApiTags.AUTH],
    summary: "Get CSRF token",
    description:
      "Get a CSRF token for API testing and development. Use this token in the X-CSRF-Token header for POST/PUT/PATCH/DELETE requests.",
    successSchema: CsrfTokenResponseSchema,
    successDescription: "CSRF token generated successfully",
  }),
};
