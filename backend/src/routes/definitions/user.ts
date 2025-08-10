import { z } from "zod";
import {
  createPublicRoute,
  createAuthenticatedRoute,
  ApiTags,
} from "../../lib/openapi";
import {
  UserResponseSchema,
  UsersListResponseSchema,
  CreateUserRequestSchema,
  CreateUserResponseSchema,
  UpdateUserRequestSchema,
  UpdateUserResponseSchema,
  DeleteUserResponseSchema,
  UserQueryParamsSchema,
  UserPathParamsSchema,
} from "../../schemas";

export const UserRouteDefinitions = {
  // GET /users - Get all users (Admin only)
  getUsers: createAuthenticatedRoute({
    method: "get",
    path: "/users",
    summary: "Get all users",
    description:
      "Retrieve a list of all users with optional filtering and pagination",
    tags: [ApiTags.USERS],
    successSchema: UsersListResponseSchema,
    successDescription: "Users retrieved successfully",
    querySchema: UserQueryParamsSchema,
    includeBadRequest: true,
  }),

  // GET /users/{id} - Get user by ID (Admin only)
  getUserById: createAuthenticatedRoute({
    method: "get",
    path: "/users/{id}",
    summary: "Get user by ID",
    description: "Retrieve a specific user by their ID",
    tags: [ApiTags.USERS],
    successSchema: UserResponseSchema,
    successDescription: "User retrieved successfully",
    paramsSchema: UserPathParamsSchema,
    includeNotFound: true,
    includeBadRequest: true,
  }),

  // POST /users - Create new user (Admin only)
  createUser: createAuthenticatedRoute({
    method: "post",
    path: "/users",
    summary: "Create new user",
    description: "Create a new user account",
    tags: [ApiTags.USERS],
    successSchema: CreateUserResponseSchema,
    successDescription: "User created successfully",
    requestSchema: CreateUserRequestSchema,
    requestDescription: "User creation data",
    includeBadRequest: true,
    includeConflict: true,
  }),

  // PUT /users/{id} - Update user (Admin only)
  updateUser: createAuthenticatedRoute({
    method: "put",
    path: "/users/{id}",
    summary: "Update user",
    description: "Update an existing user",
    tags: [ApiTags.USERS],
    successSchema: UpdateUserResponseSchema,
    successDescription: "User updated successfully",
    requestSchema: UpdateUserRequestSchema,
    requestDescription: "Updated user data",
    paramsSchema: UserPathParamsSchema,
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),

  // DELETE /users/{id} - Delete user (Admin only)
  deleteUser: createAuthenticatedRoute({
    method: "delete",
    path: "/users/{id}",
    summary: "Delete user",
    description: "Delete an existing user",
    tags: [ApiTags.USERS],
    successSchema: DeleteUserResponseSchema,
    successDescription: "User deleted successfully",
    paramsSchema: UserPathParamsSchema,
    includeNotFound: true,
  }),

  // PATCH /users/{id}/status - Toggle user status (Admin only)
  toggleUserStatus: createAuthenticatedRoute({
    method: "patch",
    path: "/users/{id}/status",
    summary: "Toggle user status",
    description: "Activate or deactivate a user account",
    tags: [ApiTags.USERS],
    successSchema: UpdateUserResponseSchema,
    successDescription: "User status updated successfully",
    paramsSchema: UserPathParamsSchema,
    includeNotFound: true,
  }),

  // GET /users/search - Search users (Admin only)
  searchUsers: createAuthenticatedRoute({
    method: "get",
    path: "/users/search",
    summary: "Search users",
    description: "Search users by name or email",
    tags: [ApiTags.USERS],
    successSchema: UsersListResponseSchema,
    successDescription: "Users search completed",
    querySchema: UserQueryParamsSchema,
    includeBadRequest: true,
  }),

  // GET /users/stats - Get user statistics (Admin only)
  getUserStats: createAuthenticatedRoute({
    method: "get",
    path: "/users/stats",
    summary: "Get user statistics",
    description:
      "Get user statistics including role distribution and recent users",
    tags: [ApiTags.USERS],
    successSchema: UsersListResponseSchema,
    successDescription: "User statistics retrieved successfully",
  }),

  // Authentication routes moved to auth.ts
};
