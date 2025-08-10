// Removed authentication imports as they are now in auth.controller.ts
import {
  UserResponse,
  SystemResponse,
  handleAsyncRoute,
} from "../lib/responses";
import { UserService } from "../services/user.service";

import type { AppContext } from "../types";
import type { Context } from "hono";

export class UserController {
  // GET /users - Get all users with optional filters and pagination
  static async getUsers(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();

        const filters = {
          role: query.role as any,
          status: query.status as any,
          search: query.search,
        };

        const pagination = {
          page: parseInt(query.page || "1", 10),
          limit: parseInt(query.limit || "10", 10),
        };

        const result = await UserService.getUsers(
          c.env.DB,
          filters,
          pagination,
        );

        return UserResponse.usersList(c, result.items, result.pagination);
      },
      "operation.fetchUsersFailed",
    );
  }

  // GET /users/:id - Get user by ID
  static async getUserById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);

        const user = await UserService.getUserById(c.env.DB, id);

        if (!user) {
          return UserResponse.userNotFound(c);
        }

        return UserResponse.userRetrieved(c, user);
      },
      "operation.fetchUserFailed",
    );
  }

  // POST /users - Create new user
  static async createUser(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const userData = await c.req.json();

        try {
          const newUser = await UserService.createUser(c.env.DB, userData);
          return UserResponse.userCreated(c, newUser);
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes("already exists")) {
              return UserResponse.userAlreadyExists(c);
            }
            throw error;
          }
          throw error;
        }
      },
      "operation.createUserFailed",
    );
  }

  // PUT /users/:id - Update user
  static async updateUser(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const userData = await c.req.json();

        try {
          const updatedUser = await UserService.updateUser(
            c.env.DB,
            id,
            userData,
          );
          return UserResponse.userUpdated(c, updatedUser);
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "User not found") {
              return UserResponse.userNotFound(c);
            }
            if (error.message.includes("already in use")) {
              return UserResponse.userAlreadyExists(c);
            }
            throw error;
          }
          throw error;
        }
      },
      "operation.updateUserFailed",
    );
  }

  // DELETE /users/:id - Delete user
  static async deleteUser(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);

        try {
          const deleted = await UserService.deleteUser(c.env.DB, id);

          if (!deleted) {
            return UserResponse.userNotFound(c);
          }

          return UserResponse.userDeleted(c);
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "User not found") {
              return UserResponse.userNotFound(c);
            }
            if (error.message.includes("last admin")) {
              return UserResponse.userNotFound(c); // Or create a specific response
            }
            throw error;
          }
          throw error;
        }
      },
      "operation.deleteUserFailed",
    );
  }

  // PATCH /users/:id/status - Toggle user status
  static async toggleUserStatus(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);

        try {
          const updatedUser = await UserService.toggleUserStatus(c.env.DB, id);
          return UserResponse.userUpdated(c, updatedUser);
        } catch (error) {
          if (error instanceof Error && error.message === "User not found") {
            return UserResponse.userNotFound(c);
          }
          throw error;
        }
      },
      "operation.toggleStatusFailed",
    );
  }

  // GET /users/stats - Get user statistics
  static async getUserStats(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const stats = await UserService.getUserStats(c.env.DB);
        return UserResponse.usersList(c, stats.recentUsers, undefined);
      },
      "operation.fetchStatsFailed",
    );
  }

  // GET /users/search - Search users
  static async searchUsers(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const searchTerm = query.search || "";
        const limit = parseInt(query.limit || "10", 10);

        const users = await UserService.searchUsers(
          c.env.DB,
          searchTerm,
          limit,
        );
        return UserResponse.usersList(c, users);
      },
      "operation.searchUsersFailed",
    );
  }

  // Authentication methods moved to AuthController

  // Password change method moved to AuthController
}

// System controller for health checks and basic endpoints
export class SystemController {
  // GET /health - Health check
  static async healthCheck(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        return SystemResponse.healthCheck(c);
      },
      "operation.healthCheckFailed",
    );
  }

  // GET / - API info
  static async getApiInfo(c: Context) {
    return SystemResponse.apiInfo(c);
  }
}
