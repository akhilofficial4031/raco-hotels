import { eq, and, like, or, desc, count } from "drizzle-orm";

import { user } from "../../drizzle/schema/user";
import { USER_ROLES, USER_STATUS } from "../constants";
import { getDb } from "../db";

import type {
  DatabaseUser,
  UserRole,
  PaginationParams,
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from "../types";

export class UserRepository {
  // Find all users with optional filters and pagination
  static async findAll(
    db: D1Database,
    filters: UserFilters = {},
    pagination: PaginationParams = {},
  ): Promise<{ users: DatabaseUser[]; total: number }> {
    const database = getDb(db);
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (filters.role) {
      conditions.push(eq(user.role, filters.role));
    }

    if (filters.status) {
      conditions.push(eq(user.status, filters.status));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(like(user.fullName, searchPattern), like(user.email, searchPattern)),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await database
      .select({ count: count() })
      .from(user)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Get users with pagination
    const users = await database
      .select()
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    return { users: users as DatabaseUser[], total };
  }

  // Find user by ID
  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseUser | null> {
    const database = getDb(db);
    const result = await database
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    return (result[0] as DatabaseUser) || null;
  }

  // Find user by email
  static async findByEmail(
    db: D1Database,
    email: string,
  ): Promise<DatabaseUser | null> {
    const database = getDb(db);
    const result = await database
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return (result[0] as DatabaseUser) || null;
  }

  // Create a new user
  static async create(
    db: D1Database,
    userData: CreateUserData,
  ): Promise<DatabaseUser> {
    const database = getDb(db);

    const newUser = {
      email: userData.email,
      passwordHash: userData.passwordHash || null,
      fullName: userData.fullName || null,
      phone: userData.phone || null,
      role: userData.role || USER_ROLES.GUEST,
      status: userData.status || USER_STATUS.ACTIVE,
    };

    const result = await database.insert(user).values(newUser).returning();

    return result[0] as DatabaseUser;
  }

  // Update user by ID
  static async update(
    db: D1Database,
    id: number,
    userData: UpdateUserData,
  ): Promise<DatabaseUser | null> {
    const database = getDb(db);

    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(userData).filter(([, v]) => v !== undefined),
    );

    if (Object.keys(updateData).length === 0) {
      return this.findById(db, id);
    }

    const result = await database
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(user.id, id))
      .returning();

    return (result[0] as DatabaseUser) || null;
  }

  // Delete user by ID
  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);

    const result = await database
      .delete(user)
      .where(eq(user.id, id))
      .returning();

    return result.length > 0;
  }

  // Check if user exists by email (for unique validation)
  static async existsByEmail(
    db: D1Database,
    email: string,
    excludeId?: number,
  ): Promise<boolean> {
    const database = getDb(db);

    const conditions = [eq(user.email, email)];
    if (excludeId) {
      conditions.push(eq(user.id, excludeId));
    }

    const result = await database
      .select({ id: user.id })
      .from(user)
      .where(
        excludeId
          ? and(eq(user.email, email), eq(user.id, excludeId))
          : eq(user.email, email),
      )
      .limit(1);

    return result.length > 0;
  }

  // Get users count by role
  static async getCountByRole(
    db: D1Database,
  ): Promise<Record<UserRole, number>> {
    const database = getDb(db);

    const results = await database
      .select({
        role: user.role,
        count: count(),
      })
      .from(user)
      .groupBy(user.role);

    const counts: Record<UserRole, number> = {
      [USER_ROLES.GUEST]: 0,
      [USER_ROLES.STAFF]: 0,
      [USER_ROLES.ADMIN]: 0,
    };

    results.forEach((result) => {
      counts[result.role as UserRole] = result.count;
    });

    return counts;
  }

  // Get recent users (last 30 days)
  static async getRecentUsers(
    db: D1Database,
    limit: number = 10,
  ): Promise<DatabaseUser[]> {
    const database = getDb(db);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await database
      .select()
      .from(user)
      .where(eq(user.createdAt, thirtyDaysAgo.toISOString()))
      .orderBy(desc(user.createdAt))
      .limit(limit);

    return result as DatabaseUser[];
  }
}
