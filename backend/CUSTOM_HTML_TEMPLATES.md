# Custom HTML Email Templates

## ✅ Good News: You Don't Need the Dashboard!

The email system now uses **inline HTML templates** that are sent directly via NotificationAPI, bypassing the need for dashboard template creation.

## How It Works

### Architecture

```
Your Code → mail-templates.ts → NotificationAPI API → Email Sent
                                    (No Dashboard Templates Needed!)
```

Instead of:

1. ❌ Creating templates in NotificationAPI dashboard
2. ❌ Managing templates via web interface
3. ❌ Using `notificationId` to reference dashboard templates

We now:

1. ✅ Define HTML templates in `backend/src/utils/mail-templates.ts`
2. ✅ Send custom HTML directly via NotificationAPI's `email.html` parameter
3. ✅ Update templates by editing code (like before with Resend)

## File Structure

```
backend/src/utils/
├── mail.ts                  # Email sending functions
└── mail-templates.ts        # HTML/CSS template definitions
```

### `mail-templates.ts` - Your Custom Templates

This file contains all email templates as TypeScript functions that return `{ subject, html }`:

```typescript
export function renderWelcomeEmail(data: { userName: string; loginUrl?: string }): { subject: string; html: string } {
  // Returns HTML email with your custom design
}
```

**Available Templates:**

- `renderWelcomeEmail()` - Welcome email for new users
- `renderWelcomePasswordEmail()` - Welcome + password setup
- `renderBookingConfirmationEmail()` - Booking confirmation
- `renderPasswordResetEmail()` - Password reset
- `renderNotificationEmail()` - Generic notifications

### `mail.ts` - Email Sending Logic

Uses the templates and sends via NotificationAPI:

```typescript
export async function sendWelcomeEmail(c: AppContext, to: string, userName: string) {
  const { subject, html } = renderWelcomeEmail({ userName });

  return sendEmailWithCustomHTML(c, {
    userEmail: to,
    userId: to,
    subject,
    html,
  });
}
```

## Customizing Templates

### 1. Edit the HTML/CSS

Open `backend/src/utils/mail-templates.ts` and modify any template:

```typescript
export function renderWelcomeEmail(data: { userName: string; loginUrl?: string }): { subject: string; html: string } {
  const bodyContent = `
    <h2 style="color: #1a365d;">
      Hello ${data.userName}! 🎉
    </h2>
    
    <p style="font-size: 16px;">
      Your custom message here...
    </p>
    
    <a href="${data.loginUrl}" 
       style="background-color: #3182ce; color: white; padding: 14px 30px;">
      Click Here
    </a>
  `;

  return {
    subject: "Your Custom Subject",
    html: baseEmailTemplate(
      "#1a365d", // Header color
      "Title", // Header title
      "Subtitle", // Header subtitle
      bodyContent, // Main content
    ),
  };
}
```

### 2. Brand Colors

All templates use these consistent colors:

```typescript
const styles = {
  primary: "#1a365d", // Dark blue
  secondary: "#2d3748", // Dark gray
  accent: "#3182ce", // Blue
  success: "#38a169", // Green
  warning: "#d69e2e", // Yellow
  danger: "#e53e3e", // Red
  background: "#f7fafc", // Light gray
  white: "#ffffff",
  gray: "#718096",
  lightGray: "#e2e8f0",
};
```

### 3. Base Template Wrapper

All emails use `baseEmailTemplate()` which provides:

- Consistent header/footer
- Responsive design
- Brand styling
- Mobile-friendly layout

```typescript
function baseEmailTemplate(headerColor: string, headerTitle: string, headerSubtitle: string, bodyContent: string): string {
  // Returns complete HTML email structure
}
```

## Adding a New Template

### Step 1: Create Template Function

Add to `mail-templates.ts`:

```typescript
export function renderMyCustomEmail(data: { recipientName: string; customField: string }): { subject: string; html: string } {
  const bodyContent = `
    <h2 style="color: ${styles.primary};">
      Hi ${data.recipientName}!
    </h2>
    
    <p>${data.customField}</p>
  `;

  return {
    subject: "My Custom Email",
    html: baseEmailTemplate(styles.accent, "Custom Email", "Custom Subtitle", bodyContent),
  };
}
```

### Step 2: Create Sending Function

Add to `mail.ts`:

```typescript
import { renderMyCustomEmail } from "./mail-templates";

export async function sendMyCustomEmail(c: AppContext, to: string, recipientName: string, customField: string) {
  const { subject, html } = renderMyCustomEmail({
    recipientName,
    customField,
  });

  return sendEmailWithCustomHTML(c, {
    userEmail: to,
    userId: to,
    subject,
    html,
  });
}
```

### Step 3: Use It

```typescript
import { sendMyCustomEmail } from "./utils/mail";

await sendMyCustomEmail(c, "user@example.com", "John Doe", "Custom value here");
```

## Advanced Customization

### Adding Images

```typescript
<img src="https://your-cdn.com/logo.png"
     alt="Logo"
     style="max-width: 200px;">
```

### Responsive Tables

```typescript
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 10px; border: 1px solid #e2e8f0;">Item</td>
    <td style="padding: 10px; border: 1px solid #e2e8f0;">Value</td>
  </tr>
</table>
```

### Conditional Content

```typescript
${data.showButton ? `
  <a href="${data.url}">Click Here</a>
` : ''}
```

### Multiple Buttons

```typescript
<div style="text-align: center; margin: 30px 0;">
  <a href="${data.primaryUrl}"
     style="background-color: ${styles.primary}; color: white;
            padding: 14px 30px; margin-right: 10px;">
    Primary Action
  </a>

  <a href="${data.secondaryUrl}"
     style="background-color: white; color: ${styles.primary};
            padding: 14px 30px; border: 2px solid ${styles.primary};">
    Secondary Action
  </a>
</div>
```

## Testing Templates

### 1. Start Development Server

```bash
yarn dev
```

### 2. Trigger an Email

```bash
# Test password reset
curl -X POST http://localhost:8787/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### 3. Check Your Inbox

The email will arrive with your custom HTML styling!

## Benefits of This Approach

### vs Dashboard Templates:

- ✅ **Version Control**: Templates in git, track changes
- ✅ **Code Review**: Review template changes in PRs
- ✅ **IDE Support**: Syntax highlighting, autocomplete
- ✅ **Type Safety**: TypeScript checks your data
- ✅ **No Dashboard Login**: Everything in code
- ✅ **Faster Iteration**: Edit, save, test immediately
- ✅ **Team Collaboration**: No bottleneck on dashboard access

### vs React/TSX (Old Resend Approach):

- ✅ **No React Dependency**: Lighter bundle
- ✅ **Simpler**: Plain HTML/CSS strings
- ✅ **Faster Build**: No JSX compilation
- ✅ **Better Performance**: Direct HTML generation

## Email Best Practices

### 1. Use Inline Styles

```typescript
// ✅ Good
<p style="color: #333; font-size: 16px;">Text</p>

// ❌ Bad (won't work in emails)
<p class="text">Text</p>
```

### 2. Test Across Email Clients

- Gmail (Desktop & Mobile)
- Outlook
- Apple Mail
- Yahoo Mail

### 3. Keep It Simple

- Avoid complex layouts
- Use tables for structure
- Limit width to 600px
- Use web-safe fonts

### 4. Mobile First

```typescript
<p style="font-size: 16px; line-height: 1.6;">
  Readable text on mobile
</p>
```

### 5. Clear Call-to-Action

```typescript
<a href="${url}"
   style="display: inline-block;
          background-color: #3182ce;
          color: white;
          padding: 14px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;">
  Clear Action Text
</a>
```

## No Dashboard Setup Required!

You can start sending emails immediately:

1. ✅ `yarn install` - Install dependencies
2. ✅ Add `NOTIFICATIONAPI_CLIENT_ID` and `NOTIFICATIONAPI_CLIENT_SECRET` to environment
3. ✅ `yarn dev` - Start server
4. ✅ Send emails - Templates work out of the box!

**No template creation in dashboard needed!** 🎉

## Migration from Dashboard Templates (If You Created Them)

If you already created templates in the dashboard, you can safely:

- Delete them (we're not using `notificationId` anymore)
- Keep your account with just API credentials

The code now sends emails with inline HTML, completely bypassing dashboard templates.

## Support

- **Templates**: Edit `backend/src/utils/mail-templates.ts`
- **Sending**: Edit `backend/src/utils/mail.ts`
- **Config**: Edit `backend/src/config/mail.ts`
- **NotificationAPI Docs**: https://docs.notificationapi.com/

## Summary

✅ **HTML/CSS templates in code** (`mail-templates.ts`)  
✅ **Full control over design**  
✅ **No dashboard setup**  
✅ **Version controlled**  
✅ **TypeScript type safety**  
✅ **Instant deployment** (just git push)

**Edit templates like any other code file - it's that simple!** 🚀
