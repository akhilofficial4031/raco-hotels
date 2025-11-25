# NotificationAPI Setup Checklist

**Print this page and check off each item as you complete it!** ✓

---

## Step 1: Create NotificationAPI Account

- [ ] Go to [https://app.notificationapi.com/signup](https://app.notificationapi.com/signup)
- [ ] Sign up with your email
- [ ] Verify your email address
- [ ] Complete account setup

**Time Required:** ~2 minutes

---

## Step 2: Get API Credentials

- [ ] Log into NotificationAPI dashboard
- [ ] Navigate to **Settings** → **API Keys**
- [ ] Copy your **Client ID** (save it somewhere safe)
- [ ] Copy your **Client Secret** (save it somewhere safe)

**Time Required:** ~1 minute

---

## Step 3: Configure Environment Variables

### Development (Local)

- [ ] Open `backend/wrangler.toml`
- [ ] Find the `[vars]` section
- [ ] Update these lines:
```toml
NOTIFICATIONAPI_CLIENT_ID = "paste_your_client_id_here"
NOTIFICATIONAPI_CLIENT_SECRET = "paste_your_client_secret_here"
```
- [ ] Save the file

### Production

- [ ] Open terminal in `backend/` directory
- [ ] Run for Client ID:
```bash
wrangler secret put NOTIFICATIONAPI_CLIENT_ID --env production
```
- [ ] Paste your Client ID when prompted, press Enter
- [ ] Run for Client Secret:
```bash
wrangler secret put NOTIFICATIONAPI_CLIENT_SECRET --env production
```
- [ ] Paste your Client Secret when prompted, press Enter

**Time Required:** ~2 minutes

---

## Step 4: Configure Email Sending Domain

**Choose one option:**

### Option A: Skip Domain Setup (For Now - Testing Only)

**Choose this if you don't have a domain yet or want to test quickly.**

- [ ] Check this box to skip domain setup
- [ ] Emails will be sent from NotificationAPI's default domain
- [ ] **Warning:** Emails may go to spam folder
- [ ] **Note:** You can add a custom domain later when you purchase one

**Time Required:** 0 minutes (skip to Step 5)

---

### Option B: Configure Custom Domain (Recommended - Production Ready)

**Choose this if you have a domain (e.g., racohotels.com) purchased already.**

#### Add Domain

- [ ] In NotificationAPI dashboard, go to **Settings** → **Email Settings**
- [ ] Click **"Add Domain"** button
- [ ] Enter your domain (e.g., `racohotels.com`)
- [ ] Copy the DNS records shown (keep this page open)

#### Add DNS Records

**You'll need access to your domain's DNS settings (GoDaddy, Cloudflare, Namecheap, etc.)**

**SPF Record:**
- [ ] Open your DNS provider's dashboard
- [ ] Add new **TXT** record:
  - **Type:** TXT
  - **Name:** @ (or leave blank)
  - **Value:** `v=spf1 include:notificationapi.com ~all`
  - **TTL:** 3600 (or default)
- [ ] Save the record

**DKIM Record:**
- [ ] Add new **TXT** record:
  - **Type:** TXT
  - **Name:** `notificationapi._domainkey`
  - **Value:** (copy from NotificationAPI dashboard)
  - **TTL:** 3600 (or default)
- [ ] Save the record

#### Verify Domain

- [ ] Wait 10-15 minutes for DNS propagation
- [ ] Return to NotificationAPI dashboard
- [ ] Click **"Verify Domain"** button
- [ ] Confirm domain shows green checkmark (verified)
- [ ] Set default sender email: `noreply@racohotels.com`
- [ ] Save settings

**Time Required:** ~30-60 minutes (mostly waiting for DNS)

**Note:** DNS can take up to 24 hours to fully propagate, but usually works within 10-15 minutes.

---

**👉 I chose:** 
- [ ] Option A (No domain yet - testing)
- [ ] Option B (Have domain - production ready)

---

## Step 5: Install Dependencies

- [ ] Open terminal
- [ ] Navigate to backend directory:
```bash
cd backend
```
- [ ] Install dependencies:
```bash
yarn install
```
- [ ] Wait for installation to complete

**Time Required:** ~2 minutes

---

## Step 6: Test Email System (Development)

### Start Server

- [ ] In backend directory, run:
```bash
yarn dev
```
- [ ] Wait for "Ready on http://localhost:8787" message
- [ ] Keep this terminal window open

### Send Test Email

- [ ] Open a **new terminal window**
- [ ] Run test command:
```bash
curl -X POST http://localhost:8787/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-actual-email@example.com"}'
```
- [ ] Replace `your-actual-email@example.com` with your real email
- [ ] Press Enter

### Verify Email Received

- [ ] Check your email inbox (within 1-2 minutes)
- [ ] If not in inbox, check spam/junk folder
- [ ] Open the email
- [ ] Verify email formatting looks correct
- [ ] Verify sender shows your domain (if configured)
- [ ] Click the "Reset Password" button to verify link works

### Check Logs

- [ ] Check terminal for any error messages
- [ ] Log into NotificationAPI dashboard
- [ ] Go to **Logs** section
- [ ] Verify email shows as "delivered"

**Time Required:** ~5 minutes

---

## Step 7: Deploy to Production

### Deploy Application

- [ ] Stop development server (Ctrl+C in terminal)
- [ ] Ensure production secrets are set (from Step 3)
- [ ] Deploy:
```bash
yarn deploy
```
- [ ] Wait for deployment to complete
- [ ] Note the production URL shown

### Test Production

- [ ] Send test email to production URL:
```bash
curl -X POST https://your-production-url/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```
- [ ] Check your email inbox
- [ ] Verify email received successfully

### Monitor

- [ ] Check NotificationAPI dashboard **Logs**
- [ ] Verify no errors
- [ ] Confirm delivery status is "delivered"

**Time Required:** ~5 minutes

---

## ✅ Success Criteria

You're **100% complete** when all these are true:

- [ ] ✅ Account created and verified
- [ ] ✅ API credentials obtained
- [ ] ✅ Environment variables configured (dev & prod)
- [ ] ✅ Domain configured (or Option A chosen to skip)
- [ ] ✅ Dependencies installed successfully
- [ ] ✅ Test email received (check spam if no custom domain)
- [ ] ✅ Email formatting/styling looks correct
- [ ] ✅ Sender shows your domain or NotificationAPI default
- [ ] ✅ No errors in backend logs
- [ ] ✅ No errors in NotificationAPI dashboard logs
- [ ] ✅ Production deployment successful
- [ ] ✅ Production test email works

---

## 🆘 Troubleshooting

### Email Not Received?

- [ ] **Check spam/junk folder first** (especially without custom domain)
- [ ] Verify email address is correct (no typos)
- [ ] Check NotificationAPI dashboard logs for errors
- [ ] Verify credentials in environment variables
- [ ] Wait 2-3 minutes (delivery can take time)
- [ ] Try different email address
- [ ] If still issues, emails without custom domain often go to spam - this is normal

### Domain Verification Failed?

- [ ] Wait longer (DNS can take up to 24 hours)
- [ ] Double-check DNS records are exactly as shown
- [ ] Verify records saved correctly in DNS provider
- [ ] Try clicking "Verify" again after 15 minutes
- [ ] Check DNS propagation: [https://dnschecker.org/](https://dnschecker.org/)

### Deployment Errors?

- [ ] Verify you're in `backend/` directory
- [ ] Check Wrangler is installed: `wrangler --version`
- [ ] Verify secrets are set: `wrangler secret list --env production`
- [ ] Check for error messages in terminal
- [ ] Ensure Cloudflare authentication is working

### API Errors?

- [ ] Verify Client ID and Secret are correct (no extra spaces)
- [ ] Check credentials in NotificationAPI dashboard
- [ ] Regenerate credentials if needed (Settings → API Keys)
- [ ] Update environment variables with new credentials

---

## 📊 Time Summary

| Step | Time Required | Can Skip? |
|------|---------------|-----------|
| 1. Create Account | 2 min | ❌ No |
| 2. Get Credentials | 1 min | ❌ No |
| 3. Configure Env | 2 min | ❌ No |
| 4. Domain Setup | 0-60 min | ⚠️ Recommended (can skip for testing) |
| 5. Install Deps | 2 min | ❌ No |
| 6. Test | 5 min | ❌ No |
| 7. Deploy | 5 min | ❌ No |

**Total Time:** 
- **Without domain:** ~17 minutes
- **With domain:** ~47-77 minutes (mostly waiting for DNS)

---

## 📝 Notes Section

Use this space to write down important information:

**Client ID:**
```
_________________________________
```

**Client Secret:**
```
_________________________________
```

**Domain (if configured):**
```
_________________________________
```

**Sender Email:**
```
_________________________________
(or using NotificationAPI default)
```

**Production URL:**
```
_________________________________
```

**Date Completed:**
```
_________________________________
```

---

## 🎉 Congratulations!

Once all items are checked, your email system is fully operational!

**What You Can Do Now:**
- ✅ Send welcome emails to new users
- ✅ Send password reset emails
- ✅ Send booking confirmations
- ✅ Send any custom notifications
- ✅ Customize email templates by editing `mail-templates.ts`

**Need Help?**
- Documentation: `backend/CUSTOM_HTML_TEMPLATES.md`
- NotificationAPI Docs: [https://docs.notificationapi.com/](https://docs.notificationapi.com/)
- Dashboard: [https://app.notificationapi.com/](https://app.notificationapi.com/)

---

**Remember:** Templates are managed in code (`mail-templates.ts`), not in the dashboard! 🚀

