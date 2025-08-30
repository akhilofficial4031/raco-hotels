import React from "react";
import { renderToString } from "react-dom/server";

interface BaseEmailProps {
  recipientName?: string;
}

// Brand colors and styles
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

// Welcome Email Component
interface WelcomeEmailProps extends BaseEmailProps {
  userName: string;
  loginUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  loginUrl = "#",
}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to Raco Hotels</title>
    </head>
    <body
      style={{
        backgroundColor: styles.background,
        fontFamily: "Arial, sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: styles.white,
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: styles.primary,
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: styles.white, margin: 0, fontSize: "28px" }}>
            Welcome to Raco Hotels
          </h1>
          <p
            style={{ color: styles.white, margin: "10px 0 0 0", opacity: 0.9 }}
          >
            Your premium hotel booking experience awaits
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: "40px 30px" }}>
          <h2
            style={{
              color: styles.primary,
              margin: "0 0 20px 0",
              fontSize: "24px",
            }}
          >
            Hello {userName}! 🎉
          </h2>

          <p
            style={{
              color: styles.secondary,
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 20px 0",
            }}
          >
            Thank you for joining Raco Hotels! We're thrilled to have you as
            part of our community. Your account has been successfully created
            and you're now ready to explore amazing accommodations worldwide.
          </p>

          <div
            style={{
              backgroundColor: styles.lightGray,
              padding: "25px",
              borderRadius: "8px",
              margin: "30px 0",
            }}
          >
            <h3
              style={{
                color: styles.primary,
                margin: "0 0 15px 0",
                fontSize: "18px",
              }}
            >
              What you can do now:
            </h3>
            <p style={{ margin: "0 0 10px 0", color: styles.secondary }}>
              🏨 <strong>Book Premium Hotels</strong> - Access thousands of
              luxury and budget-friendly options
            </p>
            <p style={{ margin: "0 0 10px 0", color: styles.secondary }}>
              📱 <strong>Manage Reservations</strong> - View, modify, and track
              your bookings effortlessly
            </p>
            <p style={{ margin: "0 0 10px 0", color: styles.secondary }}>
              💰 <strong>Exclusive Deals</strong> - Get access to member-only
              discounts and promotions
            </p>
            <p style={{ margin: "0", color: styles.secondary }}>
              ⭐ <strong>Loyalty Rewards</strong> - Earn points with every
              booking for future stays
            </p>
          </div>

          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <a
              href={loginUrl}
              style={{
                backgroundColor: styles.accent,
                color: styles.white,
                padding: "14px 30px",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                display: "inline-block",
              }}
            >
              Start Exploring Hotels
            </a>
          </div>

          <p
            style={{
              color: styles.gray,
              fontSize: "14px",
              margin: "20px 0 0 0",
            }}
          >
            Need help getting started? Our support team is here to assist you
            24/7.
          </p>
        </div>

        {/* Footer */}
        <hr
          style={{
            borderColor: styles.lightGray,
            margin: "0",
            border: "none",
            borderTop: "1px solid " + styles.lightGray,
          }}
        />
        <div style={{ padding: "30px", textAlign: "center" }}>
          <p
            style={{
              color: styles.secondary,
              margin: "0 0 10px 0",
              fontWeight: "bold",
            }}
          >
            Best regards,
          </p>
          <p
            style={{
              color: styles.primary,
              margin: "0",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            The Raco Hotels Team
          </p>
          <p
            style={{
              color: styles.gray,
              margin: "15px 0 0 0",
              fontSize: "12px",
            }}
          >
            © 2024 Raco Hotels. All rights reserved.
          </p>
        </div>
      </div>
    </body>
  </html>
);

// Booking Confirmation Email Component
interface BookingConfirmationProps extends BaseEmailProps {
  customerName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  totalAmount: number;
  bookingId: string;
  hotelImage?: string;
  bookingUrl?: string;
}

export const BookingConfirmationEmail: React.FC<BookingConfirmationProps> = ({
  customerName,
  hotelName,
  checkIn,
  checkOut,
  roomType,
  totalAmount,
  bookingId,
  hotelImage,
  bookingUrl = "#",
}) => {
  console.log("Hotel image URL:", hotelImage);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Booking Confirmed</title>
      </head>
      <body
        style={{
          backgroundColor: styles.background,
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: styles.white,
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: styles.success,
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: styles.white, margin: 0, fontSize: "28px" }}>
              🎉 Booking Confirmed!
            </h1>
            <p
              style={{
                color: styles.white,
                margin: "10px 0 0 0",
                opacity: 0.9,
              }}
            >
              Your reservation is confirmed and ready
            </p>
          </div>

          {/* Main Content */}
          <div style={{ padding: "40px 30px" }}>
            <p
              style={{
                color: styles.secondary,
                fontSize: "16px",
                margin: "0 0 30px 0",
              }}
            >
              Dear <strong>{customerName}</strong>,
            </p>

            <p
              style={{
                color: styles.secondary,
                fontSize: "16px",
                lineHeight: "1.6",
                margin: "0 0 30px 0",
              }}
            >
              Great news! Your booking has been successfully confirmed. We're
              excited to welcome you to your upcoming stay. Below are your
              complete booking details for your reference.
            </p>

            {/* Booking Details Card */}
            <div
              style={{
                backgroundColor: styles.lightGray,
                padding: "30px",
                borderRadius: "12px",
                margin: "30px 0",
                border: `1px solid ${styles.lightGray}`,
              }}
            >
              <h3
                style={{
                  color: styles.primary,
                  margin: "0 0 25px 0",
                  fontSize: "20px",
                }}
              >
                📋 Booking Details
              </h3>

              <p
                style={{
                  margin: "0 0 8px 0",
                  color: styles.secondary,
                  fontWeight: "bold",
                }}
              >
                🏨 Hotel
              </p>
              <p style={{ margin: "0 0 15px 0", color: styles.secondary }}>
                {hotelName}
              </p>

              <p
                style={{
                  margin: "0 0 8px 0",
                  color: styles.secondary,
                  fontWeight: "bold",
                }}
              >
                🛏️ Room Type
              </p>
              <p style={{ margin: "0 0 15px 0", color: styles.secondary }}>
                {roomType}
              </p>

              <p
                style={{
                  margin: "0 0 8px 0",
                  color: styles.secondary,
                  fontWeight: "bold",
                }}
              >
                📅 Check-in
              </p>
              <p style={{ margin: "0 0 15px 0", color: styles.secondary }}>
                {new Date(checkIn).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <p
                style={{
                  margin: "0 0 8px 0",
                  color: styles.secondary,
                  fontWeight: "bold",
                }}
              >
                📅 Check-out
              </p>
              <p style={{ margin: "0 0 15px 0", color: styles.secondary }}>
                {new Date(checkOut).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <hr
                style={{
                  borderColor: styles.gray,
                  margin: "20px 0",
                  border: "none",
                  borderTop: "1px solid " + styles.gray,
                }}
              />

              <p
                style={{
                  margin: "0 0 8px 0",
                  color: styles.secondary,
                  fontWeight: "bold",
                }}
              >
                💰 Total Amount
              </p>
              <p
                style={{
                  margin: "0 0 15px 0",
                  color: styles.primary,
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                ${totalAmount.toFixed(2)}
              </p>

              <p
                style={{
                  margin: "0 0 8px 0",
                  color: styles.secondary,
                  fontWeight: "bold",
                }}
              >
                🆔 Booking ID
              </p>
              <p
                style={{
                  margin: "0",
                  color: styles.secondary,
                  fontFamily: "monospace",
                }}
              >
                {bookingId}
              </p>
            </div>

            {/* Important Information */}
            <div
              style={{
                backgroundColor: "#fef5e7",
                padding: "25px",
                borderRadius: "8px",
                margin: "30px 0",
                border: `1px solid #f6e05e`,
              }}
            >
              <h3
                style={{
                  color: styles.warning,
                  margin: "0 0 15px 0",
                  fontSize: "18px",
                }}
              >
                ⚠️ Important Information
              </h3>
              <p style={{ margin: "0 0 10px 0", color: styles.secondary }}>
                • <strong>Check-in time:</strong> 3:00 PM on your check-in date
              </p>
              <p style={{ margin: "0 0 10px 0", color: styles.secondary }}>
                • <strong>Cancellation:</strong> Please contact us at least 24
                hours in advance for changes
              </p>
              <p style={{ margin: "0", color: styles.secondary }}>
                • <strong>Contact:</strong> Our team is available 24/7 for any
                assistance
              </p>
            </div>

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <a
                href={bookingUrl}
                style={{
                  backgroundColor: styles.primary,
                  color: styles.white,
                  padding: "14px 30px",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  display: "inline-block",
                  margin: "0 10px 10px 0",
                }}
              >
                View My Booking
              </a>
              <a
                href="#"
                style={{
                  backgroundColor: styles.white,
                  color: styles.primary,
                  padding: "14px 30px",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  display: "inline-block",
                  border: `2px solid ${styles.primary}`,
                }}
              >
                Contact Support
              </a>
            </div>

            <p
              style={{
                color: styles.secondary,
                fontSize: "16px",
                margin: "20px 0 0 0",
              }}
            >
              Thank you for choosing <strong>Raco Hotels</strong>! We look
              forward to providing you with an exceptional experience.
            </p>
          </div>

          {/* Footer */}
          <hr
            style={{
              borderColor: styles.lightGray,
              margin: "0",
              border: "none",
              borderTop: "1px solid " + styles.lightGray,
            }}
          />
          <div style={{ padding: "30px", textAlign: "center" }}>
            <p
              style={{
                color: styles.secondary,
                margin: "0 0 10px 0",
                fontWeight: "bold",
              }}
            >
              Best regards,
            </p>
            <p
              style={{
                color: styles.primary,
                margin: "0",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              The Raco Hotels Team
            </p>
            <p
              style={{
                color: styles.gray,
                margin: "15px 0 0 0",
                fontSize: "12px",
              }}
            >
              © 2024 Raco Hotels. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

// Password Reset Email Component
interface PasswordResetProps extends BaseEmailProps {
  resetUrl: string;
  tokenExpiryDays: number;
  userEmail?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetProps> = ({
  resetUrl,
  tokenExpiryDays,
  userEmail,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset</title>
      </head>
      <body
        style={{
          backgroundColor: styles.background,
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: styles.white,
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: styles.warning,
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: styles.white, margin: 0, fontSize: "28px" }}>
              🔐 Password Reset
            </h1>
            <p
              style={{
                color: styles.white,
                margin: "10px 0 0 0",
                opacity: 0.9,
              }}
            >
              Secure your account with a new password
            </p>
          </div>

          {/* Main Content */}
          <div style={{ padding: "40px 30px" }}>
            <h2
              style={{
                color: styles.primary,
                margin: "0 0 20px 0",
                fontSize: "24px",
              }}
            >
              Reset Your Password
            </h2>

            <p
              style={{
                color: styles.secondary,
                fontSize: "16px",
                lineHeight: "1.6",
                margin: "0 0 20px 0",
              }}
            >
              We received a request to reset the password for your Raco Hotels
              account.
              {userEmail && ` This request was made for: ${userEmail}`}
            </p>

            <div
              style={{
                backgroundColor: styles.lightGray,
                padding: "25px",
                borderRadius: "8px",
                margin: "30px 0",
                textAlign: "center",
              }}
            >
              <p style={{ margin: "0 0 20px 0", color: styles.secondary }}>
                Click the button below to securely reset your password:
              </p>

              <a
                href={resetUrl}
                style={{
                  backgroundColor: styles.warning,
                  color: styles.white,
                  padding: "16px 32px",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  display: "inline-block",
                }}
              >
                Reset Password Now
              </a>
            </div>

            <div
              style={{
                backgroundColor: "#fef2f2",
                padding: "20px",
                borderRadius: "8px",
                margin: "30px 0",
                border: `1px solid ${styles.danger}`,
              }}
            >
              <h3
                style={{
                  color: styles.danger,
                  margin: "0 0 15px 0",
                  fontSize: "16px",
                }}
              >
                ⏰ Time Sensitive
              </h3>
              <p style={{ margin: "0", color: styles.secondary }}>
                <strong>Important:</strong> This password reset link will expire
                in <strong>{tokenExpiryDays} days</strong> for security reasons.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f0f9ff",
                padding: "20px",
                borderRadius: "8px",
                margin: "30px 0",
                border: `1px solid #90cdf4`,
              }}
            >
              <h3
                style={{
                  color: styles.accent,
                  margin: "0 0 15px 0",
                  fontSize: "16px",
                }}
              >
                🛡️ Security Notice
              </h3>
              <p style={{ margin: "0 0 10px 0", color: styles.secondary }}>
                • If you didn't request this password reset, please ignore this
                email
              </p>
              <p style={{ margin: "0 0 10px 0", color: styles.secondary }}>
                • Your password won't change until you create a new one using
                the link above
              </p>
              <p style={{ margin: "0", color: styles.secondary }}>
                • Never share this email or the reset link with anyone
              </p>
            </div>

            <p
              style={{
                color: styles.gray,
                fontSize: "14px",
                margin: "20px 0 0 0",
              }}
            >
              If you're having trouble clicking the button, you can copy and
              paste this URL into your browser:
            </p>
            <p
              style={{
                color: styles.accent,
                fontSize: "12px",
                wordBreak: "break-all",
                margin: "10px 0 0 0",
                fontFamily: "monospace",
              }}
            >
              {resetUrl}
            </p>
          </div>

          {/* Footer */}
          <hr
            style={{
              borderColor: styles.lightGray,
              margin: "0",
              border: "none",
              borderTop: "1px solid " + styles.lightGray,
            }}
          />
          <div style={{ padding: "30px", textAlign: "center" }}>
            <p
              style={{
                color: styles.secondary,
                margin: "0 0 10px 0",
                fontWeight: "bold",
              }}
            >
              Need help?
            </p>
            <p
              style={{
                color: styles.primary,
                margin: "0",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              The Raco Hotels Team
            </p>
            <p
              style={{
                color: styles.gray,
                margin: "15px 0 0 0",
                fontSize: "12px",
              }}
            >
              © 2024 Raco Hotels. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

// Generic Notification Email Component
interface NotificationProps extends BaseEmailProps {
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  notificationType?: "info" | "success" | "warning" | "error";
}

export const NotificationEmail: React.FC<NotificationProps> = ({
  subject,
  message,
  actionUrl,
  actionText,
  notificationType = "info",
}) => {
  const getTypeStyles = () => {
    switch (notificationType) {
      case "success":
        return { bg: styles.success, icon: "✅", title: "Good News!" };
      case "warning":
        return { bg: styles.warning, icon: "⚠️", title: "Important Notice" };
      case "error":
        return { bg: styles.danger, icon: "❌", title: "Action Required" };
      default:
        return { bg: styles.accent, icon: "ℹ️", title: "Notification" };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{subject}</title>
      </head>
      <body
        style={{
          backgroundColor: styles.background,
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: styles.white,
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: typeStyles.bg,
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: styles.white, margin: 0, fontSize: "28px" }}>
              {typeStyles.icon} {subject}
            </h1>
            <p
              style={{
                color: styles.white,
                margin: "10px 0 0 0",
                opacity: 0.9,
              }}
            >
              {typeStyles.title}
            </p>
          </div>

          {/* Main Content */}
          <div style={{ padding: "40px 30px" }}>
            <p
              style={{
                color: styles.secondary,
                fontSize: "16px",
                lineHeight: "1.6",
                margin: "0 0 30px 0",
              }}
            >
              {message}
            </p>

            {actionUrl && actionText && (
              <div style={{ textAlign: "center", margin: "30px 0" }}>
                <a
                  href={actionUrl}
                  style={{
                    backgroundColor: typeStyles.bg,
                    color: styles.white,
                    padding: "14px 30px",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    display: "inline-block",
                  }}
                >
                  {actionText}
                </a>
              </div>
            )}

            <p
              style={{
                color: styles.gray,
                fontSize: "14px",
                margin: "20px 0 0 0",
              }}
            >
              If you have any questions or need assistance, our support team is
              always here to help.
            </p>
          </div>

          {/* Footer */}
          <hr
            style={{
              borderColor: styles.lightGray,
              margin: "0",
              border: "none",
              borderTop: "1px solid " + styles.lightGray,
            }}
          />
          <div style={{ padding: "30px", textAlign: "center" }}>
            <p
              style={{
                color: styles.secondary,
                margin: "0 0 10px 0",
                fontWeight: "bold",
              }}
            >
              Best regards,
            </p>
            <p
              style={{
                color: styles.primary,
                margin: "0",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              The Raco Hotels Team
            </p>
            <p
              style={{
                color: styles.gray,
                margin: "15px 0 0 0",
                fontSize: "12px",
              }}
            >
              © 2024 Raco Hotels. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

// Email Template Renderer Functions
export const renderWelcomeEmail = (props: WelcomeEmailProps): string => {
  return renderToString(<WelcomeEmail {...props} />);
};

export const renderBookingConfirmationEmail = (
  props: BookingConfirmationProps,
): string => {
  return renderToString(<BookingConfirmationEmail {...props} />);
};

export const renderPasswordResetEmail = (props: PasswordResetProps): string => {
  return renderToString(<PasswordResetEmail {...props} />);
};

export const renderNotificationEmail = (props: NotificationProps): string => {
  return renderToString(<NotificationEmail {...props} />);
};
