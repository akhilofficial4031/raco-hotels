# Security Implementation Guide

## Overview

This document outlines the comprehensive security middleware system implemented for the Raco Hotels backend API.

## Security Features Implemented

### 1. JWT Authentication with HTTP-only Cookies

- **Access tokens**: 15-minute expiration stored in HTTP-only cookies
- **Refresh tokens**: 7-day expiration for token renewal
- **Secure cookie settings**: HTTP-only, Secure (in production), SameSite=strict

**Files involved:**

- `src/config/jwt.ts` - JWT configuration and utilities
- `src/middleware/auth.ts` - Authentication middleware

### 2. CSRF Protection

- **CSRF tokens**: Generated on login, required for state-changing operations
- **Double-submit cookies**: CSRF token in both cookie and header
- **Validation**: Tokens must match and be valid

**Files involved:**

- `src/middleware/csrf.ts` - CSRF protection middleware

### 3. Role-Based Access Control (RBAC)

- **Admin-only routes**: User management (Create, Read, Update, Delete)
- **Authenticated routes**: Password change requires authentication
- **Guest access**: Only login/logout are public

**Files involved:**

- `src/middleware/rbac.ts` - Role-based access control

### 4. Security Headers (Helmet-like)

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Content-Security-Policy**: Restrictive CSP
- **Strict-Transport-Security**: HTTPS enforcement (production)

**Files involved:**

- `src/middleware/security.ts` - Security headers middleware

### 5. Rate Limiting

- **Basic implementation**: IP-based request logging
- **Production note**: Should be enhanced with Redis for distributed rate limiting

## API Endpoints Security

### Public Endpoints (No Authentication)

- `POST /api/users/login` - User authentication
- `POST /api/users/logout` - Clear authentication cookies

### Admin-Only Endpoints (Authentication + Admin Role + CSRF)

- `GET /api/users` - List users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PATCH /api/users/{id}/status` - Toggle user status
- `GET /api/users/search` - Search users
- `GET /api/users/stats` - User statistics

### Authenticated Endpoints (Authentication + CSRF)

- `POST /api/users/{id}/change-password` - Change password

## Frontend Integration

### Cookie Management

```javascript
// Cookies are automatically managed by the browser
// Access token: HTTP-only (not accessible to JavaScript)
// CSRF token: Accessible to JavaScript for header inclusion
```

### API Requests

```javascript
// Include CSRF token in requests
fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": getCookie("csrf_token"), // Get from document.cookie
  },
  credentials: "include", // Include cookies
  body: JSON.stringify(data),
});
```

## Environment Variables

```bash
# JWT Secret (REQUIRED in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Environment
NODE_ENV=production # Enables secure cookies and HSTS
```

## Security Best Practices Implemented

1. **HTTP-only cookies**: Prevents XSS attacks on tokens
2. **CSRF protection**: Prevents cross-site request forgery
3. **Role-based access**: Ensures proper authorization
4. **Security headers**: Protects against common web vulnerabilities
5. **Token expiration**: Limits token lifetime
6. **Secure cookie settings**: Prevents token interception

## Future Enhancements

1. **Redis-based rate limiting**: For distributed environments
2. **Account lockout**: After failed login attempts
3. **Session management**: Track and revoke active sessions
4. **Audit logging**: Log security-relevant events
5. **2FA support**: Two-factor authentication
6. **Password policies**: Enforce strong passwords
