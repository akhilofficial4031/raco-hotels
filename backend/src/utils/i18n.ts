import type { Context } from "hono";
import {
  getMessages,
  getMessage,
  detectLocale,
  type SupportedLocale,
  DEFAULT_LOCALE,
} from "../config/messages";

// Extended context interface with i18n support
export interface I18nContext {
  locale: SupportedLocale;
  t: (path: string, interpolations?: Record<string, string>) => string;
  messages: ReturnType<typeof getMessages>;
}

// Middleware to add i18n support to context
export function i18nMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    // Detect locale from Accept-Language header
    const acceptLanguage = c.req.header("Accept-Language");
    const locale = detectLocale(acceptLanguage);

    // Add i18n properties to context
    c.set("locale", locale);
    c.set("t", (path: string, interpolations?: Record<string, string>) =>
      getMessage(path, locale, interpolations),
    );
    c.set("messages", getMessages(locale));

    await next();
  };
}

// Helper to get i18n context from Hono context
export function getI18n(c: Context): I18nContext {
  const locale = c.get("locale") || DEFAULT_LOCALE;
  const t = c.get("t") || ((path: string) => getMessage(path, locale));
  const messages = c.get("messages") || getMessages(locale);

  return { locale, t, messages };
}

// Helper to create localized response
export function createLocalizedResponse(
  c: Context,
  data: any,
  messageKey: string,
  statusCode: number = 200,
  interpolations?: Record<string, string>,
) {
  const { t } = getI18n(c);
  const message = t(messageKey, interpolations);

  return c.json(
    {
      success: statusCode < 400,
      message,
      data: statusCode < 400 ? data : undefined,
      error:
        statusCode >= 400
          ? { code: messageKey.toUpperCase(), message }
          : undefined,
    },
    statusCode as any,
  );
}

// Helper to create localized error response
export function createLocalizedError(
  c: Context,
  errorKey: string,
  messageKey: string,
  statusCode: number = 500,
  details?: any,
  interpolations?: Record<string, string>,
) {
  const { t } = getI18n(c);
  const message = t(messageKey, interpolations);
  const code = t(errorKey);

  return c.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    statusCode as any,
  );
}

// Helper to get specific message
export function getLocalizedMessage(
  c: Context,
  path: string,
  interpolations?: Record<string, string>,
): string {
  const { t } = getI18n(c);
  return t(path, interpolations);
}

// Export types for use in other files
export type { SupportedLocale };
