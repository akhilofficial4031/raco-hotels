import * as jwt from "jsonwebtoken";

import { type UserRole } from "../types";

// JWT Configuration
export const JWT_CONFIG = {
  // In production, this should be a strong, randomly generated secret
  SECRET:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  ACCESS_TOKEN_EXPIRES_IN: "15m",
  REFRESH_TOKEN_EXPIRES_IN: "7d",
  ISSUER: "raco-hotels",
  AUDIENCE: "raco-hotels-admin",
} as const;

// Cookie Configuration
export const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: "access_token",
  REFRESH_TOKEN_NAME: "refresh_token",
  CSRF_TOKEN_NAME: "csrf_token",
  OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only secure in production
    sameSite: "lax" as const, // Changed from strict to lax for better compatibility
    path: "/",
  },
  ACCESS_TOKEN_MAX_AGE: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

// JWT Payload Interface
export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  tokenId?: string; // For refresh token identification
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Generate Access Token
export function generateAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp" | "iss" | "aud">,
): string {
  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
  });
}

// Generate Refresh Token
export function generateRefreshToken(
  payload: Omit<JWTPayload, "iat" | "exp" | "iss" | "aud">,
): string {
  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
  });
}

// Verify Token
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_CONFIG.SECRET, {
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
  }) as JWTPayload;
}

// Generate CSRF Token
export function generateCSRFToken(): string {
  return jwt.sign({ type: "csrf", timestamp: Date.now() }, JWT_CONFIG.SECRET, {
    expiresIn: "1h",
  });
}

// Verify CSRF Token
export function verifyCSRFToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as any;
    return decoded.type === "csrf";
  } catch {
    return false;
  }
}
