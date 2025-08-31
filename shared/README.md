# @raco-hotels/shared

Shared types and utilities for the Raco Hotels project.

## Usage

### Backend

```typescript
import { UserStatus, USER_STATUS_VALUES, UserStatusType } from '@raco-hotels/shared';

// Use the enum
const status = UserStatus.ACTIVE;

// Use the values array for validation
if (USER_STATUS_VALUES.includes(status)) {
  // Valid status
}

// TypeScript type checking
const userStatus: UserStatusType = 'active';
```

### Frontend

```typescript
import { UserStatus, USER_STATUS_VALUES, UserStatusType } from '@raco-hotels/shared';

// Use in components, services, etc.
const isUserActive = (status: UserStatusType) => status === UserStatus.ACTIVE;
```

## Available Types

### UserStatus

Enum containing all possible user statuses:

- `ACTIVE` - User is active and can use the system
- `DISABLED` - User is disabled and cannot access the system
- `SUSPENDED` - User is temporarily suspended
- `PENDING_ACTIVATION` - User account created but password not set yet

### USER_STATUS_VALUES

Array of all valid user status string values for validation purposes.

### UserStatusType

TypeScript union type of all possible user status values.
