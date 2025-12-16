/**
 * Custom HTML Email Templates
 * These templates are sent directly via NotificationAPI without using dashboard templates
 */

/**
 * Brand colors and styles
 */
const styles = {
  primary: "#1a365d",
  secondary: "#2d3748",
  accent: "#3182ce",
  success: "#38a169",
  warning: "#d69e2e",
  danger: "#e53e3e",
  background: "#f7fafc",
  white: "#ffffff",
  gray: "#718096",
  lightGray: "#e2e8f0",
};

/**
 * Base email template wrapper
 */
function baseEmailTemplate(
  headerColor: string,
  headerTitle: string,
  headerSubtitle: string,
  bodyContent: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
</head>
<body style="background-color: ${styles.background}; font-family: Arial, sans-serif; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: ${styles.white};">
    <!-- Header -->
    <div style="background-color: ${headerColor}; padding: 40px 20px; text-align: center;">
      <h1 style="color: ${styles.white}; margin: 0; font-size: 28px;">${headerTitle}</h1>
      <p style="color: ${styles.white}; margin: 10px 0 0 0; opacity: 0.9;">${headerSubtitle}</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      ${bodyContent}
    </div>
    
    <!-- Footer -->
    <hr style="border: none; border-top: 1px solid ${styles.lightGray}; margin: 0;">
    <div style="padding: 30px; text-align: center;">
      <p style="color: ${styles.secondary}; margin: 0 0 10px 0; font-weight: bold;">Best regards,</p>
      <p style="color: ${styles.primary}; margin: 0; font-size: 18px; font-weight: bold;">The Raco Hotels Team</p>
      <p style="color: ${styles.gray}; margin: 15px 0 0 0; font-size: 12px;">© 2024 Raco Hotels. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Welcome Email Template
 */
export function renderWelcomeEmail(data: {
  userName: string;
  loginUrl?: string;
}): { subject: string; html: string } {
  const bodyContent = `
    <h2 style="color: ${styles.primary}; margin: 0 0 20px 0; font-size: 24px;">
      Hello ${data.userName}! 🎉
    </h2>
    
    <p style="color: ${styles.secondary}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Welcome to the Raco Hotels Management System! Your account has been successfully created 
      and you're now part of our team.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.loginUrl || "#"}" 
         style="background-color: ${styles.accent}; color: ${styles.white}; padding: 14px 30px; 
                text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; 
                display: inline-block;">
        Access Management System
      </a>
    </div>
    
    <p style="color: ${styles.gray}; font-size: 14px; margin: 20px 0 0 0;">
      Need help getting started with the system? Contact our technical support team for assistance.
    </p>
  `;

  return {
    subject: "Welcome to Raco Hotels!",
    html: baseEmailTemplate(
      styles.primary,
      "Welcome to Raco Hotels",
      "Hotel Management System Access",
      bodyContent,
    ),
  };
}

/**
 * Welcome Email with Password Setup Template
 */
export function renderWelcomePasswordEmail(data: {
  userName: string;
  setPasswordUrl: string;
}): { subject: string; html: string } {
  const bodyContent = `
    <h2 style="color: ${styles.primary}; margin: 0 0 20px 0; font-size: 24px;">
      Hello ${data.userName}! 🎉
    </h2>
    
    <p style="color: ${styles.secondary}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Welcome to the Raco Hotels Management System! Your account has been successfully created 
      and you're now part of our team. To get started, you'll need to set up your password to access the system.
    </p>
    
    <div style="background-color: ${styles.success}20; border: 1px solid ${styles.success}; 
                border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: ${styles.secondary}; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0; font-weight: bold;">
        🔐 <strong>Important:</strong> Please set up your password to secure your account.
      </p>
      <p style="color: ${styles.secondary}; font-size: 14px; line-height: 1.5; margin: 0;">
        Click the button below to create your password and access the Raco Hotels management system. 
        This secure link will expire in 7 days for your account protection.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.setPasswordUrl}" 
         style="background-color: ${styles.accent}; color: ${styles.white}; padding: 14px 30px; 
                text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; 
                display: inline-block;">
        Set Your Password
      </a>
    </div>
    
    <p style="color: ${styles.gray}; font-size: 14px; margin: 20px 0 0 0;">
      Need help getting started with the system? Contact our technical support team for assistance.
    </p>
  `;

  return {
    subject: "Welcome to Raco Hotels - Set Your Password",
    html: baseEmailTemplate(
      styles.primary,
      "Welcome to Raco Hotels",
      "Hotel Management System Access",
      bodyContent,
    ),
  };
}

/**
 * Booking Confirmation Email Template
 */
export function renderBookingConfirmationEmail(data: {
  customerName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  totalAmount: number;
  bookingId: string;
  bookingUrl?: string;
}): { subject: string; html: string } {
  const bodyContent = `
    <p style="color: ${styles.secondary}; font-size: 16px; margin: 0 0 30px 0;">
      Dear <strong>${data.customerName}</strong>,
    </p>
    
    <p style="color: ${styles.secondary}; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Great news! Your booking has been successfully confirmed. We're excited to welcome you to your upcoming stay. 
      Below are your complete booking details for your reference.
    </p>
    
    <!-- Booking Details Card -->
    <div style="background-color: ${styles.lightGray}; padding: 30px; border-radius: 12px; 
                margin: 30px 0; border: 1px solid ${styles.lightGray};">
      <h3 style="color: ${styles.primary}; margin: 0 0 25px 0; font-size: 20px;">
        📋 Booking Details
      </h3>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">🏨 Hotel</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary};">${data.hotelName}</p>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">🛏️ Room Type</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary};">${data.roomType}</p>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">📅 Check-in</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary};">${new Date(data.checkIn).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">📅 Check-out</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary};">${new Date(data.checkOut).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      
      <hr style="border: none; border-top: 1px solid ${styles.gray}; margin: 20px 0;">
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">💰 Total Amount</p>
      <p style="margin: 0 0 15px 0; color: ${styles.primary}; font-size: 18px; font-weight: bold;">
        $${data.totalAmount.toFixed(2)}
      </p>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">🆔 Booking ID</p>
      <p style="margin: 0; color: ${styles.secondary}; font-family: monospace;">${data.bookingId}</p>
    </div>
    
    <!-- Important Information -->
    <div style="background-color: #fef5e7; padding: 25px; border-radius: 8px; 
                margin: 30px 0; border: 1px solid #f6e05e;">
      <h3 style="color: ${styles.warning}; margin: 0 0 15px 0; font-size: 18px;">
        ⚠️ Important Information
      </h3>
      <p style="margin: 0 0 10px 0; color: ${styles.secondary};">
        • <strong>Check-in time:</strong> 3:00 PM on your check-in date
      </p>
      <p style="margin: 0 0 10px 0; color: ${styles.secondary};">
        • <strong>Cancellation:</strong> Please contact us at least 24 hours in advance for changes
      </p>
      <p style="margin: 0; color: ${styles.secondary};">
        • <strong>Contact:</strong> Our team is available 24/7 for any assistance
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.bookingUrl || "#"}" 
         style="background-color: ${styles.primary}; color: ${styles.white}; padding: 14px 30px; 
                text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; 
                display: inline-block; margin: 0 10px 10px 0;">
        View My Booking
      </a>
    </div>
    
    <p style="color: ${styles.secondary}; font-size: 16px; margin: 20px 0 0 0;">
      Thank you for choosing <strong>Raco Hotels</strong>! We look forward to providing you with an exceptional experience.
    </p>
  `;

  return {
    subject: `Booking Confirmed - ${data.hotelName}`,
    html: baseEmailTemplate(
      styles.success,
      "🎉 Booking Confirmed!",
      "Your reservation is confirmed and ready",
      bodyContent,
    ),
  };
}

/**
 * Password Reset Email Template
 */
export function renderPasswordResetEmail(data: {
  resetUrl: string;
  tokenExpiryDays: number;
  userEmail?: string;
}): { subject: string; html: string } {
  const bodyContent = `
    <h2 style="color: ${styles.primary}; margin: 0 0 20px 0; font-size: 24px;">
      Reset Your Password
    </h2>
    
    <p style="color: ${styles.secondary}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We received a request to reset the password for your Raco Hotels account${data.userEmail ? ` (${data.userEmail})` : ""}.
    </p>
    
    <div style="background-color: ${styles.lightGray}; padding: 25px; border-radius: 8px; 
                margin: 30px 0; text-align: center;">
      <p style="margin: 0 0 20px 0; color: ${styles.secondary};">
        Click the button below to securely reset your password:
      </p>
      
      <a href="${data.resetUrl}" 
         style="background-color: ${styles.warning}; color: ${styles.white}; padding: 16px 32px; 
                text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; 
                display: inline-block;">
        Reset Password Now
      </a>
    </div>
    
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; 
                margin: 30px 0; border: 1px solid ${styles.danger};">
      <h3 style="color: ${styles.danger}; margin: 0 0 15px 0; font-size: 16px;">
        ⏰ Time Sensitive
      </h3>
      <p style="margin: 0; color: ${styles.secondary};">
        <strong>Important:</strong> This password reset link will expire in 
        <strong>${data.tokenExpiryDays} days</strong> for security reasons.
      </p>
    </div>
    
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; 
                margin: 30px 0; border: 1px solid #90cdf4;">
      <h3 style="color: ${styles.accent}; margin: 0 0 15px 0; font-size: 16px;">
        🛡️ Security Notice
      </h3>
      <p style="margin: 0 0 10px 0; color: ${styles.secondary};">
        • If you didn't request this password reset, please ignore this email
      </p>
      <p style="margin: 0 0 10px 0; color: ${styles.secondary};">
        • Your password won't change until you create a new one using the link above
      </p>
      <p style="margin: 0; color: ${styles.secondary};">
        • Never share this email or the reset link with anyone
      </p>
    </div>
    
    <p style="color: ${styles.gray}; font-size: 14px; margin: 20px 0 0 0;">
      If you're having trouble clicking the button, you can copy and paste this URL into your browser:
    </p>
    <p style="color: ${styles.accent}; font-size: 12px; word-break: break-all; 
              margin: 10px 0 0 0; font-family: monospace;">
      ${data.resetUrl}
    </p>
  `;

  return {
    subject: "Reset Your Password - Raco Hotels",
    html: baseEmailTemplate(
      styles.warning,
      "🔐 Password Reset",
      "Secure your account with a new password",
      bodyContent,
    ),
  };
}

/**
 * Payment Confirmation Email Template
 */
export function renderPaymentConfirmationEmail(data: {
  customerName: string;
  hotelName: string;
  bookingReference: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  totalAmount: string;
  amountPaid: string;
  paymentMethod: string;
  paymentDate: string;
  currencySymbol: string;
}): { subject: string; html: string } {
  const bodyContent = `
    <p style="color: ${styles.secondary}; font-size: 16px; margin: 0 0 30px 0;">
      Dear <strong>${data.customerName}</strong>,
    </p>
    
    <p style="color: ${styles.secondary}; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Great news! We have successfully received your payment for your booking at <strong>${data.hotelName}</strong>. 
      Your reservation is now fully confirmed and paid. Thank you for choosing Raco Hotels!
    </p>
    
    <!-- Payment Summary Card -->
    <div style="background-color: #f0fff4; padding: 30px; border-radius: 12px; 
                margin: 30px 0; border: 2px solid ${styles.success};">
      <h3 style="color: ${styles.success}; margin: 0 0 25px 0; font-size: 20px;">
        💳 Payment Successfully Processed
      </h3>
      
      <div style="display: table; width: 100%; border-collapse: collapse;">
        <div style="display: table-row;">
          <div style="display: table-cell; padding: 8px 0; color: ${styles.secondary}; font-weight: bold; width: 30%;">
            Amount Paid:
          </div>
          <div style="display: table-cell; padding: 8px 0; color: ${styles.success}; font-size: 18px; font-weight: bold;">
            ${data.currencySymbol}${data.amountPaid}
          </div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; padding: 8px 0; color: ${styles.secondary}; font-weight: bold;">
            Payment Method:
          </div>
          <div style="display: table-cell; padding: 8px 0; color: ${styles.secondary};">
            ${data.paymentMethod}
          </div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; padding: 8px 0; color: ${styles.secondary}; font-weight: bold;">
            Payment Date:
          </div>
          <div style="display: table-cell; padding: 8px 0; color: ${styles.secondary};">
            ${new Date(data.paymentDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Booking Details Card -->
    <div style="background-color: ${styles.lightGray}; padding: 30px; border-radius: 12px; 
                margin: 30px 0; border: 1px solid ${styles.lightGray};">
      <h3 style="color: ${styles.primary}; margin: 0 0 25px 0; font-size: 20px;">
        📋 Booking Details
      </h3>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">🆔 Booking Reference</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary}; font-family: monospace; font-size: 16px; font-weight: bold;">
        ${data.bookingReference}
      </p>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">🏨 Hotel</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary};">${data.hotelName}</p>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">🛏️ Room Type</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary};">${data.roomType}</p>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">📅 Check-in</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary};">${new Date(
        data.checkIn,
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
      
      <p style="margin: 0 0 8px 0; color: ${styles.secondary}; font-weight: bold;">📅 Check-out</p>
      <p style="margin: 0 0 15px 0; color: ${styles.secondary};">${new Date(
        data.checkOut,
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
    </div>
    
    <!-- Next Steps -->
    <div style="background-color: #fef5e7; padding: 25px; border-radius: 8px; 
                margin: 30px 0; border: 1px solid #f6e05e;">
      <h3 style="color: ${styles.warning}; margin: 0 0 15px 0; font-size: 18px;">
        📋 What's Next?
      </h3>
      <p style="margin: 0 0 10px 0; color: ${styles.secondary};">
        • <strong>Check-in time:</strong> 3:00 PM on your check-in date
      </p>
      <p style="margin: 0 0 10px 0; color: ${styles.secondary};">
        • <strong>Check-out time:</strong> 11:00 AM on your check-out date
      </p>
      <p style="margin: 0 0 10px 0; color: ${styles.secondary};">
        • <strong>Confirmation:</strong> Show this email or your booking reference at check-in
      </p>
      <p style="margin: 0; color: ${styles.secondary};">
        • <strong>Support:</strong> Our team is available 24/7 for any questions
      </p>
    </div>
    
    <p style="color: ${styles.secondary}; font-size: 16px; margin: 20px 0 0 0;">
      Thank you for your payment and for choosing <strong>Raco Hotels</strong>! We're excited to welcome you and provide you with an exceptional experience.
    </p>
  `;

  return {
    subject: `Payment Confirmed - ${data.hotelName} (${data.bookingReference})`,
    html: baseEmailTemplate(
      styles.success,
      "💳 Payment Confirmed!",
      "Your booking is now fully paid and confirmed",
      bodyContent,
    ),
  };
}

/**
 * Generic Notification Email Template
 */
export function renderNotificationEmail(data: {
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  notificationType?: "info" | "success" | "warning" | "error";
}): { subject: string; html: string } {
  const typeConfig = {
    success: { bg: styles.success, icon: "✅", title: "Good News!" },
    warning: { bg: styles.warning, icon: "⚠️", title: "Important Notice" },
    error: { bg: styles.danger, icon: "❌", title: "Action Required" },
    info: { bg: styles.accent, icon: "ℹ️", title: "Notification" },
  };

  const config = typeConfig[data.notificationType || "info"];

  const bodyContent = `
    <p style="color: ${styles.secondary}; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      ${data.message}
    </p>
    
    ${
      data.actionUrl && data.actionText
        ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.actionUrl}" 
         style="background-color: ${config.bg}; color: ${styles.white}; padding: 14px 30px; 
                text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; 
                display: inline-block;">
        ${data.actionText}
      </a>
    </div>
    `
        : ""
    }
    
    <p style="color: ${styles.gray}; font-size: 14px; margin: 20px 0 0 0;">
      If you have any questions or need assistance, our support team is always here to help.
    </p>
  `;

  return {
    subject: `Raco Hotels - ${data.subject}`,
    html: baseEmailTemplate(
      config.bg,
      `${config.icon} ${data.subject}`,
      config.title,
      bodyContent,
    ),
  };
}
