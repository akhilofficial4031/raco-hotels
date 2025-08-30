import { Resend } from "resend";

import {
  renderWelcomeEmail,
  renderBookingConfirmationEmail,
  renderPasswordResetEmail,
  renderNotificationEmail,
} from "./mail-templates";

import type { AppContext } from "../types";

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Cache for Resend instances by API key
const resendInstances = new Map<string, Resend>();

/**
 * Get or create a Resend instance for the given API key
 */
function getResendInstance(apiKey: string): Resend {
  if (!resendInstances.has(apiKey)) {
    resendInstances.set(apiKey, new Resend(apiKey));
  }
  return resendInstances.get(apiKey)!;
}

/**
 * Send email using cached Resend instance
 */
export async function sendMail(
  c: AppContext,
  { to, subject, html, from = "onboarding@resend.dev" }: SendMailParams,
) {
  const apiKey = c.env.EMAIL_API_KEY;

  if (!apiKey) {
    throw new Error("Email API key not configured");
  }

  const resend = getResendInstance(apiKey);

  try {
    const response = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    return response;
  } catch (error) {
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
  const html = renderWelcomeEmail({ userName });

  return sendMail(c, {
    to,
    subject: "Welcome to Raco Hotels!",
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
  const html = renderBookingConfirmationEmail({
    customerName,
    ...bookingDetails,
  });

  return sendMail(c, {
    to,
    subject: `Booking Confirmed - ${bookingDetails.hotelName}`,
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
  tokenExpiryDays: number = 7,
) {
  const html = renderPasswordResetEmail({
    resetUrl,
    tokenExpiryDays,
  });

  return sendMail(c, {
    to,
    subject: "Reset Your Password - Raco Hotels",
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
  const html = renderNotificationEmail({
    subject,
    message,
    actionUrl,
    actionText,
  });

  return sendMail(c, {
    to,
    subject: `Raco Hotels - ${subject}`,
    html,
  });
}
