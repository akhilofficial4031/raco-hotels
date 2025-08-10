// Removed crypto imports as they are now in AuthService

import { getMessage, DEFAULT_LOCALE } from "../config/messages";
import { USER_ROLES, USER_STATUS } from "../constants";
import { UserRepository } from "../repositories/user.repository";

import type {
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
} from "../schemas";
import type {
  DatabaseUser,
  PaginationParams,
  PaginatedResponse,
  CreateUserData,
  UserFilters,
} from "../types";
import type { z } from "zod";

export class UserService {
  // Create a new user with validation
  static async createUser(
    db: D1Database,
    userData: z.infer<typeof CreateUserRequestSchema>,
  ): Promise<DatabaseUser> {
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(db, userData.email);
    if (existingUser) {
      throw new Error(getMessage("user.alreadyExists", DEFAULT_LOCALE));
    }

    // Import AuthService for password operations
    const { AuthService } = await import("./auth.service");

    // Validate password strength
    AuthService.validatePasswordStrength(userData.password);

    // Hash password
    const passwordHash = await AuthService.hashPassword(userData.password);

    // Create user data
    const createData: CreateUserData = {
      email: userData.email,
      passwordHash,
      fullName: userData.fullName,
      phone: userData.phone,
      role: userData.role || USER_ROLES.GUEST,
      status: USER_STATUS.ACTIVE,
    };

    // Create user
    const newUser = await UserRepository.create(db, createData);

    // Remove password hash from response
    return this.sanitizeUser(newUser);
  }

  // Update user with validation
  static async updateUser(
    db: D1Database,
    id: number,
    userData: z.infer<typeof UpdateUserRequestSchema>,
  ): Promise<DatabaseUser> {
    // Check if user exists
    const existingUser = await UserRepository.findById(db, id);
    if (!existingUser) {
      throw new Error(getMessage("user.notFound", DEFAULT_LOCALE));
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await UserRepository.findByEmail(db, userData.email);
      if (emailExists) {
        throw new Error(getMessage("user.alreadyExists", DEFAULT_LOCALE));
      }
    }

    // Update user
    const updatedUser = await UserRepository.update(db, id, userData);
    if (!updatedUser) {
      throw new Error(getMessage("user.notFound", DEFAULT_LOCALE));
    }

    return this.sanitizeUser(updatedUser);
  }

  // Get user by ID
  static async getUserById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseUser | null> {
    const user = await UserRepository.findById(db, id);
    return user ? this.sanitizeUser(user) : null;
  }

  // Get users with filters and pagination
  static async getUsers(
    db: D1Database,
    filters: UserFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResponse<DatabaseUser>> {
    const { page = 1, limit = 10 } = pagination;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      throw new Error(
        getMessage("validation.invalidPagination", DEFAULT_LOCALE),
      );
    }

    const { users, total } = await UserRepository.findAll(
      db,
      filters,
      pagination,
    );

    // Sanitize users (remove password hashes)
    const sanitizedUsers = users.map((user) => this.sanitizeUser(user));

    const totalPages = Math.ceil(total / limit);

    return {
      items: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  // Delete user
  static async deleteUser(db: D1Database, id: number): Promise<boolean> {
    // Check if user exists
    const existingUser = await UserRepository.findById(db, id);
    if (!existingUser) {
      throw new Error(getMessage("user.notFound", DEFAULT_LOCALE));
    }

    // Prevent deletion of the last admin
    if (existingUser.role === USER_ROLES.ADMIN) {
      const roleCounts = await UserRepository.getCountByRole(db);
      if (roleCounts[USER_ROLES.ADMIN] <= 1) {
        throw new Error(getMessage("user.lastAdminError", DEFAULT_LOCALE));
      }
    }

    return await UserRepository.delete(db, id);
  }

  // Password change method moved to AuthService

  // Authentication method moved to AuthService

  // Password validation moved to AuthService

  // Activate/Deactivate user
  static async toggleUserStatus(
    db: D1Database,
    id: number,
  ): Promise<DatabaseUser> {
    const existingUser = await UserRepository.findById(db, id);
    if (!existingUser) {
      throw new Error(getMessage("user.notFound", DEFAULT_LOCALE));
    }

    const newStatus =
      existingUser.status === USER_STATUS.ACTIVE
        ? USER_STATUS.DISABLED
        : USER_STATUS.ACTIVE;

    const updatedUser = await UserRepository.update(db, id, {
      status: newStatus,
    });
    if (!updatedUser) {
      throw new Error(getMessage("user.notFound", DEFAULT_LOCALE));
    }

    return this.sanitizeUser(updatedUser);
  }

  // Get user statistics
  static async getUserStats(db: D1Database) {
    const roleCounts = await UserRepository.getCountByRole(db);
    const recentUsers = await UserRepository.getRecentUsers(db, 5);

    const totalUsers = Object.values(roleCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      totalUsers,
      roleDistribution: roleCounts,
      recentUsers: recentUsers.map((user) => this.sanitizeUser(user)),
    };
  }

  // Search users
  static async searchUsers(
    db: D1Database,
    searchTerm: string,
    limit: number = 10,
  ): Promise<DatabaseUser[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const { users } = await UserRepository.findAll(
      db,
      { search: searchTerm.trim() },
      { page: 1, limit },
    );

    return users.map((user) => this.sanitizeUser(user));
  }

  // Validate user data
  static validateUserData(userData: Partial<CreateUserData>): string[] {
    const errors: string[] = [];

    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push(getMessage("validation.invalidEmail", DEFAULT_LOCALE));
    }

    if (userData.phone && !this.isValidPhone(userData.phone)) {
      errors.push(getMessage("validation.invalidPhone", DEFAULT_LOCALE));
    }

    if (userData.role && !Object.values(USER_ROLES).includes(userData.role)) {
      errors.push(getMessage("validation.invalidRole", DEFAULT_LOCALE));
    }

    if (
      userData.status &&
      !Object.values(USER_STATUS).includes(userData.status)
    ) {
      errors.push(getMessage("validation.invalidStatus", DEFAULT_LOCALE));
    }

    return errors;
  }

  // Private helper methods
  private static sanitizeUser(user: DatabaseUser): DatabaseUser {
    // Remove password hash from response
    return { ...user, passwordHash: null };
  }

  // Password hashing and verification methods moved to AuthService

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    // Simple phone validation - can be improved
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Role-based permission helpers
  static canManageUsers(userRole: string): boolean {
    return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.STAFF;
  }

  static canDeleteUser(
    currentUserRole: string,
    targetUserRole: string,
  ): boolean {
    if (currentUserRole === USER_ROLES.ADMIN) {
      return true;
    }
    if (
      currentUserRole === USER_ROLES.STAFF &&
      targetUserRole !== USER_ROLES.ADMIN
    ) {
      return true;
    }
    return false;
  }

  static canUpdateUserRole(currentUserRole: string, newRole: string): boolean {
    if (currentUserRole === USER_ROLES.ADMIN) {
      return true;
    }
    if (currentUserRole === USER_ROLES.STAFF && newRole !== USER_ROLES.ADMIN) {
      return true;
    }
    return false;
  }
}
