# Email Deliverability Fix for Clerk Sign-Up Emails

**Issue:** Investor/users with strict email security settings are not receiving sign-up emails from Clerk.

**Root Cause:** Emails are being sent from Clerk's shared email infrastructure (`@clerk.com` or `@accounts.dev`), which can be flagged by corporate email filters, especially for users with enhanced security.

---

## Solution Options (Ranked by Effectiveness)

### Option 1: Custom Email Domain (RECOMMENDED - Most Professional)

Use your own domain for sending emails instead of Clerk's default. This is the most professional and deliverable solution.

#### Steps:

1. **Go to Clerk Dashboard:**
   - Navigate to https://dashboard.clerk.com
   - Select your application (Content Command Studio)
   - Go to **Configure** → **Email & SMS**

2. **Set up Custom Email:**
   - Click **"Email"** tab
   - Scroll to **"Custom email"** section
   - Click **"Add custom email"**

3. **Choose Email Provider:**

   **Option A: Use Existing Email Service (Gmail, Outlook, etc.)**
   - Not recommended for production (rate limits, spam issues)

   **Option B: Use Resend (RECOMMENDED - Free tier available)**
   - Go to https://resend.com and sign up
   - Add your domain (e.g., `fireflygrove.app`)
   - Add DNS records to verify domain:
     ```
     Type: TXT
     Name: @
     Value: [Resend will provide this]

     Type: MX
     Name: @
     Value: [Resend will provide this]
     ```
   - Generate API key in Resend dashboard
   - In Clerk dashboard, select "Custom SMTP"
   - Enter Resend SMTP credentials:
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: [Your Resend API key]
     ```
   - Set "From" email: `noreply@fireflygrove.app`
   - Set "From" name: `AISO Studio`

   **Option C: Use SendGrid (Enterprise option)**
   - Similar setup to Resend
   - More expensive but higher deliverability

4. **Configure "From" Details:**
   ```
   From Name: AISO Studio
   From Email: noreply@fireflygrove.app
   Reply-To: support@fireflygrove.app (optional)
   ```

5. **Test:**
   - Send test email from Clerk dashboard
   - Try signing up with a test account
   - Check spam folder if not received
   - Verify email headers show your domain

#### Expected Result:
- Emails sent from `noreply@fireflygrove.app`
- Much higher deliverability
- Professional appearance
- Better spam score

---

### Option 2: Customize Clerk Email Templates (QUICK FIX)

Improve email content and branding without custom domain.

#### Steps:

1. **Go to Clerk Dashboard:**
   - Navigate to **Configure** → **Email & SMS**
   - Click **"Email"** tab

2. **Customize Templates:**
   - Click **"Email Templates"**
   - Select **"Verification code"** template
   - Click **"Edit"**

3. **Improve Content:**

   **Before (Default):**
   ```
   Subject: Verify your email
   Body: Your verification code is {{code}}
   ```

   **After (Improved):**
   ```
   Subject: Welcome to AISO Studio - Verify Your Email

   Body:
   Hi there!

   Welcome to AISO Studio, your AI-powered content optimization platform.

   Your verification code is: {{code}}

   This code expires in 10 minutes.

   Need help? Reply to this email or visit https://fireflygrove.app/support

   Best regards,
   The AISO Studio Team
   https://fireflygrove.app
   ```

4. **Update Application Name:**
   - Go to **Configure** → **Settings** → **General**
   - Update **Application Name** to "AISO Studio"
   - This appears in email headers and subject lines

5. **Save and Test:**
   - Save all changes
   - Test with a new sign-up attempt

#### Expected Result:
- Slightly better deliverability (more professional content)
- Clearer branding
- Still might be blocked by strict filters (sent from Clerk domain)

---

### Option 3: Add SPF/DKIM Records (If using custom domain)

If you've set up a custom email domain, improve deliverability with proper DNS authentication.

#### Steps:

1. **In Resend/SendGrid Dashboard:**
   - Go to domain verification section
   - Copy the SPF, DKIM, and DMARC records

2. **Add to Your DNS Provider (e.g., Cloudflare, Namecheap):**

   **SPF Record:**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:spf.resend.com ~all
   ```

   **DKIM Record:**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [Provided by Resend]
   ```

   **DMARC Record:**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@fireflygrove.app
   ```

3. **Wait for DNS Propagation:**
   - Can take 1-48 hours
   - Check status in Resend/SendGrid dashboard

4. **Verify in Email Provider:**
   - Domain should show as "Verified" with green checkmark

#### Expected Result:
- Near-perfect deliverability
- Passes spam filters
- Professional email authentication

---

### Option 4: Immediate Workaround (Ask Investor to Whitelist)

While you set up the permanent fix, ask the investor to whitelist Clerk emails.

#### Instructions to Send to Investor:

```
Hi [Investor Name],

Our sign-up emails are sent from our authentication provider (Clerk).
To ensure you receive the verification email, please:

1. Check your spam/junk folder for emails from:
   - @clerk.com
   - @clerk.accounts.dev
   - noreply@clerk.com

2. Add these to your safe senders list:
   - Right-click the email → "Mark as not spam"
   - Add sender to contacts or safe senders list

3. If still not receiving, try these alternative sign-up methods:
   - Use a personal email (Gmail, Outlook) temporarily
   - Sign up with OAuth (Google/Microsoft) if available

We're currently upgrading to our own email domain for better
deliverability. This will be resolved within 24-48 hours.

Thank you for your patience!

Best regards,
[Your Name]
```

---

## Recommended Implementation Plan

### Immediate (Today):
1. **Send whitelist instructions to investor** (Option 4)
2. **Customize Clerk email templates** (Option 2) - Takes 10 minutes
3. **Update application name in Clerk** to "AISO Studio"

### Short-term (This Week):
1. **Sign up for Resend** (free tier)
2. **Verify domain** `fireflygrove.app` in Resend
3. **Configure custom email in Clerk** (Option 1)
4. **Test thoroughly** with multiple email providers
5. **Add SPF/DKIM records** (Option 3)

### Long-term (Next Month):
1. **Monitor email deliverability metrics** in Resend dashboard
2. **Consider upgrading Resend plan** if volume increases
3. **Set up email templates** for transactional emails
4. **Add email logging** for debugging future issues

---

## Quick Setup: Resend (Step-by-Step)

### 1. Sign Up for Resend
- Go to https://resend.com
- Click "Get Started"
- Sign up with GitHub or email
- Free tier: 100 emails/day (plenty for early users)

### 2. Add Domain
- Click "Domains" in sidebar
- Click "Add Domain"
- Enter: `fireflygrove.app`
- Click "Add"

### 3. Add DNS Records
Resend will show you 3 records to add. Go to your DNS provider:

**If using Cloudflare:**
1. Log in to Cloudflare
2. Select `fireflygrove.app` domain
3. Click "DNS" → "Records"
4. Add the 3 records Resend provides
5. Wait 5-10 minutes for verification

**If using Namecheap/GoDaddy:**
1. Log in to domain registrar
2. Find DNS management
3. Add TXT, MX, and CNAME records
4. Save changes

### 4. Generate API Key
- In Resend dashboard, click "API Keys"
- Click "Create API Key"
- Name it: "Clerk Authentication"
- Copy the key (starts with `re_`)
- **Important:** Save this key securely - you can't see it again!

### 5. Configure Clerk
- Go to Clerk dashboard
- Navigate to "Email & SMS" → "Email" → "Custom Email"
- Select "Custom SMTP"
- Fill in:
  ```
  SMTP Host: smtp.resend.com
  SMTP Port: 587
  Username: resend
  Password: [Your Resend API key from step 4]
  From Email: noreply@fireflygrove.app
  From Name: AISO Studio
  ```
- Click "Save"

### 6. Test
- In Clerk dashboard, click "Send Test Email"
- Enter your email address
- Check inbox (should arrive in 1-2 seconds)
- Verify it shows from "AISO Studio <noreply@fireflygrove.app>"

---

## Troubleshooting

### "Domain not verified" in Resend
- DNS records can take up to 48 hours to propagate
- Use https://dnschecker.org to verify records are live
- Check for typos in DNS record values
- Make sure proxy is off in Cloudflare (orange cloud → gray cloud)

### Emails still going to spam
- Add SPF and DKIM records (Option 3 above)
- Warm up your domain by sending low volume initially
- Ask recipients to mark as "not spam"
- Check email content for spam trigger words

### "SMTP connection failed" in Clerk
- Verify port is 587 (not 25 or 465)
- Check API key is correct (no extra spaces)
- Ensure Resend account is active
- Try generating a new API key

### Emails not sending at all
- Check Resend dashboard for error logs
- Verify domain is verified (green checkmark)
- Check Clerk logs for error messages
- Ensure you haven't exceeded Resend free tier limits (100/day)

---

## Cost Comparison

| Provider | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Resend** | 100/day (3000/month) | $20/mo for 50k emails | Startups, easy setup |
| **SendGrid** | 100/day forever | $15/mo for 40k emails | Enterprise, high volume |
| **AWS SES** | 62k/month (if using EC2) | $0.10 per 1000 emails | Tech-savvy, cost-sensitive |
| **Postmark** | 100 test emails | $10/mo for 10k emails | Deliverability focus |

**Recommendation:** Start with Resend free tier. Upgrade when you exceed 100 signups/day.

---

## Verification Checklist

After implementing the fix, verify:

- [ ] Test email received from `noreply@fireflygrove.app` (not Clerk domain)
- [ ] Email doesn't land in spam folder
- [ ] Email branding shows "AISO Studio"
- [ ] Reply-to address is set (optional)
- [ ] SPF/DKIM records pass (check email headers)
- [ ] Domain shows as verified in Resend
- [ ] Investor can successfully sign up
- [ ] Test with multiple email providers (Gmail, Outlook, corporate)

---

## Next Steps

1. **Immediate:** Go to Clerk dashboard and update email templates (Option 2)
2. **Today/Tomorrow:** Set up Resend and custom email domain (Option 1)
3. **This Week:** Add SPF/DKIM records (Option 3)
4. **Ongoing:** Monitor Resend dashboard for deliverability metrics

---

**Questions or Issues?**

If you run into problems:
1. Check Resend dashboard logs for errors
2. Check Clerk dashboard logs for SMTP errors
3. Use https://www.mail-tester.com to test spam score
4. Contact Resend support (very responsive)

---

**TL;DR for Quick Fix:**

1. Sign up at https://resend.com
2. Add domain `fireflygrove.app` and verify with DNS records
3. Get API key from Resend
4. In Clerk dashboard → Email & SMS → Custom Email
5. Enter Resend SMTP details (host: smtp.resend.com, port: 587, username: resend, password: [API key])
6. Set from email to `noreply@fireflygrove.app`
7. Test and verify

**Time estimate:** 15-30 minutes (plus DNS propagation wait time)
