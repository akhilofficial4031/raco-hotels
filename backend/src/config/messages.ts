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

  addonConfiguration: {
    listRetrieved: string;
    notFound: string;
    updated: string;
    deleted: string;
  };

  // Booking management messages
  booking: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
    confirmed: string;
    cancelled: string;
    draftNotFound: string;
    draftConverted: string;
    insufficientInventory: string;
    invalidPromoCode: string;
    promoCodeExpired: string;
    promoCodeUsageLimitReached: string;
    missingGuestInfo: string;
    invalidDateRange: string;
    paymentRequired: string;
    paymentProcessed: string;
    inventoryReserved: string;
    transactionFailed: string;
    pendingRetrieved: string;
    noPendingFound: string;
    expiringSoon: string;
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
    confirmBookingFailed: string;
    convertDraftFailed: string;
    createDraftFailed: string;
    processPaymentFailed: string;
    fetchPendingBookingsFailed: string;
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
    bookingNotFound: string;
    draftNotFound: string;
    insufficientInventory: string;
    invalidPromoCode: string;
    transactionFailed: string;
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

  addonConfiguration: {
    listRetrieved: "Addon configurations retrieved successfully",
    notFound: "Addon configuration not found",
    updated: "Addon configuration updated successfully",
    deleted: "Addon configuration deleted successfully",
  },

  booking: {
    created: "Booking created successfully",
    updated: "Booking updated successfully",
    deleted: "Booking deleted successfully",
    retrieved: "Booking retrieved successfully",
    listRetrieved: "Bookings retrieved successfully",
    notFound: "Booking not found",
    confirmed: "Booking confirmed successfully",
    cancelled: "Booking cancelled successfully",
    draftNotFound: "Booking draft not found",
    draftConverted: "Booking draft converted successfully",
    insufficientInventory: "Insufficient room availability for selected dates",
    invalidPromoCode: "Invalid or inactive promo code",
    promoCodeExpired: "Promo code has expired",
    promoCodeUsageLimitReached: "Promo code usage limit has been reached",
    missingGuestInfo: "Required guest information is missing",
    invalidDateRange: "Invalid check-in or check-out date",
    paymentRequired: "Payment is required to confirm booking",
    paymentProcessed: "Payment processed successfully",
    inventoryReserved: "Room inventory reserved successfully",
    transactionFailed: "Transaction failed, please try again",
    pendingRetrieved: "Pending bookings retrieved successfully",
    noPendingFound: "No pending bookings found",
    expiringSoon: "This booking draft is expiring soon",
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
    confirmBookingFailed: "Failed to confirm booking",
    convertDraftFailed: "Failed to convert booking draft",
    createDraftFailed: "Failed to create booking draft",
    processPaymentFailed: "Failed to process payment",
    fetchPendingBookingsFailed: "Failed to fetch pending bookings",
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
    bookingNotFound: "BOOKING_NOT_FOUND",
    draftNotFound: "DRAFT_NOT_FOUND",
    insufficientInventory: "INSUFFICIENT_INVENTORY",
    invalidPromoCode: "INVALID_PROMO_CODE",
    transactionFailed: "TRANSACTION_FAILED",
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

  addonConfiguration: {
    listRetrieved: "Configuraciones de complementos obtenidas exitosamente",
    notFound: "Configuración de complemento no encontrada",
    updated: "Configuración de complemento actualizada exitosamente",
    deleted: "Configuración de complemento eliminada exitosamente",
  },

  booking: {
    created: "Reserva creada exitosamente",
    updated: "Reserva actualizada exitosamente",
    deleted: "Reserva eliminada exitosamente",
    retrieved: "Reserva obtenida exitosamente",
    listRetrieved: "Reservas obtenidas exitosamente",
    notFound: "Reserva no encontrada",
    confirmed: "Reserva confirmada exitosamente",
    cancelled: "Reserva cancelada exitosamente",
    draftNotFound: "Borrador de reserva no encontrado",
    draftConverted: "Borrador de reserva convertido exitosamente",
    insufficientInventory:
      "Disponibilidad insuficiente para las fechas seleccionadas",
    invalidPromoCode: "Código promocional inválido o inactivo",
    promoCodeExpired: "El código promocional ha expirado",
    promoCodeUsageLimitReached:
      "Se ha alcanzado el límite de uso del código promocional",
    missingGuestInfo: "Información requerida del huésped faltante",
    invalidDateRange: "Fecha de entrada o salida inválida",
    paymentRequired: "Se requiere pago para confirmar la reserva",
    paymentProcessed: "Pago procesado exitosamente",
    inventoryReserved: "Inventario de habitaciones reservado exitosamente",
    transactionFailed: "Transacción fallida, por favor inténtelo de nuevo",
    pendingRetrieved: "Reservas pendientes obtenidas exitosamente",
    noPendingFound: "No se encontraron reservas pendientes",
    expiringSoon: "Esta reserva está próxima a expirar",
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
    confirmBookingFailed: "Error al confirmar reserva",
    convertDraftFailed: "Error al convertir borrador de reserva",
    createDraftFailed: "Error al crear borrador de reserva",
    processPaymentFailed: "Error al procesar pago",
    fetchPendingBookingsFailed: "Error al obtener reservas pendientes",
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
    bookingNotFound: "BOOKING_NOT_FOUND",
    draftNotFound: "DRAFT_NOT_FOUND",
    insufficientInventory: "INSUFFICIENT_INVENTORY",
    invalidPromoCode: "INVALID_PROMO_CODE",
    transactionFailed: "TRANSACTION_FAILED",
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

  addonConfiguration: {
    listRetrieved: "Configurations d'addons récupérées avec succès",
    notFound: "Configuration d'addon non trouvée",
    updated: "Configuration d'addon mise à jour avec succès",
    deleted: "Configuration d'addon supprimée avec succès",
  },

  booking: {
    created: "Réservation créée avec succès",
    updated: "Réservation mise à jour avec succès",
    deleted: "Réservation supprimée avec succès",
    retrieved: "Réservation récupérée avec succès",
    listRetrieved: "Réservations récupérées avec succès",
    notFound: "Réservation non trouvée",
    confirmed: "Réservation confirmée avec succès",
    cancelled: "Réservation annulée avec succès",
    draftNotFound: "Brouillon de réservation non trouvé",
    draftConverted: "Brouillon de réservation converti avec succès",
    insufficientInventory:
      "Disponibilité insuffisante pour les dates sélectionnées",
    invalidPromoCode: "Code promo invalide ou inactif",
    promoCodeExpired: "Le code promo a expiré",
    promoCodeUsageLimitReached:
      "La limite d'utilisation du code promo a été atteinte",
    missingGuestInfo: "Informations client requises manquantes",
    invalidDateRange: "Date d'arrivée ou de départ invalide",
    paymentRequired: "Paiement requis pour confirmer la réservation",
    paymentProcessed: "Paiement traité avec succès",
    inventoryReserved: "Inventaire des chambres réservé avec succès",
    transactionFailed: "Transaction échouée, veuillez réessayer",
    pendingRetrieved: "Réservations en attente récupérées avec succès",
    noPendingFound: "Aucune réservation en attente trouvée",
    expiringSoon: "Cette réservation est proche de l'expiration",
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
    confirmBookingFailed: "Échec de la confirmation de réservation",
    convertDraftFailed: "Échec de la conversion du brouillon de réservation",
    createDraftFailed: "Échec de la création du brouillon de réservation",
    processPaymentFailed: "Échec du traitement du paiement",
    fetchPendingBookingsFailed:
      "Échec de la récupération des réservations en attente",
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
    bookingNotFound: "BOOKING_NOT_FOUND",
    draftNotFound: "DRAFT_NOT_FOUND",
    insufficientInventory: "INSUFFICIENT_INVENTORY",
    invalidPromoCode: "INVALID_PROMO_CODE",
    transactionFailed: "TRANSACTION_FAILED",
  },
};

// Spanish messages (simplified for now - using English fallbacks for booking)
const esMessagesComplete: Messages = {
  ...esMessages,
  booking: enMessages.booking,
  operation: {
    ...esMessages.operation,
    confirmBookingFailed: "Failed to confirm booking",
    convertDraftFailed: "Failed to convert booking draft",
    createDraftFailed: "Failed to create booking draft",
    processPaymentFailed: "Failed to process payment",
  },
  errorCodes: {
    ...esMessages.errorCodes,
    bookingNotFound: "BOOKING_NOT_FOUND",
    draftNotFound: "DRAFT_NOT_FOUND",
    insufficientInventory: "INSUFFICIENT_INVENTORY",
    invalidPromoCode: "INVALID_PROMO_CODE",
    transactionFailed: "TRANSACTION_FAILED",
  },
};

// French messages (simplified for now - using English fallbacks for booking)
const frMessagesComplete: Messages = {
  ...frMessages,
  booking: enMessages.booking,
  operation: {
    ...frMessages.operation,
    confirmBookingFailed: "Failed to confirm booking",
    convertDraftFailed: "Failed to convert booking draft",
    createDraftFailed: "Failed to create booking draft",
    processPaymentFailed: "Failed to process payment",
  },
  errorCodes: {
    ...frMessages.errorCodes,
    bookingNotFound: "BOOKING_NOT_FOUND",
    draftNotFound: "DRAFT_NOT_FOUND",
    insufficientInventory: "INSUFFICIENT_INVENTORY",
    invalidPromoCode: "INVALID_PROMO_CODE",
    transactionFailed: "TRANSACTION_FAILED",
  },
};

// Message collections by locale
const messageCollections: Record<SupportedLocale, Messages> = {
  en: enMessages,
  es: esMessagesComplete,
  fr: frMessagesComplete,
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
