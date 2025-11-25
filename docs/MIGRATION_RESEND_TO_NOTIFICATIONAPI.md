# Migration: Resend → NotificationAPI

**Date:** November 15, 2025  
**Status:** ✅ Complete

## Overview

Successfully migrated the Raco Hotels backend email system from Resend to NotificationAPI. This migration provides better multi-channel notification support, centralized template management, and improved scalability.

## Changes Made

### 1. Package Dependencies

**Removed:**
- `resend` (^3.5.0)
- `react` (^18.3.1) - No longer needed for email templates
- `react-dom` (^18.3.1) - No longer needed for email templates
- `@react-email/render` (^1.4.0) - No longer needed for email templates

**Added:**
- `notificationapi-node-server-sdk` (^2.3.1)

### 2. File Changes

#### Created Files:
- ✅ `backend/src/config/mail.ts` - Centralized email configuration with notification IDs and constants
- ✅ `backend/NOTIFICATIONAPI_SETUP.md` - Comprehensive setup guide
- ✅ `backend/MIGRATION_RESEND_TO_NOTIFICATIONAPI.md` - This migration document

#### Modified Files:
- ✅ `backend/src/utils/mail.ts` - Rewrote to use NotificationAPI SDK
- ✅ `backend/package.json` - Updated dependencies
- ✅ `backend/env.example` - Updated environment variable examples
- ✅ `backend/wrangler.toml` - Updated environment variables
- ✅ `backend/src/types/index.ts` - Updated AppBindings interface

#### Deleted Files:
- ✅ `backend/src/utils/mail-templates.tsx` - Templates now managed in NotificationAPI dashboard

### 3. Environment Variables

**Old:**
```
EMAIL_API_KEY=re_xxxxx
```

**New:**
```
NOTIFICATIONAPI_CLIENT_ID=your_client_id
NOTIFICATIONAPI_CLIENT_SECRET=your_client_secret
```

### 4. Configuration Structure

#### New Mail Configuration (`config/mail.ts`)

```typescript
// Notification IDs
export const NOTIFICATION_IDS = {
  WELCOME_EMAIL: "welcome_email",
  WELCOME_PASSWORD_EMAIL: "welcome_password_email",
  BOOKING_CONFIRMATION: "booking_confirmation",
  PASSWORD_RESET: "password_reset",
  NOTIFICATION: "notification",
};

// Email defaults
export const EMAIL_CONFIG = {
  DEFAULT_FROM_NAME: "Raco Hotels",
  DEFAULT_FROM_EMAIL: "noreply@racohotels.com",
  DEFAULT_REPLY_TO: "support@racohotels.com",
  PASSWORD_RESET_TOKEN_EXPIRY_DAYS: 7,
};
```

### 5. API Changes

The email sending functions maintain the same signatures for backward compatibility:

```typescript
// These functions still work the same way
sendWelcomeEmail(c, email, userName)
sendWelcomePasswordEmail(c, email, userName, setPasswordUrl)
sendBookingConfirmation(c, email, customerName, bookingDetails)
sendPasswordResetEmail(c, email, resetUrl, tokenExpiryDays)
sendNotificationEmail(c, email, subject, message, actionUrl, actionText)
```

**Internal changes:**
- Templates are no longer rendered from TSX components
- Templates are now managed in NotificationAPI dashboard
- Merge tags are passed to NotificationAPI for template variable replacement

## Architecture Benefits

### Before (Resend)
- ✗ Templates defined in code (TSX files)
- ✗ Required React for email rendering
- ✗ Template changes required code deployment
- ✗ Single channel (email only)
- ✗ Limited analytics and tracking

### After (NotificationAPI)
- ✓ Templates managed in dashboard (no code changes)
- ✓ No React dependencies needed
- ✓ Template updates without deployment
- ✓ Multi-channel support (email, SMS, push, in-app)
- ✓ Built-in analytics and user preferences
- ✓ Advanced features (scheduling, A/B testing, webhooks)

## Template Migration

All 5 email templates need to be recreated in NotificationAPI dashboard:

| Template Name | Notification ID | Status | Merge Tags |
|--------------|----------------|--------|------------|
| Welcome Email | `welcome_email` | ⏳ To Create | userName, loginUrl |
| Welcome with Password | `welcome_password_email` | ⏳ To Create | userName, setPasswordUrl, loginUrl |
| Booking Confirmation | `booking_confirmation` | ⏳ To Create | customerName, hotelName, checkIn, checkOut, roomType, totalAmount, bookingId, bookingUrl |
| Password Reset | `password_reset` | ⏳ To Create | resetUrl, tokenExpiryDays, userEmail |
| Generic Notification | `notification` | ⏳ To Create | subject, message, actionUrl, actionText |

### Template Design Guidelines

The original email templates used these design patterns:

**Brand Colors:**
```css
Primary: #1a365d
Secondary: #2d3748
Accent: #3182ce
Success: #38a169
Warning: #d69e2e
Danger: #e53e3e
Background: #f7fafc
```

**Layout:**
- Centered 600px max-width container
- Header with brand colors
- Clear call-to-action buttons
- Responsive design
- Footer with company information

Refer to the deleted `mail-templates.tsx` in git history for detailed design reference.

## Testing Checklist

After migration, test the following:

- [ ] Welcome email (new user registration)
- [ ] Welcome with password email (admin creates user)
- [ ] Booking confirmation email
- [ ] Password reset email
- [ ] Generic notification email

### Test Commands

```bash
# 1. Install new dependencies
cd backend
yarn install

# 2. Update environment variables
# Add to .env or wrangler.toml

# 3. Create templates in NotificationAPI dashboard
# Follow NOTIFICATIONAPI_SETUP.md

# 4. Test password reset
curl -X POST http://localhost:8787/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Rollback Plan

If issues arise, rollback by:

1. Revert `package.json` changes
2. Restore `mail-templates.tsx` from git history
3. Revert `mail.ts` to previous version
4. Restore old environment variables
5. Run `yarn install`

```bash
# Quick rollback
git checkout HEAD~1 -- backend/package.json backend/src/utils/mail.ts backend/src/utils/mail-templates.tsx
yarn install
```

## Post-Migration Tasks

1. **Configure NotificationAPI Dashboard**
   - [ ] Create account and get credentials
   - [ ] Add environment variables to production
   - [ ] Create all 5 notification templates
   - [ ] Configure email sending domain
   - [ ] Set up SPF/DKIM records
   - [ ] Test all email types

2. **Update Documentation**
   - [x] Create setup guide (NOTIFICATIONAPI_SETUP.md)
   - [x] Create migration document (this file)
   - [ ] Update main README if needed
   - [ ] Update deployment documentation

3. **Monitor & Validate**
   - [ ] Check email delivery rates
   - [ ] Monitor NotificationAPI dashboard for errors
   - [ ] Validate all merge tags work correctly
   - [ ] Confirm email formatting across clients

## Deployment Steps

### Development
```bash
# 1. Install dependencies
yarn install

# 2. Update wrangler.toml [vars]
NOTIFICATIONAPI_CLIENT_ID = "dev_client_id"
NOTIFICATIONAPI_CLIENT_SECRET = "dev_client_secret"

# 3. Start development server
yarn dev
```

### Production
```bash
# 1. Set production secrets
wrangler secret put NOTIFICATIONAPI_CLIENT_ID --env production
wrangler secret put NOTIFICATIONAPI_CLIENT_SECRET --env production

# 2. Deploy
yarn deploy
```

## Breaking Changes

⚠️ **Important for other developers:**

1. **Environment Variables Changed**
   - Old: `EMAIL_API_KEY`
   - New: `NOTIFICATIONAPI_CLIENT_ID` and `NOTIFICATIONAPI_CLIENT_SECRET`
   - Action: Update your local `.env` or `wrangler.toml`

2. **Templates No Longer in Code**
   - Templates are now managed in NotificationAPI dashboard
   - Template changes don't require code deployment
   - Access to dashboard required for template editing

3. **React Dependencies Removed**
   - If you were importing React for other reasons, add it back
   - Email rendering no longer uses React

## Support & Resources

- **Setup Guide**: `backend/NOTIFICATIONAPI_SETUP.md`
- **NotificationAPI Docs**: https://docs.notificationapi.com/
- **Dashboard**: https://app.notificationapi.com/
- **Support**: support@notificationapi.com

## Timeline

| Date | Milestone |
|------|-----------|
| Nov 15, 2025 | ✅ Code migration completed |
| TBD | ⏳ NotificationAPI account setup |
| TBD | ⏳ Template creation in dashboard |
| TBD | ⏳ Production deployment |
| TBD | ⏳ Full testing and validation |

## Conclusion

The migration to NotificationAPI provides a more robust, scalable, and maintainable email notification system. The centralized template management and multi-channel support will enable faster iteration and better user communication in the future.

**Next Steps:**
1. Review this migration document
2. Follow the setup guide in `NOTIFICATIONAPI_SETUP.md`
3. Create templates in NotificationAPI dashboard
4. Test all email types
5. Deploy to production

