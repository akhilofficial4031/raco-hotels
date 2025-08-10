import { scrypt } from "@noble/hashes/scrypt";
import { randomBytes } from "@noble/hashes/utils";

import { getMessage, DEFAULT_LOCALE } from "../config/messages";
import { USER_STATUS } from "../constants";
import { AuthRepository } from "../repositories/auth.repository";
import { UserRepository } from "../repositories/user.repository";

import type { DatabaseUser } from "../types";

// Refresh token storage interface for KV
interface StoredRefreshToken {
  token: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
}

// Token ID prefix for KV storage organization
const TOKEN_PREFIX = "auth:refresh:";
const USER_SESSIONS_PREFIX = "auth:user:sessions:";

export class AuthService {
  // Authenticate user with email and password
  static async authenticateUser(
    db: D1Database,
    email: string,
    password: string,
  ): Promise<DatabaseUser | null> {
    const user = await AuthRepository.findByEmailWithPassword(db, email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isValidPassword = await this.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      return null;
    }

    // Check if user is active
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new Error(getMessage("user.accountDisabled", DEFAULT_LOCALE));
    }

    return this.sanitizeUser(user);
  }

  // Change user password with validation
  static async changePassword(
    db: D1Database,
    kv: KVNamespace,
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Get user with password hash
    const user = await AuthRepository.findByIdWithPassword(db, userId);
    if (!user) {
      throw new Error(getMessage("user.notFound", DEFAULT_LOCALE));
    }

    // Verify current password
    if (!user.passwordHash) {
      throw new Error("Invalid current password");
    }

    const isValidCurrentPassword = await this.verifyPassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isValidCurrentPassword) {
      throw new Error("Invalid current password");
    }

    // Validate new password strength
    this.validatePasswordStrength(newPassword);

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password in database
    await AuthRepository.updatePassword(db, userId, newPasswordHash);

    // Revoke all refresh tokens for security
    await this.revokeAllUserSessions(kv, userId);
  }

  // Get user for token validation (without password hash)
  static async getUserForToken(
    db: D1Database,
    userId: number,
  ): Promise<DatabaseUser | null> {
    const user = await UserRepository.findById(db, userId);
    if (!user || user.status !== USER_STATUS.ACTIVE) {
      return null;
    }
    return this.sanitizeUser(user);
  }

  // Generate unique token ID
  static generateTokenId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = randomBytes(16).reduce((acc, byte) => {
      return acc + byte.toString(36);
    }, "");
    return `${timestamp}_${randomPart}`;
  }

  // Store refresh token in KV
  static async storeRefreshToken(
    kv: KVNamespace,
    tokenId: string,
    refreshToken: string,
    userId: number,
  ): Promise<void> {
    const tokenData: StoredRefreshToken = {
      token: refreshToken,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const key = TOKEN_PREFIX + tokenId;

    // Store token with expiration (7 days)
    await kv.put(key, JSON.stringify(tokenData), {
      expirationTtl: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    // Add token to user's session list
    await this.addTokenToUserSessions(kv, userId, tokenId);
  }

  // Get refresh token from KV
  static async getRefreshToken(
    kv: KVNamespace,
    tokenId: string,
  ): Promise<StoredRefreshToken | null> {
    const key = TOKEN_PREFIX + tokenId;
    const data = await kv.get(key);

    if (!data) {
      return null;
    }

    try {
      const tokenData = JSON.parse(data) as StoredRefreshToken;

      // Check if token is expired
      if (new Date(tokenData.expiresAt) < new Date()) {
        // Remove expired token
        await this.revokeRefreshToken(kv, tokenId);
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error("Failed to parse token data:", error);
      return null;
    }
  }

  // Revoke specific refresh token
  static async revokeRefreshToken(
    kv: KVNamespace,
    tokenId: string,
  ): Promise<void> {
    const key = TOKEN_PREFIX + tokenId;

    // Get token data to find user ID before deletion
    const tokenData = await this.getRefreshToken(kv, tokenId);

    // Delete token
    await kv.delete(key);

    // Remove from user's session list
    if (tokenData) {
      await this.removeTokenFromUserSessions(kv, tokenData.userId, tokenId);
    }
  }

  // Revoke all refresh tokens for a user
  static async revokeAllUserSessions(
    kv: KVNamespace,
    userId: number,
  ): Promise<void> {
    const sessionsKey = USER_SESSIONS_PREFIX + userId;
    const sessionsData = await kv.get(sessionsKey);

    if (!sessionsData) {
      return;
    }

    try {
      const tokenIds = JSON.parse(sessionsData) as string[];

      // Delete all tokens
      const deletePromises = tokenIds.map(async (tokenId) => {
        const tokenKey = TOKEN_PREFIX + tokenId;
        await kv.delete(tokenKey);
      });

      await Promise.all(deletePromises);

      // Clear user's session list
      await kv.delete(sessionsKey);
    } catch (error) {
      console.error("Failed to revoke all user sessions:", error);
      // If parsing fails, just clear the sessions list
      await kv.delete(sessionsKey);
    }
  }

  // Add token to user's session list
  private static async addTokenToUserSessions(
    kv: KVNamespace,
    userId: number,
    tokenId: string,
  ): Promise<void> {
    const key = USER_SESSIONS_PREFIX + userId;
    const existingData = await kv.get(key);

    let tokenIds: string[] = [];
    if (existingData) {
      try {
        tokenIds = JSON.parse(existingData) as string[];
      } catch (error) {
        console.warn("Failed to parse existing sessions:", error);
        tokenIds = [];
      }
    }

    // Add new token ID if not already present
    if (!tokenIds.includes(tokenId)) {
      tokenIds.push(tokenId);
    }

    // Store updated list (with longer TTL than individual tokens for cleanup)
    await kv.put(key, JSON.stringify(tokenIds), {
      expirationTtl: 8 * 24 * 60 * 60, // 8 days in seconds (longer than token TTL)
    });
  }

  // Remove token from user's session list
  private static async removeTokenFromUserSessions(
    kv: KVNamespace,
    userId: number,
    tokenId: string,
  ): Promise<void> {
    const key = USER_SESSIONS_PREFIX + userId;
    const existingData = await kv.get(key);

    if (!existingData) {
      return;
    }

    try {
      const tokenIds = JSON.parse(existingData) as string[];
      const updatedTokenIds = tokenIds.filter((id) => id !== tokenId);

      if (updatedTokenIds.length === 0) {
        // No more sessions, delete the key
        await kv.delete(key);
      } else {
        // Update the list
        await kv.put(key, JSON.stringify(updatedTokenIds), {
          expirationTtl: 8 * 24 * 60 * 60, // 8 days in seconds
        });
      }
    } catch (error) {
      console.warn("Failed to update user sessions:", error);
    }
  }

  // Validate password strength
  static validatePasswordStrength(password: string): void {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push(getMessage("password.tooShort", DEFAULT_LOCALE));
    }

    if (password.length > 128) {
      errors.push(getMessage("password.tooLong", DEFAULT_LOCALE));
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(getMessage("password.missingUppercase", DEFAULT_LOCALE));
    }

    if (!/[a-z]/.test(password)) {
      errors.push(getMessage("password.missingLowercase", DEFAULT_LOCALE));
    }

    if (!/\d/.test(password)) {
      errors.push(getMessage("password.missingNumber", DEFAULT_LOCALE));
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push(getMessage("password.missingSpecialChar", DEFAULT_LOCALE));
    }

    if (errors.length > 0) {
      throw new Error(
        `${getMessage("password.validationFailed", DEFAULT_LOCALE)}: ${errors.join(", ")}`,
      );
    }
  }

  // Hash password using scrypt
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16); // Generate a random 16-byte salt
    const hash = scrypt(password, salt, { N: 2 ** 14, r: 8, p: 1, dkLen: 64 });

    // Combine salt and hash for storage
    const combined = new Uint8Array(salt.length + hash.length);
    combined.set(salt);
    combined.set(hash, salt.length);

    return Buffer.from(combined).toString("base64");
  }

  // Verify password against hash
  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      const combined = Buffer.from(hash, "base64");

      // Extract salt (first 16 bytes) and stored hash
      const salt = combined.slice(0, 16);
      const storedHash = combined.slice(16);

      // Hash the provided password with the same salt
      const candidateHash = scrypt(password, salt, {
        N: 2 ** 14,
        r: 8,
        p: 1,
        dkLen: 64,
      });

      // Compare the hashes using constant-time comparison
      if (candidateHash.length !== storedHash.length) {
        return false;
      }

      let result = 0;
      for (let i = 0; i < candidateHash.length; i++) {
        result |= candidateHash[i] ^ storedHash[i];
      }

      return result === 0;
    } catch {
      return false;
    }
  }

  // Remove password hash from user object
  private static sanitizeUser(user: DatabaseUser): DatabaseUser {
    return { ...user, passwordHash: null };
  }

  // Clean up expired tokens (utility method for scheduled cleanup)
  static async cleanupExpiredTokens(kv: KVNamespace): Promise<void> {
    // This would require listing keys with prefix, which might not be available
    // in all KV implementations. For now, we rely on TTL for automatic cleanup.
    // In production, you might want to implement a scheduled job to clean up
    // user session lists that reference expired tokens.
    console.log(
      kv,
      "Token cleanup relies on TTL. Manual cleanup not implemented.",
    );
  }
}
