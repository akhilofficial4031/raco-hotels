// Supported locales
export type SupportedLocale = "en" | "es" | "fr" | "de" | "ja" | "zh";

// Message structure interface
export interface Messages {
  // User management messages
  user: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
    alreadyExists: string;
    lastAdminError: string;
    accountDisabled: string;
    passwordChanged: string;
    loginSuccessful: string;
    invalidCredentials: string;
    invalidCurrentPassword: string;
    statsRetrieved: string;
  };

  // Authentication messages
  auth: {
    unauthorized: string;
    forbidden: string;
    tokenRequired: string;
    invalidToken: string;
    sessionExpired: string;
    refreshTokenMissing: string;
    invalidRefreshToken: string;
    tokenRefreshed: string;
    userNotFound: string;
    verified: string;
    allSessionsRevoked: string;
  };

  // Password validation messages
  password: {
    tooShort: string;
    tooLong: string;
    missingUppercase: string;
    missingLowercase: string;
    missingNumber: string;
    missingSpecialChar: string;
    validationFailed: string;
  };

  // System messages
  system: {
    healthy: string;
    operationFailed: string;
    internalError: string;
    unexpectedError: string;
    resourceNotFound: string;
    resourceConflict: string;
    validationError: string;
    notFoundEndpoint: string;
    checkDocumentation: string;
  };

  // Service information
  service: {
    name: string;
    version: string;
    framework: string;
    documentation: string;
    openapi: string;
  };

  // Hotel management messages
  hotel: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
  };

  // Operation messages
  operation: {
    fetchUsersFailed: string;
    fetchUserFailed: string;
    createUserFailed: string;
    updateUserFailed: string;
    deleteUserFailed: string;
    toggleStatusFailed: string;
    searchUsersFailed: string;
    fetchStatsFailed: string;
    authenticateUserFailed: string;
    changePasswordFailed: string;
    healthCheckFailed: string;
    logoutUserFailed: string;
    refreshTokenFailed: string;
    revokeAllSessionsFailed: string;
    verifyAuthFailed: string;
  };

  // Validation messages
  validation: {
    invalidEmail: string;
    invalidPhone: string;
    invalidRole: string;
    invalidStatus: string;
    invalidPagination: string;
  };

  // Error codes
  errorCodes: {
    userNotFound: string;
    userAlreadyExists: string;
    invalidCredentials: string;
    unauthorizedAccess: string;
    accountDisabled: string;
    passwordValidationFailed: string;
    invalidCurrentPassword: string;
    validationError: string;
    internalError: string;
    notFound: string;
  };
}

// English messages (default)
const enMessages: Messages = {
  user: {
    created: "User created successfully",
    updated: "User updated successfully",
    deleted: "User deleted successfully",
    retrieved: "User retrieved successfully",
    listRetrieved: "Users retrieved successfully",
    notFound: "User not found",
    alreadyExists: "User with this email already exists",
    lastAdminError: "Cannot delete the last admin user",
    accountDisabled: "User account is disabled",
    passwordChanged: "Password changed successfully",
    loginSuccessful: "Login successful",
    invalidCredentials: "Invalid email or password",
    invalidCurrentPassword: "Current password is incorrect",
    statsRetrieved: "User statistics retrieved successfully",
  },

  auth: {
    unauthorized: "Unauthorized access",
    forbidden: "Forbidden",
    tokenRequired: "Authentication token required",
    invalidToken: "Invalid authentication token",
    sessionExpired: "Session has expired",
    refreshTokenMissing: "Refresh token missing",
    invalidRefreshToken: "Invalid or expired refresh token",
    tokenRefreshed: "Token refreshed successfully",
    userNotFound: "User not found",
    verified: "Authentication verified",
    allSessionsRevoked: "All sessions revoked successfully",
  },

  password: {
    tooShort: "Password must be at least 8 characters long",
    tooLong: "Password must be less than 128 characters long",
    missingUppercase: "Password must contain at least one uppercase letter",
    missingLowercase: "Password must contain at least one lowercase letter",
    missingNumber: "Password must contain at least one number",
    missingSpecialChar: "Password must contain at least one special character",
    validationFailed: "Password validation failed",
  },

  system: {
    healthy: "healthy",
    operationFailed: "Operation failed",
    internalError: "Internal server error",
    unexpectedError: "An unexpected error occurred",
    resourceNotFound: "Resource not found",
    resourceConflict: "Resource conflict",
    validationError: "Validation error",
    notFoundEndpoint: "Endpoint not found",
    checkDocumentation: "Check the API documentation at /swagger-ui",
  },

  service: {
    name: "raco-hotels-backend",
    version: "1.0.0",
    framework: "hono",
    documentation: "/swagger-ui",
    openapi: "/openapi.json",
  },

  hotel: {
    created: "Hotel created successfully",
    updated: "Hotel updated successfully",
    deleted: "Hotel deleted successfully",
    retrieved: "Hotel retrieved successfully",
    listRetrieved: "Hotels retrieved successfully",
    notFound: "Hotel not found",
  },

  operation: {
    fetchUsersFailed: "Failed to fetch users",
    fetchUserFailed: "Failed to fetch user",
    createUserFailed: "Failed to create user",
    updateUserFailed: "Failed to update user",
    deleteUserFailed: "Failed to delete user",
    toggleStatusFailed: "Failed to toggle user status",
    searchUsersFailed: "Failed to search users",
    fetchStatsFailed: "Failed to fetch user statistics",
    authenticateUserFailed: "Failed to authenticate user",
    changePasswordFailed: "Failed to change password",
    healthCheckFailed: "Health check failed",
    logoutUserFailed: "Failed to logout user",
    refreshTokenFailed: "Failed to refresh token",
    revokeAllSessionsFailed: "Failed to revoke all sessions",
    verifyAuthFailed: "Failed to verify authentication",
  },

  validation: {
    invalidEmail: "Invalid email format",
    invalidPhone: "Invalid phone number format",
    invalidRole: "Invalid user role",
    invalidStatus: "Invalid user status",
    invalidPagination: "Invalid pagination parameters",
  },

  errorCodes: {
    userNotFound: "USER_NOT_FOUND",
    userAlreadyExists: "USER_ALREADY_EXISTS",
    invalidCredentials: "INVALID_CREDENTIALS",
    unauthorizedAccess: "UNAUTHORIZED_ACCESS",
    accountDisabled: "ACCOUNT_DISABLED",
    passwordValidationFailed: "PASSWORD_VALIDATION_FAILED",
    invalidCurrentPassword: "INVALID_CURRENT_PASSWORD",
    validationError: "VALIDATION_ERROR",
    internalError: "INTERNAL_ERROR",
    notFound: "NOT_FOUND",
  },
};

// Spanish messages
const esMessages: Messages = {
  user: {
    created: "Usuario creado exitosamente",
    updated: "Usuario actualizado exitosamente",
    deleted: "Usuario eliminado exitosamente",
    retrieved: "Usuario obtenido exitosamente",
    listRetrieved: "Usuarios obtenidos exitosamente",
    notFound: "Usuario no encontrado",
    alreadyExists: "Ya existe un usuario con este email",
    lastAdminError: "No se puede eliminar el último usuario administrador",
    accountDisabled: "La cuenta de usuario está deshabilitada",
    passwordChanged: "Contraseña cambiada exitosamente",
    loginSuccessful: "Inicio de sesión exitoso",
    invalidCredentials: "Email o contraseña inválidos",
    invalidCurrentPassword: "La contraseña actual es incorrecta",
    statsRetrieved: "Estadísticas de usuario obtenidas exitosamente",
  },

  auth: {
    unauthorized: "Acceso no autorizado",
    forbidden: "Prohibido",
    tokenRequired: "Token de autenticación requerido",
    invalidToken: "Token de autenticación inválido",
    sessionExpired: "La sesión ha expirado",
    refreshTokenMissing: "Token de actualización faltante",
    invalidRefreshToken: "Token de actualización inválido o expirado",
    tokenRefreshed: "Token actualizado exitosamente",
    userNotFound: "Usuario no encontrado",
    verified: "Autenticación verificada",
    allSessionsRevoked: "Todas las sesiones revocadas exitosamente",
  },

  password: {
    tooShort: "La contraseña debe tener al menos 8 caracteres",
    tooLong: "La contraseña debe tener menos de 128 caracteres",
    missingUppercase:
      "La contraseña debe contener al menos una letra mayúscula",
    missingLowercase:
      "La contraseña debe contener al menos una letra minúscula",
    missingNumber: "La contraseña debe contener al menos un número",
    missingSpecialChar:
      "La contraseña debe contener al menos un carácter especial",
    validationFailed: "Validación de contraseña fallida",
  },

  system: {
    healthy: "saludable",
    operationFailed: "Operación fallida",
    internalError: "Error interno del servidor",
    unexpectedError: "Ocurrió un error inesperado",
    resourceNotFound: "Recurso no encontrado",
    resourceConflict: "Conflicto de recursos",
    validationError: "Error de validación",
    notFoundEndpoint: "Endpoint no encontrado",
    checkDocumentation: "Revisa la documentación de la API en /swagger-ui",
  },

  service: {
    name: "raco-hotels-backend",
    version: "1.0.0",
    framework: "hono",
    documentation: "/swagger-ui",
    openapi: "/openapi.json",
  },

  hotel: {
    created: "Hotel creado exitosamente",
    updated: "Hotel actualizado exitosamente",
    deleted: "Hotel eliminado exitosamente",
    retrieved: "Hotel obtenido exitosamente",
    listRetrieved: "Hoteles obtenidos exitosamente",
    notFound: "Hotel no encontrado",
  },

  operation: {
    fetchUsersFailed: "Error al obtener usuarios",
    fetchUserFailed: "Error al obtener usuario",
    createUserFailed: "Error al crear usuario",
    updateUserFailed: "Error al actualizar usuario",
    deleteUserFailed: "Error al eliminar usuario",
    toggleStatusFailed: "Error al cambiar estado del usuario",
    searchUsersFailed: "Error al buscar usuarios",
    fetchStatsFailed: "Error al obtener estadísticas de usuario",
    authenticateUserFailed: "Error al autenticar usuario",
    changePasswordFailed: "Error al cambiar contraseña",
    healthCheckFailed: "Error en verificación de salud",
    logoutUserFailed: "Error al cerrar sesión",
    refreshTokenFailed: "Error al actualizar token",
    revokeAllSessionsFailed: "Error al revocar todas las sesiones",
    verifyAuthFailed: "Error al verificar autenticación",
  },

  validation: {
    invalidEmail: "Formato de email inválido",
    invalidPhone: "Formato de teléfono inválido",
    invalidRole: "Rol de usuario inválido",
    invalidStatus: "Estado de usuario inválido",
    invalidPagination: "Parámetros de paginación inválidos",
  },

  errorCodes: {
    userNotFound: "USER_NOT_FOUND",
    userAlreadyExists: "USER_ALREADY_EXISTS",
    invalidCredentials: "INVALID_CREDENTIALS",
    unauthorizedAccess: "UNAUTHORIZED_ACCESS",
    accountDisabled: "ACCOUNT_DISABLED",
    passwordValidationFailed: "PASSWORD_VALIDATION_FAILED",
    invalidCurrentPassword: "INVALID_CURRENT_PASSWORD",
    validationError: "VALIDATION_ERROR",
    internalError: "INTERNAL_ERROR",
    notFound: "NOT_FOUND",
  },
};

// French messages
const frMessages: Messages = {
  user: {
    created: "Utilisateur créé avec succès",
    updated: "Utilisateur mis à jour avec succès",
    deleted: "Utilisateur supprimé avec succès",
    retrieved: "Utilisateur récupéré avec succès",
    listRetrieved: "Utilisateurs récupérés avec succès",
    notFound: "Utilisateur non trouvé",
    alreadyExists: "Un utilisateur avec cet email existe déjà",
    lastAdminError:
      "Impossible de supprimer le dernier utilisateur administrateur",
    accountDisabled: "Le compte utilisateur est désactivé",
    passwordChanged: "Mot de passe modifié avec succès",
    loginSuccessful: "Connexion réussie",
    invalidCredentials: "Email ou mot de passe invalide",
    invalidCurrentPassword: "Le mot de passe actuel est incorrect",
    statsRetrieved: "Statistiques utilisateur récupérées avec succès",
  },

  auth: {
    unauthorized: "Accès non autorisé",
    forbidden: "Interdit",
    tokenRequired: "Token d'authentification requis",
    invalidToken: "Token d'authentification invalide",
    sessionExpired: "La session a expiré",
    refreshTokenMissing: "Token de rafraîchissement manquant",
    invalidRefreshToken: "Token de rafraîchissement invalide ou expiré",
    tokenRefreshed: "Token rafraîchi avec succès",
    userNotFound: "Utilisateur non trouvé",
    verified: "Authentification vérifiée",
    allSessionsRevoked: "Toutes les sessions révoquées avec succès",
  },

  password: {
    tooShort: "Le mot de passe doit contenir au moins 8 caractères",
    tooLong: "Le mot de passe doit contenir moins de 128 caractères",
    missingUppercase:
      "Le mot de passe doit contenir au moins une lettre majuscule",
    missingLowercase:
      "Le mot de passe doit contenir au moins une lettre minuscule",
    missingNumber: "Le mot de passe doit contenir au moins un chiffre",
    missingSpecialChar:
      "Le mot de passe doit contenir au moins un caractère spécial",
    validationFailed: "Validation du mot de passe échouée",
  },

  system: {
    healthy: "en bonne santé",
    operationFailed: "Opération échouée",
    internalError: "Erreur interne du serveur",
    unexpectedError: "Une erreur inattendue s'est produite",
    resourceNotFound: "Ressource non trouvée",
    resourceConflict: "Conflit de ressources",
    validationError: "Erreur de validation",
    notFoundEndpoint: "Point de terminaison non trouvé",
    checkDocumentation: "Consultez la documentation de l'API à /swagger-ui",
  },

  service: {
    name: "raco-hotels-backend",
    version: "1.0.0",
    framework: "hono",
    documentation: "/swagger-ui",
    openapi: "/openapi.json",
  },

  hotel: {
    created: "Hôtel créé avec succès",
    updated: "Hôtel mis à jour avec succès",
    deleted: "Hôtel supprimé avec succès",
    retrieved: "Hôtel récupéré avec succès",
    listRetrieved: "Hôtels récupérés avec succès",
    notFound: "Hôtel non trouvé",
  },

  operation: {
    fetchUsersFailed: "Échec de la récupération des utilisateurs",
    fetchUserFailed: "Échec de la récupération de l'utilisateur",
    createUserFailed: "Échec de la création de l'utilisateur",
    updateUserFailed: "Échec de la mise à jour de l'utilisateur",
    deleteUserFailed: "Échec de la suppression de l'utilisateur",
    toggleStatusFailed: "Échec du changement de statut de l'utilisateur",
    searchUsersFailed: "Échec de la recherche d'utilisateurs",
    fetchStatsFailed: "Échec de la récupération des statistiques utilisateur",
    authenticateUserFailed: "Échec de l'authentification de l'utilisateur",
    changePasswordFailed: "Échec du changement de mot de passe",
    healthCheckFailed: "Échec de la vérification de santé",
    logoutUserFailed: "Échec de la déconnexion",
    refreshTokenFailed: "Échec du rafraîchissement du token",
    revokeAllSessionsFailed: "Échec de la révocation de toutes les sessions",
    verifyAuthFailed: "Échec de la vérification de l'authentification",
  },

  validation: {
    invalidEmail: "Format d'email invalide",
    invalidPhone: "Format de téléphone invalide",
    invalidRole: "Rôle utilisateur invalide",
    invalidStatus: "Statut utilisateur invalide",
    invalidPagination: "Paramètres de pagination invalides",
  },

  errorCodes: {
    userNotFound: "USER_NOT_FOUND",
    userAlreadyExists: "USER_ALREADY_EXISTS",
    invalidCredentials: "INVALID_CREDENTIALS",
    unauthorizedAccess: "UNAUTHORIZED_ACCESS",
    accountDisabled: "ACCOUNT_DISABLED",
    passwordValidationFailed: "PASSWORD_VALIDATION_FAILED",
    invalidCurrentPassword: "INVALID_CURRENT_PASSWORD",
    validationError: "VALIDATION_ERROR",
    internalError: "INTERNAL_ERROR",
    notFound: "NOT_FOUND",
  },
};

// Message collections by locale
const messageCollections: Record<SupportedLocale, Messages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  de: enMessages, // Fallback to English for now
  ja: enMessages, // Fallback to English for now
  zh: enMessages, // Fallback to English for now
};

// Default locale
export const DEFAULT_LOCALE: SupportedLocale = "en";

// Get messages for a specific locale
export function getMessages(
  locale: SupportedLocale = DEFAULT_LOCALE,
): Messages {
  return messageCollections[locale] || messageCollections[DEFAULT_LOCALE];
}

// Get a specific message by path
export function getMessage(
  path: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
  interpolations?: Record<string, string>,
): string {
  const messages = getMessages(locale);
  const keys = path.split(".");

  let message: any = messages;
  for (const key of keys) {
    message = message?.[key];
    if (message === undefined) {
      console.warn(`Message not found for path: ${path}, locale: ${locale}`);
      return path; // Return the path as fallback
    }
  }

  if (typeof message !== "string") {
    console.warn(
      `Message at path ${path} is not a string for locale: ${locale}`,
    );
    return path;
  }

  // Simple interpolation support
  if (interpolations) {
    let interpolatedMessage = message;
    Object.entries(interpolations).forEach(([key, value]) => {
      interpolatedMessage = interpolatedMessage.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        value,
      );
    });
    return interpolatedMessage;
  }

  return message;
}

// Helper function to detect locale from Accept-Language header
export function detectLocale(acceptLanguageHeader?: string): SupportedLocale {
  if (!acceptLanguageHeader) {
    return DEFAULT_LOCALE;
  }

  // Parse Accept-Language header (simplified)
  const languages = acceptLanguageHeader
    .split(",")
    .map((lang) => lang.trim().split(";")[0].toLowerCase())
    .map((lang) => lang.split("-")[0]); // Take only language code, ignore region

  for (const lang of languages) {
    if (Object.keys(messageCollections).includes(lang as SupportedLocale)) {
      return lang as SupportedLocale;
    }
  }

  return DEFAULT_LOCALE;
}

// Export the default messages for direct access
export { enMessages as defaultMessages };
export default messageCollections;
