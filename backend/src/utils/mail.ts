import notificationapi from "notificationapi-node-server-sdk";

import { EMAIL_CONFIG } from "../config/mail";

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
    const clientId =
      c.env.NOTIFICATIONAPI_CLIENT_ID || "g4jp8l41x1z0s04iws7wo34hlc";
    const clientSecret =
      c.env.NOTIFICATIONAPI_CLIENT_SECRET ||
      "uj1j04fe2gh80m1xzzk1amp8r24wjnlfpp521ugqkjhz7y99mwjnugp5c3";

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
 * Send email using NotificationAPI templates
 * Uses templates configured in the NotificationAPI dashboard
 */
async function sendEmailWithTemplate(
  c: AppContext,
  {
    userEmail,
    userId,
    parameters,
    notificationType = "welcome_notification",
    templateId = "welcome_notification",
  }: {
    userEmail: string;
    userId: string;
    parameters: Record<string, any>;
    notificationType?: string;
    templateId?: string;
  },
) {
  const api = getNotificationApiInstance(c);

  try {
    const payload = {
      notificationId: notificationType,
      user: {
        id: userId,
        email: userEmail,
      },
      parameters: parameters,
      templateId: templateId,
    };

    await api.send(payload);

    return { success: true };
  } catch (error) {
    console.error("Failed to send email via NotificationAPI:", error);

    // Log more details about the error
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      console.error("NotificationAPI Error Response:", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
        },
      });
    }

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
  return sendEmailWithTemplate(c, {
    userEmail: to,
    userId: to,
    templateId: "welcome_notification",
    parameters: {
      user: to,
      userName: userName,
      loginUrl: "#",
    },
    notificationType: "welcome",
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
  return sendEmailWithTemplate(c, {
    userEmail: to,
    userId: to,
    templateId: "activation_mail",
    parameters: {
      user: userName,
      userName: userName,
      link: setPasswordUrl,
    },
    notificationType: "account_activation",
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
  return sendEmailWithTemplate(c, {
    userEmail: to,
    userId: to, // You'll need to create this template in NotificationAPI dashboard
    templateId: "booking_confirmation",
    parameters: {
      user: to,
      customerName: customerName,
      hotelName: bookingDetails.hotelName,
      checkIn: bookingDetails.checkIn,
      checkOut: bookingDetails.checkOut,
      roomType: bookingDetails.roomType,
      totalAmount: bookingDetails.totalAmount,
      bookingId: bookingDetails.bookingId,
      bookingUrl: "#",
    },
    notificationType: "booking_confirmation",
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  c: AppContext,
  to: string,
  userName: string,
  resetUrl: string,
  tokenExpiryDays: number = EMAIL_CONFIG.PASSWORD_RESET_TOKEN_EXPIRY_DAYS,
) {
  return sendEmailWithTemplate(c, {
    userEmail: to,
    userId: to,
    templateId: "reset_password",
    parameters: {
      user: userName,
      link: resetUrl,
      tokenExpiryDays: tokenExpiryDays,
      userEmail: to,
    },
    notificationType: "reset_password",
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
  return sendEmailWithTemplate(c, {
    userEmail: to,
    userId: to,
    parameters: {
      user: to,
      subject: subject,
      message: message,
      actionUrl: actionUrl || "#",
      actionText: actionText || "Take Action",
    },
    notificationType: "generic_notification",
  });
}

/**
 * Send booking confirmation email with all details
 */
export async function sendBookingConfirmationEmail(
  c: AppContext,
  bookingData: {
    customerEmail: string;
    customerName: string;
    bookingReference: string;
    hotelName: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    numNights: number;
    numAdults: number;
    numChildren: number;
    roomRent: string;
    addonsList: string;
    subtotal: string;
    discount: string;
    taxAmount: string;
    totalAmount: string;
    amountPaid: string;
    balanceDue: string;
    currencySymbol: string;
  },
) {
  return sendEmailWithTemplate(c, {
    userEmail: bookingData.customerEmail,
    userId: bookingData.customerEmail,
    templateId: "booking_confirmation",
    parameters: {
      customerName: bookingData.customerName,
      bookingReference: bookingData.bookingReference,
      hotelName: bookingData.hotelName,
      roomType: bookingData.roomType,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      numNights: bookingData.numNights,
      numAdults: bookingData.numAdults,
      numChildren: bookingData.numChildren,
      roomRent: bookingData.roomRent,
      addonsList: bookingData.addonsList,
      subtotal: bookingData.subtotal,
      discount: bookingData.discount,
      taxAmount: bookingData.taxAmount,
      totalAmount: bookingData.totalAmount,
      amountPaid: bookingData.amountPaid,
      balanceDue: bookingData.balanceDue,
      currencySymbol: bookingData.currencySymbol,
    },
    notificationType: "booking_confirmation",
  });
}
