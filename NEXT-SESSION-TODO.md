# Next Session TODO - Phase 3 & Beyond

**Date Created:** Nov 23, 2025
**Current Status:** Phase 2 Complete (Technical SEO Diagnostic UI Live)

---

## ✅ COMPLETED - Phase 1: AI Searchability Messaging
- [x] Technical SEO scanner library (14 checks)
- [x] Database schema (technical_seo_audits, agencies, agency_lead_referrals)
- [x] API routes (/api/audit/technical-seo)
- [x] Database methods for audit storage

## ✅ COMPLETED - Phase 2: User Interface
- [x] TechnicalSEOResults component
- [x] /dashboard/audit/technical-seo page
- [x] Dashboard integration with NEW FEATURE banner
- [x] Audit page button integration
- [x] Kim Kelley upgraded to Agency tier

---

## 🎯 PHASE 3: Agency Marketplace & Lead Flow

### 3.1 Agency Certification System
- [ ] Build admin dashboard for agency approvals
  - [ ] Create `/admin/agencies` page (list all applications)
  - [ ] Create `/admin/agencies/[id]` page (review single application)
  - [ ] Add approve/reject/suspend actions
  - [ ] Show agency stats (leads received, conversion rate)
- [ ] Add admin role to users table
- [ ] Create certification email templates:
  - [ ] Application received confirmation
  - [ ] Approval notification (you're certified!)
  - [ ] Rejection notification (with feedback)
  - [ ] Suspension notification

### 3.2 Agency Directory & Matching
- [ ] Build `/find-agency` public page
  - [ ] Search by vertical/specialization
  - [ ] Filter by services offered
  - [ ] Show certifications and stats
  - [ ] Display pricing ranges
- [ ] Create agency matching algorithm:
  - [ ] Match DIY user needs → agency specializations
  - [ ] Consider agency capacity (max_active_clients)
  - [ ] Check accepting_leads status
  - [ ] Score match quality
- [ ] Build `/dashboard/find-agency` for authenticated users
  - [ ] Show recommended agencies based on their niche
  - [ ] One-click request consultation

### 3.3 Lead Referral System
- [ ] Create lead notification system:
  - [ ] Email to agency when lead is referred
  - [ ] Email to user with agency contact info
  - [ ] In-app notification for agencies
- [ ] Build `/dashboard/agency/leads` page for agencies:
  - [ ] Show all referred leads (sent, accepted, declined, converted)
  - [ ] Accept/decline lead buttons
  - [ ] Mark lead as converted
  - [ ] Track commission status
- [ ] Create lead tracking API endpoints:
  - [ ] POST /api/agencies/leads/accept
  - [ ] POST /api/agencies/leads/decline
  - [ ] POST /api/agencies/leads/convert
  - [ ] GET /api/agencies/leads (list all)

### 3.4 Commission Tracking
- [ ] Build commission dashboard for agencies
  - [ ] Show pending commissions
  - [ ] Show paid commissions
  - [ ] Total revenue from referrals
- [ ] Create admin commission management:
  - [ ] Mark commissions as paid
  - [ ] Generate payment reports
  - [ ] Track commission history

---

## 📧 PHASE 4: Email Integration & Automation

### 4.1 Resend Setup
- [ ] Get Resend API key (resend.com)
- [ ] Add RESEND_API_KEY to Vercel environment variables
- [ ] Verify domain for sending emails (aiso.studio)
- [ ] Test email sending with lib/email.ts

### 4.2 Transactional Emails
- [ ] VIP welcome email (already created HTML)
  - [ ] Send to Kim Kelley
  - [ ] Template for future VIP upgrades
- [ ] Agency application received email
- [ ] Agency certification approval email
- [ ] Lead referral notification email
- [ ] Free audit → signup conversion email
- [ ] Weekly digest email (activity summary)

### 4.3 Email Templates
- [ ] Create React Email templates (professional approach):
  - [ ] Use @react-email/components
  - [ ] Build reusable layout component
  - [ ] Create branded email header/footer
- [ ] Alternative: Convert existing HTML emails to templates
  - [ ] vip-welcome-email-kim.html → template function
  - [ ] Add variable interpolation

### 4.4 Automated Email Triggers
- [ ] User signs up → welcome email (24h delay if no activity)
- [ ] Free audit completed → upgrade prompt email
- [ ] User inactive 7 days → re-engagement email
- [ ] Agency gets lead → immediate notification
- [ ] Lead converted → thank you + request testimonial

---

## 📊 PHASE 5: Analytics & Tracking

### 5.1 User Analytics Dashboard
- [ ] Create `/dashboard/analytics` page
  - [ ] Audits run this month vs last month
  - [ ] Content pieces created
  - [ ] Strategies generated
  - [ ] Lead searches performed
- [ ] Add usage charts (Chart.js or Recharts)
- [ ] Show tier limits and usage (e.g., "5/10 audits used")

### 5.2 Agency Analytics
- [ ] Create `/dashboard/agency/analytics` page
  - [ ] Leads received over time
  - [ ] Conversion rate trend
  - [ ] Revenue from referrals
  - [ ] Active clients count
- [ ] Show ROI metrics (time saved, revenue generated)

### 5.3 Admin Analytics
- [ ] Create `/admin/analytics` page
  - [ ] Total users by tier
  - [ ] Free audit conversion rate
  - [ ] Agency certification stats
  - [ ] Revenue projections
- [ ] Track product metrics:
  - [ ] Feature adoption rates
  - [ ] Most used features
  - [ ] Drop-off points in funnels

### 5.4 Event Tracking
- [ ] Add event tracking to key actions:
  - [ ] Audit started, completed
  - [ ] Strategy created
  - [ ] Lead searched
  - [ ] Agency application submitted
- [ ] Use PostHog or Mixpanel for event analytics
- [ ] Set up conversion funnels

---

## 🚀 PHASE 6: AI Search Ranking Tracker

### 6.1 Build Ranking Tracker
- [ ] Create API endpoint to check rankings:
  - [ ] Query ChatGPT Search for target keywords
  - [ ] Query Perplexity for target keywords
  - [ ] Query Google SGE for target keywords
  - [ ] Extract position for client's domain
- [ ] Store historical ranking data:
  - [ ] Create ranking_history table
  - [ ] Track position changes over time
  - [ ] Calculate velocity (improving/declining)

### 6.2 Ranking Dashboard
- [ ] Create `/dashboard/rankings` page
  - [ ] Add keywords to track
  - [ ] See current positions across AI engines
  - [ ] View ranking history charts
  - [ ] Get alerts when rankings change
- [ ] Show "before AISO" vs "after AISO" comparison

### 6.3 Competitive Analysis
- [ ] Track competitor rankings for same keywords
- [ ] Show market share in AI search results
- [ ] Identify content gaps vs competitors

---

## 🎨 PHASE 7: UI/UX Enhancements

### 7.1 Dashboard Improvements
- [ ] Add quick stats cards (total audits, avg score, etc.)
- [ ] Create recent activity feed
- [ ] Add keyboard shortcuts
- [ ] Implement dark mode toggle

### 7.2 Onboarding Flow
- [ ] Create multi-step onboarding wizard:
  - [ ] Step 1: What's your role? (agency/DIY/freelancer)
  - [ ] Step 2: What's your niche?
  - [ ] Step 3: Run your first audit
  - [ ] Step 4: See your first results
- [ ] Add product tour (use Shepherd.js or similar)
- [ ] Show tooltips on first visit

### 7.3 Mobile Responsiveness
- [ ] Test all pages on mobile devices
- [ ] Fix any mobile layout issues
- [ ] Optimize touch targets
- [ ] Test mobile audit workflow

---

## 🔒 PHASE 8: Security & Performance

### 8.1 Security Hardening
- [ ] Add rate limiting to API routes
- [ ] Implement CSRF protection
- [ ] Add input sanitization
- [ ] Security audit of auth flow
- [ ] Add API key management for agency integrations

### 8.2 Performance Optimization
- [ ] Implement caching for audit results
- [ ] Optimize database queries (add indexes)
- [ ] Lazy load heavy components
- [ ] Optimize images (use Next.js Image)
- [ ] Add loading skeletons

### 8.3 Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add performance monitoring
- [ ] Create health check endpoint
- [ ] Set up uptime monitoring

---

## 💰 PHASE 9: Monetization Features

### 9.1 Subscription Management
- [ ] Integrate Stripe for payments
- [ ] Create subscription plans page
- [ ] Add upgrade flow from trial → pro → agency
- [ ] Implement billing dashboard
- [ ] Add invoice history

### 9.2 Usage Limits
- [ ] Enforce tier limits (audits, strategies, etc.)
- [ ] Show usage warnings at 80% of limit
- [ ] Block actions when limit reached
- [ ] Prompt upgrade when blocked

### 9.3 Referral Program
- [ ] Create referral system for DIY users
- [ ] Give 1 month free for successful referral
- [ ] Track referral conversions
- [ ] Add referral dashboard

---

## 🤝 PHASE 10: Integrations

### 10.1 Content Platform Integrations
- [ ] WordPress plugin (push rewrites directly)
- [ ] Webflow integration
- [ ] Shopify app
- [ ] Squarespace integration

### 10.2 Marketing Tool Integrations
- [ ] Google Analytics integration (import data)
- [ ] Google Search Console integration
- [ ] Ahrefs API integration (keyword research)
- [ ] SEMrush integration

### 10.3 Agency Tools
- [ ] Zapier integration (connect to 5000+ apps)
- [ ] Slack notifications (lead alerts)
- [ ] White-label report export (PDF)
- [ ] API for custom integrations

---

## 📝 IMMEDIATE PRIORITIES FOR NEXT SESSION

### Must Do First:

**🔥 PRIORITY 1: AWS SES Email Integration for Lead Outreach**
User has AWS email approved - integrate email sending directly from pipeline!

- [ ] Create AWS SES client (`lib/aws-ses-client.ts`)
  - Send individual emails to leads
  - Use AWS SDK v3
  - Handle delivery status and bounces
- [ ] Add environment variables:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION` (likely us-east-1)
  - `AWS_SES_SENDER_EMAIL` (verified sender)
- [ ] Create email templates based on pain points:
  - Accessibility/WCAG violation template
  - Content gap template
  - SEO visibility template
  - Generic follow-up template
- [ ] UI: Add "Send Email" button in pipeline lead modal
  - Template selector dropdown
  - Preview email before sending
  - Populate from recommended pitch
- [ ] Database: Create `lead_emails` table
  - Track sent emails (timestamp, template, status)
  - Link to lead_id
  - Store delivery status
- [ ] API route: `POST /api/leads/[id]/send-email`
  - Validate user owns the lead
  - Send via AWS SES
  - Log to database
  - Update lead status to "contacted"

**Expected Outcome:** Users can send personalized outreach emails directly from the pipeline with one click!

---

1. **Send VIP email to Kim Kelley** (vip-welcome-email-kim.html is ready)
   - Get Resend API key
   - Add to Vercel environment variables
   - Send welcome email

2. **Build Agency Certification Flow** (Phase 3.1)
   - Admin dashboard to approve/reject agencies
   - Certification emails
   - This unlocks the entire agency marketplace

3. **Create Lead Referral System** (Phase 3.3)
   - Agency receives lead notifications
   - Agency can accept/decline leads
   - Track conversions
   - This completes the core revenue loop

### Quick Wins:
- Add usage stats to dashboard (simple counters)
- Create basic analytics page (audits per day chart)
- Build "Find Agency" public page (MVP version)

### Technical Debt:
- Add error tracking (Sentry)
- Implement rate limiting on API routes
- Add automated backups for database
- Write unit tests for critical functions

---

## 📋 NOTES FROM PREVIOUS SESSION

- Kim Kelley (kim@aliidesign.com) upgraded to Agency tier ✅
- User prefers PRODUCTION environment (always assume production)
- Database uses UUID for user_id (not INTEGER)
- Backup database before major changes
- Created safety checklist and reminders
- Freedom-first pricing model (unlimited everything for agency tier)

### Latest Session (2025-01-24): AISO Marketing Machine Complete
- ✅ Built complete WCAG + AISO scoring system for lead discovery
- ✅ Integrated Serper API for search visibility metrics
- ✅ Created comprehensive user workflow documentation
- ⚠️ **ISSUE:** User's SERPER_API_KEY not working (need to verify it's in .env.local and restart dev server)
- 🎯 **NEXT PRIORITY:** AWS SES email integration (user has AWS email approved)

---

## 🎯 SUCCESS METRICS

### By End of Phase 3:
- [ ] At least 5 agencies certified
- [ ] Lead referral flow tested end-to-end
- [ ] First agency receives and accepts a lead

### By End of Phase 4:
- [ ] All transactional emails automated
- [ ] Email open rate > 40%
- [ ] Click-through rate > 15%

### By End of Phase 5:
- [ ] User analytics dashboard live
- [ ] Agency analytics showing ROI
- [ ] Admin can see key metrics at a glance

---

**Remember:** Always assume PRODUCTION unless explicitly told otherwise. Back up database before major schema changes. Test authentication flow after any auth-related changes.
