/**
 * i18n Testing Examples
 *
 * This file contains examples of how to test the internationalization
 * features of the Raco Hotels API.
 */

// Test commands for different languages
export const testCommands = {
  // Test user creation with different languages
  createUserEnglish: `
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Accept-Language: en" \\
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "fullName": "John Doe"
  }' \\
  http://localhost:8787/api/users
`,

  createUserSpanish: `
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Accept-Language: es" \\
  -d '{
    "email": "juan@example.com", 
    "password": "SecurePass123!",
    "fullName": "Juan Pérez"
  }' \\
  http://localhost:8787/api/users
`,

  createUserFrench: `
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Accept-Language: fr" \\
  -d '{
    "email": "jean@example.com",
    "password": "SecurePass123!",
    "fullName": "Jean Dupont"
  }' \\
  http://localhost:8787/api/users
`,

  // Test validation errors with different languages
  weakPasswordEnglish: `
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Accept-Language: en" \\
  -d '{
    "email": "test@example.com",
    "password": "weak"
  }' \\
  http://localhost:8787/api/users
`,

  weakPasswordSpanish: `
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Accept-Language: es" \\
  -d '{
    "email": "test@example.com",
    "password": "débil"
  }' \\
  http://localhost:8787/api/users
`,

  // Test user not found with different languages
  userNotFoundEnglish: `
curl -H "Accept-Language: en" \\
  http://localhost:8787/api/users/99999
`,

  userNotFoundSpanish: `
curl -H "Accept-Language: es" \\
  http://localhost:8787/api/users/99999
`,

  userNotFoundFrench: `
curl -H "Accept-Language: fr" \\
  http://localhost:8787/api/users/99999
`,

  // Test login with different languages
  invalidLoginEnglish: `
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Accept-Language: en" \\
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpass"
  }' \\
  http://localhost:8787/api/users/login
`,

  invalidLoginSpanish: `
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Accept-Language: es" \\
  -d '{
    "email": "mal@example.com",
    "password": "malpass"
  }' \\
  http://localhost:8787/api/users/login
`,

  // Test 404 error with different languages
  notFoundEnglish: `
curl -H "Accept-Language: en" \\
  http://localhost:8787/api/nonexistent
`,

  notFoundSpanish: `
curl -H "Accept-Language: es" \\
  http://localhost:8787/api/noexiste
`,

  // Test health check with different languages
  healthCheckEnglish: `
curl -H "Accept-Language: en" \\
  http://localhost:8787/health
`,

  healthCheckSpanish: `
curl -H "Accept-Language: es" \\
  http://localhost:8787/health
`,

  healthCheckFrench: `
curl -H "Accept-Language: fr" \\
  http://localhost:8787/health
`,
};

// Expected responses for testing
export const expectedResponses = {
  userCreatedEnglish: {
    success: true,
    data: {
      user: "{ user object }",
      message: "User created successfully",
    },
  },

  userCreatedSpanish: {
    success: true,
    data: {
      user: "{ user object }",
      message: "Usuario creado exitosamente",
    },
  },

  userCreatedFrench: {
    success: true,
    data: {
      user: "{ user object }",
      message: "Utilisateur créé avec succès",
    },
  },

  passwordValidationEnglish: {
    success: false,
    error: {
      code: "PASSWORD_VALIDATION_FAILED",
      message:
        "Password validation failed: Password must be at least 8 characters long, Password must contain at least one uppercase letter, ...",
    },
  },

  passwordValidationSpanish: {
    success: false,
    error: {
      code: "PASSWORD_VALIDATION_FAILED",
      message:
        "Validación de contraseña fallida: La contraseña debe tener al menos 8 caracteres, La contraseña debe contener al menos una letra mayúscula, ...",
    },
  },

  userNotFoundEnglish: {
    success: false,
    error: {
      code: "USER_NOT_FOUND",
      message: "User not found",
    },
  },

  userNotFoundSpanish: {
    success: false,
    error: {
      code: "USER_NOT_FOUND",
      message: "Usuario no encontrado",
    },
  },

  userNotFoundFrench: {
    success: false,
    error: {
      code: "USER_NOT_FOUND",
      message: "Utilisateur non trouvé",
    },
  },

  invalidCredentialsEnglish: {
    success: false,
    error: {
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password",
    },
  },

  invalidCredentialsSpanish: {
    success: false,
    error: {
      code: "INVALID_CREDENTIALS",
      message: "Email o contraseña inválidos",
    },
  },

  notFoundEnglish: {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found: GET http://localhost:8787/api/nonexistent",
      suggestion: "Check the API documentation at /swagger-ui",
    },
  },

  notFoundSpanish: {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint no encontrado: GET http://localhost:8787/api/noexiste",
      suggestion: "Revisa la documentación de la API en /swagger-ui",
    },
  },
};

// Language priority testing
export const languagePriorityTests = {
  // Should use Spanish (highest priority)
  spanishFirst: "Accept-Language: es,en;q=0.9,fr;q=0.8",

  // Should use French (highest priority)
  frenchFirst: "Accept-Language: fr,es;q=0.9,en;q=0.8",

  // Should use English (highest priority)
  englishFirst: "Accept-Language: en,es;q=0.9,fr;q=0.8",

  // Should fallback to English (unsupported language)
  unsupportedLanguage: "Accept-Language: ru,de;q=0.9",

  // Should use English (no header)
  noHeader: undefined,

  // Should use English (empty header)
  emptyHeader: "Accept-Language: ",
};

export default {
  testCommands,
  expectedResponses,
  languagePriorityTests,
};
