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
    passwordResetEmailSent: string;
    passwordResetSuccessful: string;
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
    r2NotConfigured: string;
    cronUnauthorized: string;
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
    dataRequired: string;
    invalidData: string;
    requiresImages: string;
    imageNotFound: string;
    sortOrderInvalid: string;
  };

  // Room type messages
  roomType: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
    slugConflict: string;
    imageNotFound: string;
    noImagesProvided: string;
    sortOrderInvalid: string;
    cannotReplaceAllImages: string;
    cannotDeleteLastImage: string;
    invalidImageType: string;
  };

  // Room messages
  room: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
    roomTypeNotFound: string;
    cannotDeleteWithBooking: string;
  };

  // Content messages
  content: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    blockNotFound: string;
    homepageNotFound: string;
  };

  // Promo code messages
  promoCode: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
  };

  // Customer messages
  customer: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
    invalidId: string;
    invalidPhone: string;
  };

  // Review messages
  review: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
  };

  // Tax and fee messages
  taxFee: {
    created: string;
    updated: string;
    deleted: string;
    retrieved: string;
    listRetrieved: string;
    notFound: string;
  };

  // Availability messages
  availability: {
    retrieved: string;
    hotelIdRequired: string;
    datesRequired: string;
    validationFailed: string;
    fetchFailed: string;
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
    paymentUpdated: string;
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
    updatePaymentFailed: string;
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
    passwordResetEmailSent: "Password reset email sent successfully",
    passwordResetSuccessful: "Password reset successfully",
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
    r2NotConfigured: "R2 storage is not configured",
    cronUnauthorized: "Unauthorized: Invalid cron secret",
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
    dataRequired: "Hotel data is required",
    invalidData: "Invalid hotel data JSON",
    requiresImages:
      "Hotel creation requires images. Please use multipart/form-data with hotelData and images fields",
    imageNotFound: "Image not found",
    sortOrderInvalid: "Sort order must be a number",
  },

  roomType: {
    created: "Room type created successfully",
    updated: "Room type updated successfully",
    deleted: "Room type deleted successfully",
    retrieved: "Room type retrieved successfully",
    listRetrieved: "Room types retrieved successfully",
    notFound: "Room type not found",
    slugConflict: "A room type with this slug already exists",
    imageNotFound: "Image not found",
    noImagesProvided: "No image files provided",
    sortOrderInvalid: "Sort order must be a number",
    cannotReplaceAllImages: "Cannot replace all images at once",
    cannotDeleteLastImage: "Cannot delete the last image",
    invalidImageType: "Invalid image type",
  },

  room: {
    created: "Room created successfully",
    updated: "Room updated successfully",
    deleted: "Room deleted successfully",
    retrieved: "Room retrieved successfully",
    listRetrieved: "Rooms retrieved successfully",
    notFound: "Room not found",
    roomTypeNotFound: "Room type not found",
    cannotDeleteWithBooking:
      "This room cannot be deleted because it is associated with a booking",
  },

  content: {
    created: "Content block created successfully",
    updated: "Content block updated successfully",
    deleted: "Content block deleted successfully",
    retrieved: "Content block retrieved successfully",
    listRetrieved: "Content blocks retrieved successfully",
    blockNotFound: "Content block not found",
    homepageNotFound: "Homepage content not found",
  },

  promoCode: {
    created: "Promo code created successfully",
    updated: "Promo code updated successfully",
    deleted: "Promo code deleted successfully",
    retrieved: "Promo code retrieved successfully",
    listRetrieved: "Promo codes retrieved successfully",
    notFound: "Promo code not found",
  },

  customer: {
    created: "Customer created successfully",
    updated: "Customer updated successfully",
    deleted: "Customer deleted successfully",
    retrieved: "Customer retrieved successfully",
    listRetrieved: "Customers retrieved successfully",
    notFound: "Customer not found",
    invalidId: "Invalid customer ID",
    invalidPhone: "Invalid phone number format",
  },

  review: {
    created: "Review created successfully",
    updated: "Review updated successfully",
    deleted: "Review deleted successfully",
    retrieved: "Review retrieved successfully",
    listRetrieved: "Reviews retrieved successfully",
    notFound: "Review not found",
  },

  taxFee: {
    created: "Tax/fee created successfully",
    updated: "Tax/fee updated successfully",
    deleted: "Tax/fee deleted successfully",
    retrieved: "Tax/fee retrieved successfully",
    listRetrieved: "Taxes/fees retrieved successfully",
    notFound: "Tax/fee not found",
  },

  availability: {
    retrieved: "Availability data retrieved successfully",
    hotelIdRequired: "Hotel ID is required",
    datesRequired: "Check-in and check-out dates are required",
    validationFailed: "Availability validation failed",
    fetchFailed: "Failed to fetch availability",
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
    paymentUpdated: "Payment status updated successfully",
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
    updatePaymentFailed: "Failed to update payment status",
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
    passwordResetEmailSent:
      "Email de restablecimiento de contraseña enviado exitosamente",
    passwordResetSuccessful: "Contraseña restablecida exitosamente",
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
    r2NotConfigured: "El almacenamiento R2 no está configurado",
    cronUnauthorized: "No autorizado: Secreto de cron inválido",
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
    dataRequired: "Se requieren datos del hotel",
    invalidData: "JSON de datos del hotel inválido",
    requiresImages:
      "La creación del hotel requiere imágenes. Por favor use multipart/form-data con los campos hotelData e images",
    imageNotFound: "Imagen no encontrada",
    sortOrderInvalid: "El orden debe ser un número",
  },

  roomType: {
    created: "Tipo de habitación creado exitosamente",
    updated: "Tipo de habitación actualizado exitosamente",
    deleted: "Tipo de habitación eliminado exitosamente",
    retrieved: "Tipo de habitación obtenido exitosamente",
    listRetrieved: "Tipos de habitación obtenidos exitosamente",
    notFound: "Tipo de habitación no encontrado",
    slugConflict: "Ya existe un tipo de habitación con este slug",
    imageNotFound: "Imagen no encontrada",
    noImagesProvided: "No se proporcionaron archivos de imagen",
    sortOrderInvalid: "El orden debe ser un número",
    cannotReplaceAllImages:
      "No se pueden reemplazar todas las imágenes a la vez",
    cannotDeleteLastImage: "No se puede eliminar la última imagen",
    invalidImageType: "Tipo de imagen inválido",
  },

  room: {
    created: "Habitación creada exitosamente",
    updated: "Habitación actualizada exitosamente",
    deleted: "Habitación eliminada exitosamente",
    retrieved: "Habitación obtenida exitosamente",
    listRetrieved: "Habitaciones obtenidas exitosamente",
    notFound: "Habitación no encontrada",
    roomTypeNotFound: "Tipo de habitación no encontrado",
    cannotDeleteWithBooking:
      "Esta habitación no se puede eliminar porque está asociada con una reserva",
  },

  content: {
    created: "Bloque de contenido creado exitosamente",
    updated: "Bloque de contenido actualizado exitosamente",
    deleted: "Bloque de contenido eliminado exitosamente",
    retrieved: "Bloque de contenido obtenido exitosamente",
    listRetrieved: "Bloques de contenido obtenidos exitosamente",
    blockNotFound: "Bloque de contenido no encontrado",
    homepageNotFound: "Contenido de página de inicio no encontrado",
  },

  promoCode: {
    created: "Código promocional creado exitosamente",
    updated: "Código promocional actualizado exitosamente",
    deleted: "Código promocional eliminado exitosamente",
    retrieved: "Código promocional obtenido exitosamente",
    listRetrieved: "Códigos promocionales obtenidos exitosamente",
    notFound: "Código promocional no encontrado",
  },

  customer: {
    created: "Cliente creado exitosamente",
    updated: "Cliente actualizado exitosamente",
    deleted: "Cliente eliminado exitosamente",
    retrieved: "Cliente obtenido exitosamente",
    listRetrieved: "Clientes obtenidos exitosamente",
    notFound: "Cliente no encontrado",
    invalidId: "ID de cliente inválido",
    invalidPhone: "Formato de teléfono inválido",
  },

  review: {
    created: "Reseña creada exitosamente",
    updated: "Reseña actualizada exitosamente",
    deleted: "Reseña eliminada exitosamente",
    retrieved: "Reseña obtenida exitosamente",
    listRetrieved: "Reseñas obtenidas exitosamente",
    notFound: "Reseña no encontrada",
  },

  taxFee: {
    created: "Impuesto/tarifa creado exitosamente",
    updated: "Impuesto/tarifa actualizado exitosamente",
    deleted: "Impuesto/tarifa eliminado exitosamente",
    retrieved: "Impuesto/tarifa obtenido exitosamente",
    listRetrieved: "Impuestos/tarifas obtenidos exitosamente",
    notFound: "Impuesto/tarifa no encontrado",
  },

  availability: {
    retrieved: "Datos de disponibilidad obtenidos exitosamente",
    hotelIdRequired: "Se requiere el ID del hotel",
    datesRequired: "Se requieren las fechas de entrada y salida",
    validationFailed: "Falló la validación de disponibilidad",
    fetchFailed: "Error al obtener disponibilidad",
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
    paymentUpdated: "Estado de pago actualizado exitosamente",
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
    updatePaymentFailed: "Error al actualizar estado de pago",
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
    passwordResetEmailSent:
      "Email de restablecimiento de contraseña enviado exitosamente",
    passwordResetSuccessful: "Mot de passe réinitialisé avec succès",
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
    r2NotConfigured: "Le stockage R2 n'est pas configuré",
    cronUnauthorized: "Non autorisé: Secret de cron invalide",
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
    dataRequired: "Les données de l'hôtel sont requises",
    invalidData: "JSON de données d'hôtel invalide",
    requiresImages:
      "La création d'hôtel nécessite des images. Veuillez utiliser multipart/form-data avec les champs hotelData et images",
    imageNotFound: "Image non trouvée",
    sortOrderInvalid: "L'ordre de tri doit être un nombre",
  },

  roomType: {
    created: "Type de chambre créé avec succès",
    updated: "Type de chambre mis à jour avec succès",
    deleted: "Type de chambre supprimé avec succès",
    retrieved: "Type de chambre récupéré avec succès",
    listRetrieved: "Types de chambre récupérés avec succès",
    notFound: "Type de chambre non trouvé",
    slugConflict: "Un type de chambre avec ce slug existe déjà",
    imageNotFound: "Image non trouvée",
    noImagesProvided: "Aucun fichier image fourni",
    sortOrderInvalid: "L'ordre de tri doit être un nombre",
    cannotReplaceAllImages:
      "Impossible de remplacer toutes les images à la fois",
    cannotDeleteLastImage: "Impossible de supprimer la dernière image",
    invalidImageType: "Type d'image invalide",
  },

  room: {
    created: "Chambre créée avec succès",
    updated: "Chambre mise à jour avec succès",
    deleted: "Chambre supprimée avec succès",
    retrieved: "Chambre récupérée avec succès",
    listRetrieved: "Chambres récupérées avec succès",
    notFound: "Chambre non trouvée",
    roomTypeNotFound: "Type de chambre non trouvé",
    cannotDeleteWithBooking:
      "Cette chambre ne peut pas être supprimée car elle est associée à une réservation",
  },

  content: {
    created: "Bloc de contenu créé avec succès",
    updated: "Bloc de contenu mis à jour avec succès",
    deleted: "Bloc de contenu supprimé avec succès",
    retrieved: "Bloc de contenu récupéré avec succès",
    listRetrieved: "Blocs de contenu récupérés avec succès",
    blockNotFound: "Bloc de contenu non trouvé",
    homepageNotFound: "Contenu de la page d'accueil non trouvé",
  },

  promoCode: {
    created: "Code promo créé avec succès",
    updated: "Code promo mis à jour avec succès",
    deleted: "Code promo supprimé avec succès",
    retrieved: "Code promo récupéré avec succès",
    listRetrieved: "Codes promo récupérés avec succès",
    notFound: "Code promo non trouvé",
  },

  customer: {
    created: "Client créé avec succès",
    updated: "Client mis à jour avec succès",
    deleted: "Client supprimé avec succès",
    retrieved: "Client récupéré avec succès",
    listRetrieved: "Clients récupérés avec succès",
    notFound: "Client non trouvé",
    invalidId: "ID de client invalide",
    invalidPhone: "Format de numéro de téléphone invalide",
  },

  review: {
    created: "Avis créé avec succès",
    updated: "Avis mis à jour avec succès",
    deleted: "Avis supprimé avec succès",
    retrieved: "Avis récupéré avec succès",
    listRetrieved: "Avis récupérés avec succès",
    notFound: "Avis non trouvé",
  },

  taxFee: {
    created: "Taxe/frais créé avec succès",
    updated: "Taxe/frais mis à jour avec succès",
    deleted: "Taxe/frais supprimé avec succès",
    retrieved: "Taxe/frais récupéré avec succès",
    listRetrieved: "Taxes/frais récupérés avec succès",
    notFound: "Taxe/frais non trouvé",
  },

  availability: {
    retrieved: "Données de disponibilité récupérées avec succès",
    hotelIdRequired: "L'ID de l'hôtel est requis",
    datesRequired: "Les dates d'arrivée et de départ sont requises",
    validationFailed: "La validation de disponibilité a échoué",
    fetchFailed: "Échec de la récupération de la disponibilité",
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
    paymentUpdated: "Statut de paiement mis à jour avec succès",
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
    updatePaymentFailed: "Échec de la mise à jour du statut de paiement",
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
      return path; // Return the path as fallback
    }
  }

  if (typeof message !== "string") {
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
