# ClassSync API Architecture Documentation

## Overview

This document describes the clean architecture implemented in the ClassSync backend API, which separates concerns for better maintainability, testability, and scalability. The architecture follows Domain-Driven Design (DDD) principles with clear separation between business logic, data access, and API documentation.

## Architecture Principles

### 1. Separation of Concerns

- **Route Definitions**: OpenAPI/Swagger documentation separated from business logic
- **Controllers**: Pure business logic without OpenAPI concerns
- **Repositories**: Database operations and data access layer
- **Services**: Complex business logic and orchestration
- **Middleware**: Cross-cutting concerns like authentication, validation, etc.

### 2. DRY (Don't Repeat Yourself)

- Common response builders to avoid duplication
- Reusable OpenAPI helper functions
- Shared schemas and types

### 3. Clean Code

- Small, focused functions with single responsibilities
- Consistent naming conventions
- Clear folder structure

## Folder Structure

```
apps/backend/src/
├── config/                    # Configuration files
│   └── config.ts              #  configuration
├── constants/                 # Application constants
│   └── index.ts              # HTTP status codes, error codes
├── controllers/              # Business logic controllers
│   ├── auth.ts              # Authentication controller
│   ├── system.ts            # System controller
│   └── [feature].ts         # Feature-specific controllers
├── lib/                      # Shared libraries and utilities
│   ├── openapi.ts           # OpenAPI helper functions
│   └── responses.ts         # Response builder utilities
├── middleware/               # Custom middleware
│   ├── errorHandler.ts      # Global error handler
│   ├── rateLimiter.ts       # Rate limiting
│   ├── requestId.ts         # Request ID generation
├── repositories/             # Data access layer
│   ├── auth.repository.ts   # Authentication data operations
│   ├── user.repository.ts   # User data operations
│   └── [feature].repository.ts # Feature-specific repositories
├── routes/                   # Route definitions and handlers
│   ├── definitions/         # OpenAPI route definitions
│   │   ├── auth.ts         # Auth route definitions
│   │   ├── system.ts       # System route definitions
│   │   └── [feature].ts    # Feature route definitions
│   ├── auth.ts             # Auth route handlers
│   └── [feature].ts        # Feature route handlers
├── schemas/                  # Zod schemas for validation
│   └── index.ts             # All API schemas
├── services/                 # Business logic services
│   ├── auth.service.ts      # Authentication service
│   └── [feature].service.ts # Feature-specific services
├── types/                    # TypeScript type definitions
│   ├── context.ts           # Hono context types
│   └── index.ts             # Shared types
├── utils/                    # Utility functions
│   └── index.ts             # Response helpers
└── index.ts                 # Main application entry point
```

## Core Components

### 1. OpenAPI Helpers (`lib/openapi.ts`)

Provides reusable functions to create route definitions without duplication:

```typescript
// Create authenticated routes
const route = createAuthenticatedRoute({
  method: 'get',
  path: '/users',
  summary: 'Get users',
  description: 'Retrieve all users',
  tags: [ApiTags.USERS],
  successSchema: UsersResponseSchema,
  includePagination: true,
});

// Create public routes
const publicRoute = createPublicRoute({
  method: 'get',
  path: '/health',
  summary: 'Health check',
  description: 'Check API health',
  tags: [ApiTags.SYSTEM],
  successSchema: HealthCheckResponseSchema,
});
```

### 2. Response Builders (`lib/responses.ts`)

Consistent response handling across all endpoints:

```typescript
// Success responses
return ApiResponse.success(c, data, 'Operation successful');
return ApiResponse.created(c, newUser, 'User created');

// Error responses
return ApiResponse.badRequest(c, 'Invalid data');
return ApiResponse.unauthorized(c, 'Authentication required');
return ApiResponse.notFound(c, 'User not found');

// Domain-specific responses
return AuthResponse.sessionNotFound(c);
return AuthResponse.profileRetrieved(c, userInfo);
```

### 3. Services (Complex Business Logic)

Services handle complex business logic, validation, and orchestration:

```typescript
export class UserService {
  static async createUserWithValidation(userData: CreateUserData) {
    // Step 1: Validate business rules
    this.validateUserData(userData);

    // Step 2: Check for duplicates
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Step 3: Transform data
    const transformedData = this.transformUserData(userData);

    // Step 4: Create user
    const user = await UserRepository.create(transformedData);

    // Step 5: Handle side effects
    await this.sendWelcomeEmail(user.email);
    await this.setupDefaultPreferences(user.id);

    return user;
  }

  private static validateUserData(data: CreateUserData) {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Invalid email');
    }
    // More validation...
  }
}
```

### 4. Controllers (HTTP Layer)

Thin controllers that delegate to services:

```typescript
export class UserController {
  static async getUsers(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        // Delegate complex logic to service
        const users = await UserService.getUsersWithPermissions(c.get('userId'));
        return ApiResponse.success(c, { users });
      },
      'Failed to fetch users',
    );
  }

  static async createUser(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        const userData = await c.req.json();
        // Delegate complex validation and creation to service
        const user = await UserService.createUserWithValidation(userData);
        return ApiResponse.created(c, { user });
      },
      'Failed to create user',
    );
  }
}
```

### 5. Repositories

Data access layer for database operations:

```typescript
export class UserRepository {
  static async findAll(): Promise<User[]> {
    const db = getDatabase();
    return await db.select().from(users);
  }

  static async findById(id: string): Promise<User | null> {
    const db = getDatabase();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }
}
```

## When to Use Services vs Controllers

### Use Services When:

- **Complex validation logic** - Multiple validation rules, cross-field validation
- **Multi-step operations** - User creation with email sending, profile setup
- **Business rules** - Role-based permissions, workflow logic
- **Data transformation** - Normalizing data, calculating derived fields
- **External integrations** - Email services, payment processors, file uploads
- **Orchestration** - Coordinating multiple repositories or external services
- **Side effects** - Sending notifications, updating caches, logging events

### Keep in Controllers When:

- **Simple CRUD operations** - Direct database reads/writes
- **Request/response handling** - Parsing request data, formatting responses
- **Authentication checks** - Session validation, permission checks
- **HTTP-specific logic** - Status codes, headers, redirects

### Example Comparison:

**Simple Controller (No Service Needed):**

```typescript
static async getUsers(c: Context) {
  const users = await UserRepository.findAll();
  return ApiResponse.success(c, { users });
}
```

**Complex Operation (Needs Service):**

```typescript
static async createUser(c: Context) {
  const userData = await c.req.json();
  // Delegate to service for complex logic
  const user = await UserService.createUserWithValidation(userData);
  return ApiResponse.created(c, { user });
}
```

## How to Create a New API

Follow these steps to create a new API endpoint following the clean architecture:

### Step 1: Define Schemas

Create Zod schemas in `schemas/index.ts`:

```typescript
// Request schemas
export const CreateUserRequestSchema = z
  .object({
    name: z.string().min(1).openapi({
      example: 'John Doe',
      description: 'User full name',
    }),
    email: z.string().email().openapi({
      example: 'john@example.com',
      description: 'User email address',
    }),
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).openapi({
      example: 'STUDENT',
      description: 'User role',
    }),
  })
  .openapi('CreateUserRequest');

// Response schemas
export const UserResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      message: z.string().openapi({ example: 'User created successfully' }),
      user: z.object({
        id: z.string().openapi({ example: 'user_123' }),
        name: z.string().openapi({ example: 'John Doe' }),
        email: z.string().openapi({ example: 'john@example.com' }),
        role: z.string().openapi({ example: 'STUDENT' }),
      }),
    }),
  })
  .openapi('UserResponse');
```

### Step 2: Create Repository

Create `repositories/user.repository.ts`:

```typescript
import { eq, and } from 'drizzle-orm';
import { users } from '../../db/schema';
import { getDatabase } from '../../db';

export class UserRepository {
  static async findAll() {
    const db = getDatabase();
    return await db.select().from(users);
  }

  static async findById(id: string) {
    const db = getDatabase();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  static async create(userData: { name: string; email: string; role: string }) {
    const db = getDatabase();
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  static async update(
    id: string,
    userData: Partial<{
      name: string;
      email: string;
      role: string;
    }>,
  ) {
    const db = getDatabase();
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }

  static async delete(id: string) {
    const db = getDatabase();
    await db.delete(users).where(eq(users.id, id));
  }

  static async findByEmail(email: string) {
    const db = getDatabase();
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }
}
```

### Step 3: Create Service (Optional)

For complex business logic, create `services/user.service.ts`:

```typescript
import { UserRepository } from '../repositories/user.repository';
import { CreateUserRequestSchema } from '../schemas';

export class UserService {
  static async createUser(userData: z.infer<typeof CreateUserRequestSchema>) {
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const newUser = await UserRepository.create({
      ...userData,
      id: generateUserId(), // Your ID generation logic
    });

    return newUser;
  }

  static async getUserWithProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Add additional profile data
    const profile = await getProfileData(user.id);

    return {
      ...user,
      profile,
    };
  }
}
```

### Step 4: Create Controller

Create `controllers/user.controller.ts`:

```typescript
import { Context } from 'hono';
import { ApiResponse, handleAsyncRoute } from '../lib/responses';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';

export class UserController {
  static async getUsers(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        const users = await UserRepository.findAll();
        return ApiResponse.success(c, { users });
      },
      'Failed to fetch users',
    );
  }

  static async getUserById(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const user = await UserRepository.findById(id);

        if (!user) {
          return ApiResponse.notFound(c, 'User not found');
        }

        return ApiResponse.success(c, { user });
      },
      'Failed to fetch user',
    );
  }

  static async createUser(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        const userData = await c.req.json();

        try {
          const newUser = await UserService.createUser(userData);
          return ApiResponse.created(c, { user: newUser }, 'User created successfully');
        } catch (error) {
          if (error.message === 'User with this email already exists') {
            return ApiResponse.conflict(c, error.message);
          }
          throw error;
        }
      },
      'Failed to create user',
    );
  }

  static async updateUser(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const userData = await c.req.json();

        const existingUser = await UserRepository.findById(id);
        if (!existingUser) {
          return ApiResponse.notFound(c, 'User not found');
        }

        const updatedUser = await UserRepository.update(id, userData);
        return ApiResponse.success(c, { user: updatedUser }, 'User updated successfully');
      },
      'Failed to update user',
    );
  }

  static async deleteUser(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();

        const existingUser = await UserRepository.findById(id);
        if (!existingUser) {
          return ApiResponse.notFound(c, 'User not found');
        }

        await UserRepository.delete(id);
        return ApiResponse.success(c, {}, 'User deleted successfully');
      },
      'Failed to delete user',
    );
  }
}
```

### Step 5: Create Route Definitions

Create `routes/definitions/user.ts`:

```typescript
import { createAuthenticatedRoute, ApiTags } from '../../lib/openapi';
import {
  UserResponseSchema,
  UsersResponseSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
} from '../../schemas';

export const UserRouteDefinitions = {
  // GET /users
  getUsers: createAuthenticatedRoute({
    method: 'get',
    path: '/users',
    summary: 'Get all users',
    description: 'Retrieve a list of all users',
    tags: [ApiTags.USERS],
    successSchema: UsersResponseSchema,
    successDescription: 'Users retrieved successfully',
  }),

  // GET /users/:id
  getUserById: createAuthenticatedRoute({
    method: 'get',
    path: '/users/{id}',
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
    tags: [ApiTags.USERS],
    successSchema: UserResponseSchema,
    successDescription: 'User retrieved successfully',
    includeNotFound: true,
  }),

  // POST /users
  createUser: createAuthenticatedRoute({
    method: 'post',
    path: '/users',
    summary: 'Create new user',
    description: 'Create a new user account',
    tags: [ApiTags.USERS],
    successSchema: UserResponseSchema,
    successDescription: 'User created successfully',
    requestSchema: CreateUserRequestSchema,
    requestDescription: 'User data',
    includeBadRequest: true,
  }),

  // PUT /users/:id
  updateUser: createAuthenticatedRoute({
    method: 'put',
    path: '/users/{id}',
    summary: 'Update user',
    description: 'Update an existing user',
    tags: [ApiTags.USERS],
    successSchema: UserResponseSchema,
    successDescription: 'User updated successfully',
    requestSchema: UpdateUserRequestSchema,
    requestDescription: 'Updated user data',
    includeBadRequest: true,
    includeNotFound: true,
  }),

  // DELETE /users/:id
  deleteUser: createAuthenticatedRoute({
    method: 'delete',
    path: '/users/{id}',
    summary: 'Delete user',
    description: 'Delete an existing user',
    tags: [ApiTags.USERS],
    successSchema: UserResponseSchema,
    successDescription: 'User deleted successfully',
    includeNotFound: true,
  }),
};
```

### Step 6: Create Route Handler

Create `routes/user.ts`:

```typescript
import { OpenAPIHono } from '@hono/zod-openapi';
import { UserRouteDefinitions } from './definitions/user';
import { UserController } from '../controllers/user.controller';

// Apply authentication middleware
userRoutes.use('*', verifySession);

// Register routes - clean and simple!
userRoutes.openapi(UserRouteDefinitions.getUsers, UserController.getUsers);
userRoutes.openapi(UserRouteDefinitions.getUserById, UserController.getUserById);
userRoutes.openapi(UserRouteDefinitions.createUser, UserController.createUser);
userRoutes.openapi(UserRouteDefinitions.updateUser, UserController.updateUser);
userRoutes.openapi(UserRouteDefinitions.deleteUser, UserController.deleteUser);

export default userRoutes;
```

### Step 7: Register Routes in Main App

Update `index.ts`:

```typescript
// Import the new route
import userRoutes from '@/routes/user';

// Register the route
app.route('/api/users', userRoutes);
```

## Best Practices

### 1. Error Handling

- Always use `handleAsyncRoute` for async operations
- Use specific error responses (`ApiResponse.badRequest`, `ApiResponse.notFound`, etc.)
- Log errors with context information

### 2. Validation

- Define comprehensive Zod schemas with examples
- Use OpenAPI descriptions for better documentation
- Validate both request and response data

### 3. Database Operations

- Keep all database operations in repositories
- Use transactions for multi-step operations
- Handle database errors gracefully

### 4. Authentication

- Use `createAuthenticatedRoute` for protected endpoints
- Use `createPublicRoute` for public endpoints
- Validate session in controllers when needed

### 5. Documentation

- Provide clear summaries and descriptions
- Include examples in schemas
- Use consistent naming conventions
- Tag endpoints appropriately

## Testing

### Unit Tests

```typescript
// Test repositories
describe('UserRepository', () => {
  it('should create a user', async () => {
    const userData = { name: 'John', email: 'john@test.com', role: 'STUDENT' };
    const user = await UserRepository.create(userData);
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('John');
  });
});

// Test controllers
describe('UserController', () => {
  it('should return users list', async () => {
    const mockContext = createMockContext();
    const response = await UserController.getUsers(mockContext);
    expect(response.status).toBe(200);
  });
});
```

### Integration Tests

```typescript
// Test complete API endpoints
describe('User API', () => {
  it('should create and retrieve user', async () => {
    const response = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John',
        email: 'john@test.com',
        role: 'STUDENT',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

## Migration from Old Structure

If you have existing routes that don't follow this structure:

1. **Extract schemas** from inline definitions to `schemas/index.ts`
2. **Create repository** for database operations
3. **Move business logic** to controllers
4. **Create route definitions** using helper functions
5. **Update route handlers** to use new structure
6. **Test thoroughly** to ensure functionality remains intact

## Conclusion

This architecture provides:

- **Clear separation of concerns**
- **Reduced code duplication**
- **Better maintainability**
- **Comprehensive API documentation**
- **Consistent error handling**
- **Easy testing**

Follow this guide when creating new APIs to maintain consistency and quality across the entire codebase.
