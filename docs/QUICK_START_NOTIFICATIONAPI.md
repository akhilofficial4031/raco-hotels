# Quick Start: NotificationAPI Email Setup

## 🚀 For Developers - Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
yarn install
```

### Step 2: Get NotificationAPI Credentials

1. Go to [https://app.notificationapi.com/signup](https://app.notificationapi.com/signup)
2. Create a free account
3. Navigate to **Settings → API Keys**
4. Copy your **Client ID** and **Client Secret**

### Step 3: Configure Environment Variables

**Option A: Update wrangler.toml (Local Development)**
```toml
[vars]
NOTIFICATIONAPI_CLIENT_ID = "your_client_id_here"
NOTIFICATIONAPI_CLIENT_SECRET = "your_client_secret_here"
```

**Option B: Create .env file**
```bash
NOTIFICATIONAPI_CLIENT_ID=your_client_id_here
NOTIFICATIONAPI_CLIENT_SECRET=your_client_secret_here
```

### Step 4: Create Email Templates in Dashboard

You need to create 5 notifications in the NotificationAPI dashboard:

| Notification ID | Template Name | Priority |
|----------------|---------------|----------|
| `welcome_email` | Welcome Email | Medium |
| `welcome_password_email` | Welcome + Set Password | High |
| `booking_confirmation` | Booking Confirmation | High |
| `password_reset` | Password Reset | High |
| `notification` | Generic Notification | Low |

#### Quick Template Creation:

1. **Log into NotificationAPI Dashboard** → [https://app.notificationapi.com/](https://app.notificationapi.com/)

2. **For each notification above:**
   - Click **"Create New Notification"**
   - Enter the **Notification ID** exactly as shown above
   - Give it a friendly name
   - Click **Save**

3. **Configure Email Channel:**
   - Click on the notification you just created
   - Enable **Email** channel
   - Click **"Design Email Template"**
   - Use the visual editor to create your template
   - Add merge tags (see below)
   - **Save & Publish**

### Step 5: Configure Merge Tags for Each Template

Copy these merge tag configurations for each template:

#### 1. welcome_email
```
{{mergeTags.userName}} - User's name
{{mergeTags.loginUrl}} - Login page URL
```

**Sample Template:**
```html
<h1>Welcome {{mergeTags.userName}}! 🎉</h1>
<p>Your account has been successfully created.</p>
<a href="{{mergeTags.loginUrl}}">Login to your account</a>
```

#### 2. welcome_password_email
```
{{mergeTags.userName}} - User's name
{{mergeTags.setPasswordUrl}} - Set password URL
```

**Sample Template:**
```html
<h1>Welcome {{mergeTags.userName}}! 🎉</h1>
<p>Please set your password to access your account.</p>
<a href="{{mergeTags.setPasswordUrl}}">Set Your Password</a>
<p>This link expires in 7 days.</p>
```

#### 3. booking_confirmation
```
{{mergeTags.customerName}} - Customer name
{{mergeTags.hotelName}} - Hotel name
{{mergeTags.checkIn}} - Check-in date
{{mergeTags.checkOut}} - Check-out date
{{mergeTags.roomType}} - Room type
{{mergeTags.totalAmount}} - Total amount
{{mergeTags.bookingId}} - Booking ID
{{mergeTags.bookingUrl}} - View booking URL
```

**Sample Template:**
```html
<h1>Booking Confirmed! 🎉</h1>
<p>Dear {{mergeTags.customerName}},</p>
<p>Your reservation at <strong>{{mergeTags.hotelName}}</strong> is confirmed!</p>
<ul>
  <li>Check-in: {{mergeTags.checkIn}}</li>
  <li>Check-out: {{mergeTags.checkOut}}</li>
  <li>Room: {{mergeTags.roomType}}</li>
  <li>Total: ${{mergeTags.totalAmount}}</li>
  <li>Booking ID: {{mergeTags.bookingId}}</li>
</ul>
<a href="{{mergeTags.bookingUrl}}">View Booking Details</a>
```

#### 4. password_reset
```
{{mergeTags.resetUrl}} - Reset password URL
{{mergeTags.tokenExpiryDays}} - Days until expiry
{{mergeTags.userEmail}} - User's email
```

**Sample Template:**
```html
<h1>Password Reset Request 🔐</h1>
<p>We received a request to reset your password for {{mergeTags.userEmail}}.</p>
<a href="{{mergeTags.resetUrl}}">Reset Your Password</a>
<p>This link expires in {{mergeTags.tokenExpiryDays}} days.</p>
<p>If you didn't request this, please ignore this email.</p>
```

#### 5. notification
```
{{mergeTags.subject}} - Email subject
{{mergeTags.message}} - Main message
{{mergeTags.actionUrl}} - Action button URL
{{mergeTags.actionText}} - Action button text
```

**Sample Template:**
```html
<h1>{{mergeTags.subject}}</h1>
<p>{{mergeTags.message}}</p>
<a href="{{mergeTags.actionUrl}}">{{mergeTags.actionText}}</a>
```

### Step 6: Configure Sender Email (Optional but Recommended)

1. Go to **Settings → Email Settings**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `racohotels.com`)
4. Follow the instructions to add DNS records:
   - **SPF Record**: Improves deliverability
   - **DKIM Record**: Prevents spoofing
5. Wait for DNS propagation (up to 24 hours)
6. Set your default sender email (e.g., `noreply@racohotels.com`)

**Note:** If you skip this step, emails will be sent from NotificationAPI's default domain, which may be marked as spam.

### Step 7: Test Your Setup

```bash
# Start the development server
yarn dev

# Test password reset email (in another terminal)
curl -X POST http://localhost:8787/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com"}'
```

Check your email inbox! 📧

## ✅ Verification Checklist

- [ ] NotificationAPI account created
- [ ] Client ID and Client Secret copied
- [ ] Environment variables configured
- [ ] All 5 notifications created in dashboard
- [ ] Email templates designed with merge tags
- [ ] Sender domain verified (optional)
- [ ] Test email received successfully

## 🎨 Optional: Use Pre-designed Templates

Want to save time? Use these professional template designs:

### Raco Hotels Brand Colors
```css
Primary: #1a365d
Secondary: #2d3748
Accent: #3182ce
Success: #38a169
```

### Recommended Template Structure
```html
<!-- Header -->
<div style="background-color: #1a365d; padding: 40px; text-align: center;">
  <h1 style="color: white;">Raco Hotels</h1>
</div>

<!-- Content -->
<div style="padding: 40px; font-family: Arial, sans-serif;">
  <!-- Your email content here -->
</div>

<!-- Footer -->
<div style="background-color: #f7fafc; padding: 30px; text-align: center;">
  <p style="color: #718096;">© 2024 Raco Hotels. All rights reserved.</p>
</div>
```

## 🆘 Troubleshooting

### Emails not sending?

1. **Check Dashboard Logs**
   - Go to NotificationAPI Dashboard → Logs
   - Look for error messages

2. **Verify Notification IDs**
   - Ensure IDs in dashboard match exactly:
     - `welcome_email`
     - `welcome_password_email`
     - `booking_confirmation`
     - `password_reset`
     - `notification`

3. **Check Environment Variables**
   ```bash
   # Verify variables are set
   echo $NOTIFICATIONAPI_CLIENT_ID
   echo $NOTIFICATIONAPI_CLIENT_SECRET
   ```

4. **Test Credentials**
   - In NotificationAPI dashboard, go to Settings → API Keys
   - Regenerate credentials if needed

### Emails going to spam?

1. **Verify Sender Domain**
   - Configure SPF and DKIM records
   - Use a custom sending domain

2. **Improve Content**
   - Avoid spam trigger words
   - Include unsubscribe link
   - Use proper HTML structure

## 📚 Next Steps

1. **Customize Templates**: Make emails match your brand
2. **Set Up Analytics**: Track email open rates
3. **Configure User Preferences**: Let users manage notifications
4. **Add SMS Channel**: Expand to SMS notifications
5. **Enable Push Notifications**: Add mobile push support

## 🔗 Helpful Links

- **Full Setup Guide**: [NOTIFICATIONAPI_SETUP.md](./NOTIFICATIONAPI_SETUP.md)
- **Migration Guide**: [MIGRATION_RESEND_TO_NOTIFICATIONAPI.md](./MIGRATION_RESEND_TO_NOTIFICATIONAPI.md)
- **NotificationAPI Docs**: [https://docs.notificationapi.com/](https://docs.notificationapi.com/)
- **Dashboard**: [https://app.notificationapi.com/](https://app.notificationapi.com/)

## 💡 Pro Tips

1. **Test with Real Data**: Use actual booking data when designing templates
2. **Mobile First**: Test templates on mobile devices
3. **Keep it Simple**: Shorter emails have higher engagement
4. **Use Variables**: Personalize with merge tags
5. **Monitor Metrics**: Check open and click rates regularly

---

**Need help?** Check the detailed setup guide in `NOTIFICATIONAPI_SETUP.md` or contact the team.

