# NotificationAPI Email Setup Guide

This guide will help you set up NotificationAPI for sending emails in the Raco Hotels backend.

## Overview

The application has been migrated from Resend to NotificationAPI for email notifications. NotificationAPI offers a more comprehensive notification platform with support for multiple channels (email, SMS, push notifications, etc.) and centralized template management.

## Prerequisites

1. Create a NotificationAPI account at [https://app.notificationapi.com/](https://app.notificationapi.com/)
2. Get your Client ID and Client Secret from Settings > API Keys

## Configuration Steps

### 1. Environment Variables

Add the following environment variables to your configuration:

**Local Development (.env or wrangler.toml [vars] section):**
```
NOTIFICATIONAPI_CLIENT_ID=your_client_id
NOTIFICATIONAPI_CLIENT_SECRET=your_client_secret
```

**Production (Cloudflare Workers Secrets):**
```bash
wrangler secret put NOTIFICATIONAPI_CLIENT_ID
wrangler secret put NOTIFICATIONAPI_CLIENT_SECRET
```

### 2. Create Notification Templates in NotificationAPI Dashboard

You need to create the following notifications in your NotificationAPI dashboard. Each notification should have an EMAIL channel template configured.

#### Required Notifications:

1. **welcome_email**
   - **Notification ID:** `welcome_email`
   - **Description:** Welcome email sent to new users
   - **Merge Tags:**
     - `userName` (string): The user's name
     - `loginUrl` (string): URL to login page

2. **welcome_password_email**
   - **Notification ID:** `welcome_password_email`
   - **Description:** Welcome email with password setup link for admin-created users
   - **Merge Tags:**
     - `userName` (string): The user's name
     - `setPasswordUrl` (string): URL to set password
     - `loginUrl` (string): Same as setPasswordUrl

3. **booking_confirmation**
   - **Notification ID:** `booking_confirmation`
   - **Description:** Booking confirmation email sent after successful reservation
   - **Merge Tags:**
     - `customerName` (string): Customer's name
     - `hotelName` (string): Hotel name
     - `checkIn` (string): Check-in date
     - `checkOut` (string): Check-out date
     - `roomType` (string): Room type name
     - `totalAmount` (string): Total amount (formatted)
     - `bookingId` (string): Booking ID
     - `bookingUrl` (string): URL to view booking

4. **password_reset**
   - **Notification ID:** `password_reset`
   - **Description:** Password reset email with secure reset link
   - **Merge Tags:**
     - `resetUrl` (string): URL to reset password
     - `tokenExpiryDays` (number): Number of days until token expires
     - `userEmail` (string): User's email address

5. **notification**
   - **Notification ID:** `notification`
   - **Description:** Generic notification email for various system notifications
   - **Merge Tags:**
     - `subject` (string): Email subject
     - `message` (string): Main message content
     - `actionUrl` (string): Optional action URL
     - `actionText` (string): Optional action button text

### 3. Configure Email Settings in NotificationAPI Dashboard

1. Go to **Settings > Email Settings**
2. Configure your sending domain and verify it
3. Set up your default sender email address (e.g., noreply@racohotels.com)
4. Configure SPF and DKIM records for better deliverability

### 4. Customize Email Templates

For each notification, customize the email template in the NotificationAPI dashboard:

1. Go to **Notifications > [Notification Name] > Email Channel**
2. Use the visual editor or HTML editor to design your template
3. Insert merge tags using the syntax: `{{mergeTags.variableName}}`
4. Preview your templates with sample data
5. Save and publish the template

### 5. Template Design Recommendations

#### Brand Colors
```css
Primary: #1a365d
Secondary: #2d3748
Accent: #3182ce
Success: #38a169
Warning: #d69e2e
Danger: #e53e3e
Background: #f7fafc
```

#### Best Practices
- Keep subject lines under 50 characters
- Use clear call-to-action buttons
- Include unsubscribe links where appropriate
- Test emails across different email clients
- Use responsive design for mobile compatibility
- Include plain text alternatives

### 6. Testing

After setting up, test each email type:

```bash
# 1. Start the development server
yarn dev

# 2. Test password reset email
curl -X POST http://localhost:8787/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 3. Test welcome email (by creating a new user)
curl -X POST http://localhost:8787/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "role": "staff"
  }'
```

## Code Structure

### Configuration
- **`backend/src/config/mail.ts`**: Email configuration constants, notification IDs, and default settings

### Utilities
- **`backend/src/utils/mail.ts`**: Email sending functions using NotificationAPI

### Usage Example

```typescript
import { sendPasswordResetEmail } from './utils/mail';

// In your service/controller
await sendPasswordResetEmail(
  c, // AppContext
  'user@example.com',
  'https://yourapp.com/reset-password?token=xyz',
  7 // Token expiry in days
);
```

## Migration from Resend

The following changes were made during migration:

1. ✅ Removed `resend` package
2. ✅ Removed `react`, `react-dom`, and `@react-email/render` packages
3. ✅ Added `notificationapi-node-server-sdk` package
4. ✅ Removed TSX email templates (mail-templates.tsx)
5. ✅ Created centralized mail configuration (config/mail.ts)
6. ✅ Rewrote mail.ts to use NotificationAPI
7. ✅ Updated environment variable names
8. ✅ Updated type definitions for new environment variables

### Breaking Changes

- Email templates are now managed in NotificationAPI dashboard, not in code
- Environment variables changed from `EMAIL_API_KEY` to `NOTIFICATIONAPI_CLIENT_ID` and `NOTIFICATIONAPI_CLIENT_SECRET`
- Template customization now requires dashboard access

## Troubleshooting

### Common Issues

1. **"NotificationAPI credentials not configured" error**
   - Ensure `NOTIFICATIONAPI_CLIENT_ID` and `NOTIFICATIONAPI_CLIENT_SECRET` are set
   - Verify credentials are correct in NotificationAPI dashboard

2. **Emails not sending**
   - Check notification IDs match exactly between code and dashboard
   - Verify email channel is enabled for the notification
   - Check NotificationAPI dashboard logs for errors

3. **Merge tags not working**
   - Ensure merge tag names in code match template exactly
   - Use correct syntax in templates: `{{mergeTags.variableName}}`
   - Check for typos in merge tag names

4. **Email domain not verified**
   - Complete domain verification in NotificationAPI settings
   - Configure SPF and DKIM records
   - Wait for DNS propagation (up to 24 hours)

## Support

- **NotificationAPI Documentation**: [https://docs.notificationapi.com/](https://docs.notificationapi.com/)
- **NotificationAPI Support**: [support@notificationapi.com](mailto:support@notificationapi.com)
- **Dashboard**: [https://app.notificationapi.com/](https://app.notificationapi.com/)

## Advanced Features

NotificationAPI supports additional features you can leverage:

- **Multi-channel notifications**: SMS, Push, In-app notifications
- **User preferences**: Allow users to manage notification preferences
- **Scheduling**: Schedule notifications for later delivery
- **A/B testing**: Test different email templates
- **Analytics**: Track open rates, click rates, and conversions
- **Webhooks**: Receive delivery status updates
- **Localization**: Send emails in multiple languages

Refer to the NotificationAPI documentation for implementing these features.

