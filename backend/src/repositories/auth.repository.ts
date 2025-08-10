import { eq } from "drizzle-orm";

import { user } from "../../drizzle/schema/user";
import { getDb } from "../db";

import type { DatabaseUser } from "../types";

export class AuthRepository {
  // Find user by email with password hash (for authentication)
  static async findByEmailWithPassword(
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

  // Find user by ID with password hash (for password change verification)
  static async findByIdWithPassword(
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

  // Update user password
  static async updatePassword(
    db: D1Database,
    id: number,
    passwordHash: string,
  ): Promise<DatabaseUser | null> {
    const database = getDb(db);

    const result = await database
      .update(user)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(user.id, id))
      .returning();

    return (result[0] as DatabaseUser) || null;
  }

  // Find user by ID (without password hash, for token validation)
  static async findByIdSanitized(
    db: D1Database,
    id: number,
  ): Promise<Omit<DatabaseUser, "passwordHash"> | null> {
    const database = getDb(db);
    const result = await database
      .select({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    return (result[0] as Omit<DatabaseUser, "passwordHash">) || null;
  }

  // Check if user exists and is active (for token validation)
  static async isUserActiveById(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const result = await database
      .select({ id: user.id, status: user.status })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    return result.length > 0 && result[0].status === "active";
  }

  // Update user's last login timestamp (optional, for tracking)
  static async updateLastLogin(db: D1Database, id: number): Promise<void> {
    const database = getDb(db);

    await database
      .update(user)
      .set({
        updatedAt: new Date().toISOString(),
      })
      .where(eq(user.id, id));
  }

  // Find user by email (sanitized, without password hash)
  static async findByEmailSanitized(
    db: D1Database,
    email: string,
  ): Promise<Omit<DatabaseUser, "passwordHash"> | null> {
    const database = getDb(db);
    const result = await database
      .select({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return (result[0] as Omit<DatabaseUser, "passwordHash">) || null;
  }

  // Get user role by ID (for authorization checks)
  static async getUserRole(db: D1Database, id: number): Promise<string | null> {
    const database = getDb(db);
    const result = await database
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    return result[0]?.role || null;
  }

  // Verify user exists and get basic info for token validation
  static async verifyUserForToken(
    db: D1Database,
    id: number,
    email: string,
  ): Promise<{
    id: number;
    email: string;
    role: string;
    status: string;
  } | null> {
    const database = getDb(db);
    const result = await database
      .select({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    const foundUser = result[0];
    if (!foundUser || foundUser.email !== email) {
      return null;
    }

    return foundUser;
  }
}
