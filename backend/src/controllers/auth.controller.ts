import { setCookie, deleteCookie, getCookie } from "hono/cookie";

import {
  generateAccessToken,
  generateRefreshToken,
  generateCSRFToken,
  verifyToken,
  COOKIE_CONFIG,
} from "../config/jwt";
import { UserResponse, handleAsyncRoute } from "../lib/responses";
import { AuthService } from "../services/auth.service";
import { getLocalizedMessage } from "../utils/i18n";

import type { AppContext } from "../types";

export class AuthController {
  // GET /auth/csrf-token - Get CSRF token for development/testing
  static async getCsrfToken(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const csrfToken = generateCSRFToken();

        // Set CSRF token in cookie for validation
        setCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, csrfToken, {
          ...COOKIE_CONFIG.OPTIONS,
          httpOnly: false, // CSRF token needs to be accessible to JavaScript
          maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
        });

        return c.json({
          success: true,
          message: getLocalizedMessage(c, "auth.csrfTokenGenerated"),
          data: {
            csrfToken,
            note: "Use this token in the X-CSRF-Token header for POST/PUT/PATCH/DELETE requests",
            expiresIn: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
          },
        });
      },
      "operation.csrfTokenFailed",
    );
  }

  // POST /auth/login - Authenticate user
  static async login(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { email, password } = await c.req.json();

        try {
          const user = await AuthService.authenticateUser(
            c.env.DB,
            email,
            password,
          );

          if (!user) {
            return UserResponse.invalidCredentials(c);
          }

          // Generate token identification for KV storage
          const tokenId = AuthService.generateTokenId();

          // Generate JWT tokens
          const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tokenId, // Include token ID in payload
          };

          const accessToken = generateAccessToken(tokenPayload);
          const refreshToken = generateRefreshToken(tokenPayload);
          const csrfToken = generateCSRFToken();

          // Store refresh token in KV with token ID as key
          await AuthService.storeRefreshToken(
            c.env.KV,
            tokenId,
            refreshToken,
            user.id,
          );

          // Set HTTP-only cookies
          setCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, accessToken, {
            ...COOKIE_CONFIG.OPTIONS,
            maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
          });

          setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, refreshToken, {
            ...COOKIE_CONFIG.OPTIONS,
            maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
          });

          setCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, csrfToken, {
            ...COOKIE_CONFIG.OPTIONS,
            httpOnly: false, // CSRF token needs to be accessible to JavaScript
            maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
          });

          return UserResponse.loginSuccessful(c, user, {
            csrfToken,
            expiresIn: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes("disabled")) {
            return UserResponse.accountDisabled(c);
          }
          throw error;
        }
      },
      "operation.authenticateUserFailed",
    );
  }

  // POST /auth/logout - Logout user and clear cookies
  static async logout(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        try {
          // Get refresh token to remove from KV
          const refreshToken = getCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME);

          if (refreshToken) {
            try {
              const decoded = verifyToken(refreshToken);
              if (decoded.tokenId) {
                // Remove token from KV storage
                await AuthService.revokeRefreshToken(c.env.KV, decoded.tokenId);
              }
            } catch (error) {
              // Token might be invalid, but we still want to clear cookies
              console.warn("Failed to revoke token from KV:", error);
            }
          }

          // Clear all authentication cookies
          deleteCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
          });

          deleteCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
          });

          deleteCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
            httpOnly: false,
          });

          return c.json({
            success: true,
            message: getLocalizedMessage(c, "user.logoutSuccessful"),
          });
        } catch (error) {
          console.error("Logout error:", error);
          // Still clear cookies even if KV operation fails
          deleteCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
          });
          deleteCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
          });
          deleteCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
            httpOnly: false,
          });

          return c.json({
            success: true,
            message: getLocalizedMessage(c, "user.logoutSuccessful"),
          });
        }
      },
      "operation.logoutUserFailed",
    );
  }

  // POST /auth/refresh - Refresh access token using refresh token
  static async refresh(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const refreshToken = getCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME);

        if (!refreshToken) {
          return c.json(
            {
              success: false,
              message: getLocalizedMessage(c, "auth.refreshTokenMissing"),
            },
            401,
          );
        }

        try {
          // Verify refresh token
          const decoded = verifyToken(refreshToken);

          if (!decoded.tokenId) {
            return c.json(
              {
                success: false,
                message: getLocalizedMessage(c, "auth.invalidRefreshToken"),
              },
              401,
            );
          }

          // Check if token exists and is valid in KV
          const storedToken = await AuthService.getRefreshToken(
            c.env.KV,
            decoded.tokenId,
          );

          if (!storedToken || storedToken.token !== refreshToken) {
            return c.json(
              {
                success: false,
                message: getLocalizedMessage(c, "auth.invalidRefreshToken"),
              },
              401,
            );
          }

          // Get user to ensure they still exist and are active
          const user = await AuthService.getUserForToken(
            c.env.DB,
            decoded.userId,
          );

          if (!user) {
            // Remove invalid token from KV
            await AuthService.revokeRefreshToken(c.env.KV, decoded.tokenId);
            return c.json(
              {
                success: false,
                message: getLocalizedMessage(c, "auth.userNotFound"),
              },
              401,
            );
          }

          // Generate new token ID for security (optional: can reuse existing)
          const newTokenId = AuthService.generateTokenId();

          // Generate new tokens
          const newTokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tokenId: newTokenId,
          };

          const newAccessToken = generateAccessToken(newTokenPayload);
          const newRefreshToken = generateRefreshToken(newTokenPayload);
          const newCsrfToken = generateCSRFToken();

          // Remove old refresh token and store new one
          await AuthService.revokeRefreshToken(c.env.KV, decoded.tokenId);
          await AuthService.storeRefreshToken(
            c.env.KV,
            newTokenId,
            newRefreshToken,
            user.id,
          );

          // Set new cookies
          setCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, newAccessToken, {
            ...COOKIE_CONFIG.OPTIONS,
            maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
          });

          setCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, newRefreshToken, {
            ...COOKIE_CONFIG.OPTIONS,
            maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
          });

          setCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, newCsrfToken, {
            ...COOKIE_CONFIG.OPTIONS,
            httpOnly: false,
            maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
          });

          return c.json({
            success: true,
            message: getLocalizedMessage(c, "auth.tokenRefreshed"),
            data: {
              csrfToken: newCsrfToken,
              expiresIn: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
            },
          });
        } catch (error) {
          console.error("Token refresh error:", error);
          return c.json(
            {
              success: false,
              message: getLocalizedMessage(c, "auth.invalidRefreshToken"),
            },
            401,
          );
        }
      },
      "operation.refreshTokenFailed",
    );
  }

  // POST /auth/change-password - Change user password
  static async changePassword(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { currentPassword, newPassword } = await c.req.json();

        // Get user from token
        const authUser = c.get("user");
        if (!authUser) {
          return c.json(
            {
              success: false,
              message: getLocalizedMessage(c, "auth.unauthorized"),
            },
            401,
          );
        }

        try {
          // Change password using auth service
          await AuthService.changePassword(
            c.env.DB,
            c.env.KV,
            authUser.userId,
            currentPassword,
            newPassword,
          );

          return UserResponse.passwordChanged(c);
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes("Invalid current password")) {
              return UserResponse.invalidCurrentPassword(c);
            }
            if (error.message.includes("Password validation failed")) {
              return UserResponse.passwordValidationFailed(c, error.message);
            }
            if (error.message.includes("User not found")) {
              return UserResponse.userNotFound(c);
            }
          }
          throw error;
        }
      },
      "operation.changePasswordFailed",
    );
  }

  // POST /auth/revoke-all-sessions - Revoke all refresh tokens for user
  static async revokeAllSessions(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const authUser = c.get("user");
        if (!authUser) {
          return c.json(
            {
              success: false,
              message: getLocalizedMessage(c, "auth.unauthorized"),
            },
            401,
          );
        }

        try {
          // Revoke all sessions for the user
          await AuthService.revokeAllUserSessions(c.env.KV, authUser.userId);

          // Clear current session cookies
          deleteCookie(c, COOKIE_CONFIG.ACCESS_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
          });

          deleteCookie(c, COOKIE_CONFIG.REFRESH_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
          });

          deleteCookie(c, COOKIE_CONFIG.CSRF_TOKEN_NAME, {
            ...COOKIE_CONFIG.OPTIONS,
            httpOnly: false,
          });

          return c.json({
            success: true,
            message: getLocalizedMessage(c, "auth.allSessionsRevoked"),
          });
        } catch (error) {
          console.error("Revoke all sessions error:", error);
          throw error;
        }
      },
      "operation.revokeAllSessionsFailed",
    );
  }

  // GET /auth/verify - Verify current authentication status
  static async verify(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const authUser = c.get("user");
        if (!authUser) {
          return c.json(
            {
              success: false,
              message: getLocalizedMessage(c, "auth.unauthorized"),
            },
            401,
          );
        }

        // Get full user details
        const user = await AuthService.getUserForToken(
          c.env.DB,
          authUser.userId,
        );

        if (!user) {
          return c.json(
            {
              success: false,
              message: getLocalizedMessage(c, "auth.userNotFound"),
            },
            401,
          );
        }

        return c.json({
          success: true,
          message: getLocalizedMessage(c, "auth.verified"),
          data: {
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
              status: user.status,
            },
          },
        });
      },
      "operation.verifyAuthFailed",
    );
  }
}
