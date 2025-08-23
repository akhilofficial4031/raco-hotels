import { type Context } from "hono";

import { HTTP_STATUS, ERROR_CODES } from "../constants";
import {
  getI18n,
  createLocalizedResponse,
  createLocalizedError,
} from "../utils/i18n";

import type { ApiSuccessResponse, ApiErrorResponse } from "../types";

// Generic API response builder
export class ApiResponse {
  static success<T>(
    c: Context,
    data: T,
    message?: string,
    statusCode: number = HTTP_STATUS.OK,
  ) {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };
    return c.json(response, statusCode as any);
  }

  static created<T>(c: Context, data: T, message?: string) {
    return this.success(c, data, message, HTTP_STATUS.CREATED);
  }

  static error(
    c: Context,
    code: string,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: any,
  ) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    };
    return c.json(response, statusCode as any);
  }

  static badRequest(c: Context, message: string, details?: any) {
    return this.error(
      c,
      ERROR_CODES.VALIDATION_ERROR,
      message,
      HTTP_STATUS.BAD_REQUEST,
      details,
    );
  }

  static unauthorized(c: Context, message: string = "Unauthorized access") {
    return this.error(
      c,
      ERROR_CODES.UNAUTHORIZED_ACCESS,
      message,
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  static forbidden(c: Context, message: string = "Forbidden") {
    return this.error(
      c,
      ERROR_CODES.UNAUTHORIZED_ACCESS,
      message,
      HTTP_STATUS.FORBIDDEN,
    );
  }

  static notFound(c: Context, message: string = "Resource not found") {
    return this.error(
      c,
      ERROR_CODES.USER_NOT_FOUND,
      message,
      HTTP_STATUS.NOT_FOUND,
    );
  }

  static conflict(c: Context, message: string = "Resource conflict") {
    return this.error(
      c,
      ERROR_CODES.USER_ALREADY_EXISTS,
      message,
      HTTP_STATUS.CONFLICT,
    );
  }

  static internalError(c: Context, message: string = "Internal server error") {
    return this.error(
      c,
      ERROR_CODES.INTERNAL_ERROR,
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
}

// User-specific response helpers
export class UserResponse {
  static userNotFound(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.userNotFound",
      "user.notFound",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  static userAlreadyExists(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.userAlreadyExists",
      "user.alreadyExists",
      HTTP_STATUS.CONFLICT,
    );
  }

  static userCreated(c: Context, user: any) {
    return createLocalizedResponse(
      c,
      { user },
      "user.created",
      HTTP_STATUS.CREATED,
    );
  }

  static userUpdated(c: Context, user: any) {
    return createLocalizedResponse(c, { user }, "user.updated");
  }

  static userDeleted(c: Context) {
    return createLocalizedResponse(c, {}, "user.deleted");
  }

  static usersList(c: Context, users: any[], pagination?: any) {
    return createLocalizedResponse(
      c,
      {
        users,
        ...(pagination && { pagination }),
      },
      "user.listRetrieved",
    );
  }

  static userRetrieved(c: Context, user: any) {
    return createLocalizedResponse(c, { user }, "user.retrieved");
  }

  static loginSuccessful(
    c: Context,
    user: any,
    tokenInfo: { csrfToken: string; expiresIn: number },
  ) {
    return createLocalizedResponse(
      c,
      { user, ...tokenInfo },
      "user.loginSuccessful",
    );
  }

  static invalidCredentials(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.invalidCredentials",
      "user.invalidCredentials",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  static accountDisabled(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.accountDisabled",
      "user.accountDisabled",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  static passwordChanged(c: Context) {
    return createLocalizedResponse(c, {}, "user.passwordChanged");
  }

  static invalidCurrentPassword(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.invalidCurrentPassword",
      "user.invalidCurrentPassword",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  static passwordValidationFailed(c: Context, details: string) {
    return createLocalizedError(
      c,
      "errorCodes.passwordValidationFailed",
      "password.validationFailed",
      HTTP_STATUS.BAD_REQUEST,
      { details },
    );
  }
}

// Hotel-specific response helpers
export class HotelResponse {
  static hotelNotFound(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.notFound",
      "hotel.notFound",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  static hotelCreated(c: Context, hotel: any) {
    return createLocalizedResponse(
      c,
      { hotel },
      "hotel.created",
      HTTP_STATUS.CREATED,
    );
  }

  static hotelUpdated(c: Context, hotel: any) {
    return createLocalizedResponse(c, { hotel }, "hotel.updated");
  }

  static hotelDeleted(c: Context) {
    return createLocalizedResponse(c, {}, "hotel.deleted");
  }

  static hotelRetrieved(c: Context, hotel: any) {
    return createLocalizedResponse(c, { hotel }, "hotel.retrieved");
  }

  static hotelsList(c: Context, hotels: any[], pagination?: any) {
    return createLocalizedResponse(
      c,
      { hotels, ...(pagination && { pagination }) },
      "hotel.listRetrieved",
    );
  }

  // Hotel with images responses
  static hotelWithImagesRetrieved(c: Context, hotel: any, images: any[]) {
    return createLocalizedResponse(
      c,
      { hotel: { ...hotel, images } },
      "hotel.retrievedWithImages",
    );
  }

  static hotelWithImagesCreated(c: Context, hotel: any, images: any[]) {
    return createLocalizedResponse(
      c,
      { hotel: { ...hotel, images } },
      "hotel.createdWithImages",
      HTTP_STATUS.CREATED,
    );
  }

  static hotelWithImagesUpdated(c: Context, hotel: any, images: any[]) {
    return createLocalizedResponse(
      c,
      { hotel: { ...hotel, images } },
      "hotel.updatedWithImages",
    );
  }

  // Hotel with all relations response
  static hotelWithAllRelationsRetrieved(c: Context, hotel: any) {
    return createLocalizedResponse(
      c,
      { hotel },
      "hotel.retrievedWithAllRelations",
    );
  }

  // Hotel image responses
  static hotelImageAdded(c: Context, image: any) {
    return createLocalizedResponse(
      c,
      { image },
      "hotel.imageAdded",
      HTTP_STATUS.CREATED,
    );
  }

  static hotelImageUpdated(c: Context, image: any) {
    return createLocalizedResponse(c, { image }, "hotel.imageUpdated");
  }

  static hotelImageDeleted(c: Context) {
    return createLocalizedResponse(c, {}, "hotel.imageDeleted");
  }

  static hotelImagesRetrieved(c: Context, images: any[]) {
    return createLocalizedResponse(c, { images }, "hotel.imagesRetrieved");
  }
}

// Amenity-specific response helpers

export class AmenityResponse {
  static amenityNotFound(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.notFound",
      "amenity.notFound",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  static amenityCreated(c: Context, amenity: any) {
    return createLocalizedResponse(
      c,
      { amenity },
      "amenity.created",
      HTTP_STATUS.CREATED,
    );
  }

  static amenityUpdated(c: Context, amenity: any) {
    return createLocalizedResponse(c, { amenity }, "amenity.updated");
  }

  static amenityDeleted(c: Context) {
    return createLocalizedResponse(c, {}, "amenity.deleted");
  }

  static amenityRetrieved(c: Context, amenity: any) {
    return createLocalizedResponse(c, { amenity }, "amenity.retrieved");
  }

  static amenitiesList(c: Context, amenities: any[], pagination?: any) {
    return createLocalizedResponse(
      c,
      { amenities, ...(pagination && { pagination }) },
      "amenity.listRetrieved",
    );
  }
}

// Feature-specific response helpers

export class FeatureResponse {
  static featureNotFound(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.notFound",
      "feature.notFound",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  static featureCreated(c: Context, feature: any) {
    return createLocalizedResponse(
      c,
      { feature },
      "feature.created",
      HTTP_STATUS.CREATED,
    );
  }

  static featureUpdated(c: Context, feature: any) {
    return createLocalizedResponse(c, { feature }, "feature.updated");
  }

  static featureDeleted(c: Context) {
    return createLocalizedResponse(c, {}, "feature.deleted");
  }

  static featureRetrieved(c: Context, feature: any) {
    return createLocalizedResponse(c, { feature }, "feature.retrieved");
  }

  static featuresList(c: Context, features: any[], pagination?: any) {
    return createLocalizedResponse(
      c,
      { features, ...(pagination && { pagination }) },
      "feature.listRetrieved",
    );
  }
}

// Addon-specific response helpers
export class AddonResponse {
  static addonNotFound(c: Context) {
    return createLocalizedError(
      c,
      "errorCodes.notFound",
      "addon.notFound",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  static addonCreated(c: Context, addon: any) {
    return createLocalizedResponse(
      c,
      { addon },
      "addon.created",
      HTTP_STATUS.CREATED,
    );
  }

  static addonUpdated(c: Context, addon: any) {
    return createLocalizedResponse(c, { addon }, "addon.updated");
  }

  static addonDeleted(c: Context) {
    return createLocalizedResponse(c, {}, "addon.deleted");
  }

  static addonRetrieved(c: Context, addon: any) {
    return createLocalizedResponse(c, { addon }, "addon.retrieved");
  }

  static addonsList(c: Context, addons: any[], pagination?: any) {
    return createLocalizedResponse(
      c,
      { addons, ...(pagination && { pagination }) },
      "addon.listRetrieved",
    );
  }
}

// Async route handler wrapper for error handling
export async function handleAsyncRoute(
  c: Context,
  handler: () => Promise<Response>,
  errorMessageKey: string = "system.operationFailed",
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    const { t } = getI18n(c);
    const errorMessage = t(errorMessageKey);

    console.error(`[${new Date().toISOString()}] ${errorMessage}:`, error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("validation")) {
      return createLocalizedError(
        c,
        "errorCodes.validationError",
        "system.validationError",
        HTTP_STATUS.BAD_REQUEST,
        { details: error.message },
      );
    }

    return createLocalizedError(
      c,
      "errorCodes.internalError",
      errorMessageKey,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
}

// Health check response
export class SystemResponse {
  static healthCheck(c: Context) {
    const { t, messages } = getI18n(c);
    return createLocalizedResponse(
      c,
      {
        status: t("system.healthy"),
        timestamp: new Date().toISOString(),
        service: messages.service.name,
      },
      "system.healthy",
    );
  }

  static apiInfo(c: Context) {
    const { messages } = getI18n(c);
    return createLocalizedResponse(
      c,
      {
        service: messages.service.name,
        version: messages.service.version,
        framework: messages.service.framework,
        documentation: messages.service.documentation,
        openapi: messages.service.openapi,
      },
      "system.healthy",
    );
  }
}
