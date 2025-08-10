# Internationalization (i18n) Guide

This document describes the internationalization system implemented in the Raco Hotels backend API.

## Overview

The API now supports multiple languages through a comprehensive i18n system that handles:

- Message localization based on `Accept-Language` header
- Centralized message management
- Fallback to default language (English)
- Type-safe message access

## Supported Languages

Currently supported locales:

- **English (`en`)** - Default language
- **Spanish (`es`)** - Full translation
- **French (`fr`)** - Full translation
- **German (`de`)** - Fallback to English
- **Japanese (`ja`)** - Fallback to English
- **Chinese (`zh`)** - Fallback to English

## Architecture

### Message Configuration (`src/config/messages.ts`)

Central configuration file that defines:

- Message structure interface
- All message collections by locale
- Helper functions for message retrieval

```typescript
// Example usage
import { getMessage, getMessages } from "../config/messages";

const message = getMessage("user.created", "es"); // "Usuario creado exitosamente"
const allMessages = getMessages("fr"); // Complete French message collection
```

### i18n Utilities (`src/utils/i18n.ts`)

Provides:

- Middleware for automatic locale detection
- Context helpers for localized responses
- Type-safe message access in controllers

```typescript
// Automatic locale detection from Accept-Language header
app.use("*", i18nMiddleware());

// In controllers
const { t } = getI18n(c);
const message = t("user.created"); // Localized message
```

### Message Categories

Messages are organized into logical groups:

#### User Management

```typescript
user: {
  created: "User created successfully",
  updated: "User updated successfully",
  deleted: "User deleted successfully",
  notFound: "User not found",
  alreadyExists: "User with this email already exists",
  // ... more user messages
}
```

#### Authentication

```typescript
auth: {
  unauthorized: "Unauthorized access",
  forbidden: "Forbidden",
  tokenRequired: "Authentication token required",
  // ... more auth messages
}
```

#### Password Validation

```typescript
password: {
  tooShort: "Password must be at least 8 characters long",
  tooLong: "Password must be less than 128 characters long",
  missingUppercase: "Password must contain at least one uppercase letter",
  // ... more password messages
}
```

#### System Messages

```typescript
system: {
  healthy: "healthy",
  operationFailed: "Operation failed",
  internalError: "Internal server error",
  // ... more system messages
}
```

#### Error Codes

```typescript
errorCodes: {
  userNotFound: "USER_NOT_FOUND",
  userAlreadyExists: "USER_ALREADY_EXISTS",
  invalidCredentials: "INVALID_CREDENTIALS",
  // ... more error codes
}
```

## Usage Examples

### Client Request with Language Preference

```bash
# Request in Spanish
curl -H "Accept-Language: es,en;q=0.9" \
  http://localhost:8787/api/users/999

# Response
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuario no encontrado"
  }
}
```

```bash
# Request in French
curl -H "Accept-Language: fr,en;q=0.8" \
  http://localhost:8787/api/users

# Response
{
  "success": true,
  "data": {
    "users": [...],
    "message": "Utilisateurs récupérés avec succès"
  }
}
```

### Password Validation Errors

```bash
# Weak password in Spanish
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept-Language: es" \
  -d '{"email": "test@example.com", "password": "123"}' \
  http://localhost:8787/api/users

# Response
{
  "success": false,
  "error": {
    "code": "PASSWORD_VALIDATION_FAILED",
    "message": "Validación de contraseña fallida: La contraseña debe tener al menos 8 caracteres, La contraseña debe contener al menos una letra mayúscula, ..."
  }
}
```

### Adding New Languages

To add support for a new language:

1. **Add the locale type:**

```typescript
// src/config/messages.ts
export type SupportedLocale = "en" | "es" | "fr" | "de" | "ja" | "zh" | "pt"; // Add 'pt' for Portuguese
```

2. **Create the message collection:**

```typescript
const ptMessages: Messages = {
  user: {
    created: "Usuário criado com sucesso",
    updated: "Usuário atualizado com sucesso",
    // ... translate all messages
  },
  // ... other categories
};
```

3. **Add to collections:**

```typescript
const messageCollections: Record<SupportedLocale, Messages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  pt: ptMessages, // Add the new collection
  // ... other locales
};
```

## Implementation Details

### Automatic Locale Detection

The middleware automatically detects the user's preferred language from the `Accept-Language` header:

```typescript
// Header: Accept-Language: es,en;q=0.9,fr;q=0.8
// Detected locale: 'es' (Spanish)

// Header: Accept-Language: pt-BR,en;q=0.5
// Detected locale: 'en' (fallback, as Portuguese not fully supported)
```

### Fallback Mechanism

If a requested locale is not available:

1. Falls back to English (`en`) as default
2. Logs a warning for missing translations
3. Returns the message key as last resort

### Message Interpolation

Simple interpolation support for dynamic content:

```typescript
// Message with placeholders
"Hello {{name}}, you have {{count}} new messages";

// Usage
getMessage("greeting", "en", { name: "John", count: "5" });
// Result: "Hello John, you have 5 new messages"
```

### Performance Considerations

- Messages are loaded once at startup
- No runtime compilation or file I/O
- Memory-efficient message storage
- Fast lookup by locale and message key

## Testing i18n

### Test Different Languages

```bash
# Test English (default)
curl -H "Accept-Language: en" http://localhost:8787/api/users/999

# Test Spanish
curl -H "Accept-Language: es" http://localhost:8787/api/users/999

# Test French
curl -H "Accept-Language: fr" http://localhost:8787/api/users/999

# Test fallback (unsupported language)
curl -H "Accept-Language: ru" http://localhost:8787/api/users/999
```

### Test Error Messages

```bash
# Create user with weak password in Spanish
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept-Language: es" \
  -d '{"email": "test@example.com", "password": "weak"}' \
  http://localhost:8787/api/users
```

## Best Practices

1. **Always use message keys** instead of hardcoded strings
2. **Provide context** in message keys (e.g., `user.created` not just `created`)
3. **Keep messages consistent** across different locales
4. **Test with different languages** during development
5. **Use descriptive message keys** for maintainability
6. **Group related messages** logically

## Migration from Hardcoded Messages

All hardcoded messages have been migrated to the i18n system:

- ✅ User management messages
- ✅ Authentication messages
- ✅ Password validation messages
- ✅ System error messages
- ✅ HTTP status messages
- ✅ Operation failure messages

The system is now fully internationalized and ready for production use.
