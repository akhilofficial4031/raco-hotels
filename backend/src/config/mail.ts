/**
 * Email Configuration for NotificationAPI
 *
 * This file contains all email-related configuration constants for the application.
 * Templates are managed in the NotificationAPI dashboard, and these IDs reference them.
 */

/**
 * NotificationAPI Notification IDs
 * These IDs must match the notification IDs created in the NotificationAPI dashboard
 */
export const NOTIFICATION_IDS = {
  /**
   * Welcome email sent to new users when they first register
   * Template should include: userName, loginUrl (for setting password)
   */
  WELCOME_EMAIL: "welcome_email",

  /**
   * Welcome email with password setup link for admin-created users
   * Template should include: userName, setPasswordUrl
   */
  WELCOME_PASSWORD_EMAIL: "welcome_password_email",

  /**
   * Booking confirmation email sent after successful reservation
   * Template should include: customerName, hotelName, checkIn, checkOut,
   * roomType, totalAmount, bookingId, bookingUrl
   */
  BOOKING_CONFIRMATION: "booking_confirmation",

  /**
   * Password reset email with secure reset link
   * Template should include: resetUrl, tokenExpiryDays, userEmail
   */
  PASSWORD_RESET: "password_reset",

  /**
   * Generic notification email for various system notifications
   * Template should include: subject, message, actionUrl, actionText
   */
  NOTIFICATION: "notification",
} as const;

/**
 * Default email sender configuration
 */
export const EMAIL_CONFIG = {
  /**
   * Default sender name displayed in recipient's inbox
   */
  DEFAULT_FROM_NAME: "Raco Hotels",

  /**
   * Default sender email address
   * This should be verified in your NotificationAPI account
   */
  DEFAULT_FROM_EMAIL: "noreply@racohotels.com",

  /**
   * Default reply-to email address
   */
  DEFAULT_REPLY_TO: "support@racohotels.com",

  /**
   * Password reset token expiry in days
   */
  PASSWORD_RESET_TOKEN_EXPIRY_DAYS: 7,
} as const;

/**
 * Email channel options type for NotificationAPI
 */
export interface EmailOptions {
  fromName?: string;
  fromAddress?: string;
  replyToAddresses?: string[];
  ccAddresses?: string[];
  bccAddresses?: string[];
  attachments?: Array<{
    filename: string;
    url: string;
  }>;
}

/**
 * Get default email options with configured sender information
 */
export function getDefaultEmailOptions(): EmailOptions {
  return {
    fromName: EMAIL_CONFIG.DEFAULT_FROM_NAME,
    fromAddress: EMAIL_CONFIG.DEFAULT_FROM_EMAIL,
    replyToAddresses: [EMAIL_CONFIG.DEFAULT_REPLY_TO],
  };
}
