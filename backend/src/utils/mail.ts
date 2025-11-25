import notificationapi from "notificationapi-node-server-sdk";

import {
  renderWelcomeEmail,
  renderWelcomePasswordEmail,
  renderBookingConfirmationEmail,
  renderPasswordResetEmail,
  renderNotificationEmail,
} from "./mail-templates";
import {
  EMAIL_CONFIG,
  getDefaultEmailOptions,
  type EmailOptions,
} from "../config/mail";

import type { AppContext } from "../types";

/**
 * NotificationAPI client instance cache
 * We cache the instance to avoid re-initialization on every request
 */
let notificationApiInstance: typeof notificationapi | null = null;

/**
 * Initialize NotificationAPI client
 * This function should be called once when the application starts or on first use
 */
function getNotificationApiInstance(c: AppContext): typeof notificationapi {
  if (!notificationApiInstance) {
    const clientId = c.env.NOTIFICATIONAPI_CLIENT_ID;
    const clientSecret = c.env.NOTIFICATIONAPI_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        "NotificationAPI credentials not configured. Please set NOTIFICATIONAPI_CLIENT_ID and NOTIFICATIONAPI_CLIENT_SECRET in environment variables.",
      );
    }

    notificationapi.init(clientId, clientSecret);
    notificationApiInstance = notificationapi;
  }

  return notificationApiInstance;
}

/**
 * Send email with custom HTML template via NotificationAPI
 * This bypasses dashboard templates and sends HTML directly
 */
async function sendEmailWithCustomHTML(
  c: AppContext,
  {
    userEmail,
    userId,
    subject,
    html,
    emailOptions,
  }: {
    userEmail: string;
    userId: string;
    subject: string;
    html: string;
    emailOptions?: EmailOptions;
  },
) {
  const api = getNotificationApiInstance(c);

  try {
    const defaultOptions = getDefaultEmailOptions();
    const finalEmailOptions = {
      ...defaultOptions,
      ...emailOptions,
    };

    // Send email with inline HTML (no notificationId needed)
    await api.send({
      user: {
        id: userId,
        email: userEmail,
      },
      email: {
        subject,
        html,
        ...finalEmailOptions,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  c: AppContext,
  to: string,
  userName: string,
) {
  const { subject, html } = renderWelcomeEmail({
    userName,
    loginUrl: "#", // Default login URL, can be configured
  });

  return sendEmailWithCustomHTML(c, {
    userEmail: to,
    userId: to,
    subject,
    html,
  });
}

/**
 * Send welcome email with set password link to new user
 */
export async function sendWelcomePasswordEmail(
  c: AppContext,
  to: string,
  userName: string,
  setPasswordUrl: string,
) {
  const { subject, html } = renderWelcomePasswordEmail({
    userName,
    setPasswordUrl,
  });

  return sendEmailWithCustomHTML(c, {
    userEmail: to,
    userId: to,
    subject,
    html,
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  c: AppContext,
  to: string,
  customerName: string,
  bookingDetails: {
    hotelName: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    totalAmount: number;
    bookingId: string;
  },
) {
  const { subject, html } = renderBookingConfirmationEmail({
    customerName,
    ...bookingDetails,
    bookingUrl: "#", // Can be configured with actual booking URL
  });

  return sendEmailWithCustomHTML(c, {
    userEmail: to,
    userId: to,
    subject,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  c: AppContext,
  to: string,
  resetUrl: string,
  tokenExpiryDays: number = EMAIL_CONFIG.PASSWORD_RESET_TOKEN_EXPIRY_DAYS,
) {
  const { subject, html } = renderPasswordResetEmail({
    resetUrl,
    tokenExpiryDays,
    userEmail: to,
  });

  return sendEmailWithCustomHTML(c, {
    userEmail: to,
    userId: to,
    subject,
    html,
  });
}

/**
 * Send generic notification email
 */
export async function sendNotificationEmail(
  c: AppContext,
  to: string,
  subject: string,
  message: string,
  actionUrl?: string,
  actionText?: string,
) {
  const emailTemplate = renderNotificationEmail({
    subject,
    message,
    actionUrl,
    actionText,
  });

  return sendEmailWithCustomHTML(c, {
    userEmail: to,
    userId: to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  });
}
