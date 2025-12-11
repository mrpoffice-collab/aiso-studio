# AISO Studio - Lead Generation User Guide

**Complete guide to finding, nurturing, and closing clients using AISO Studio**

---

## Table of Contents

1. [Overview](#overview)
2. [Two Ways to Get Leads](#two-ways-to-get-leads)
3. [Outbound: Finding Your Own Leads](#outbound-finding-your-own-leads)
4. [Inbound: Capturing Leads from Free Audit](#inbound-capturing-leads-from-free-audit)
5. [Working Your Pipeline](#working-your-pipeline)
6. [Sending Outreach Emails](#sending-outreach-emails)
7. [Creating Proposals](#creating-proposals)
8. [Closing the Deal](#closing-the-deal)
9. [Marketing Pages for Nurturing](#marketing-pages-for-nurturing)
10. [Weekly Sales Routine](#weekly-sales-routine)

---

## Overview

AISO Studio isn't just a content tool—it's a complete lead generation system for agencies. You can:

- **Find leads** with poor AI visibility scores
- **Capture leads** who use your free audit tool
- **Nurture leads** with automated email sequences
- **Close deals** with ROI-focused proposals

This guide walks you through the entire process.

---

## Two Ways to Get Leads

| Method | You Do | They Do | Best For |
|--------|--------|---------|----------|
| **Outbound** | Search for businesses, pitch them | Respond to your outreach | Agency owners who want control |
| **Inbound** | Drive traffic to free audit | Find you, enter email | Scaling with less manual work |

**Recommendation:** Use both. Outbound for immediate results, inbound for long-term pipeline.

---

## Outbound: Finding Your Own Leads

### Step 1: Go to Lead Discovery

**Location:** Dashboard → Lead Discovery (`/dashboard/leads`)

**Requirements:** Professional or Agency tier

### Step 2: Search for Prospects

1. Enter an **industry** (e.g., "dentist", "plumber", "real estate agent")
2. Enter a **location** (e.g., "Austin TX", "Chicago", "Miami FL")
3. Click **Search**

AISO will find businesses in that industry/location and run quick audits on their websites.

### Step 3: Review Results

For each business, you'll see:
- Business name and website
- AISO Score (0-100)
- Key issues identified

**Look for:** Scores below 70. These are your best prospects—their content isn't optimized for AI search.

### Step 4: Add to Pipeline

When you find a promising lead:
1. Click **Add to Pipeline**
2. The lead moves to your sales pipeline for tracking

### Step 5: Repeat

Build a list of 10-20 leads per week to keep your pipeline full.

---

## Inbound: Capturing Leads from Free Audit

### How It Works

When someone uses your free audit tool at `/audit`:

1. They enter their website URL
2. AISO runs the audit and shows their **overall score**
3. To see the **full breakdown**, they must:
   - Enter their email
   - Select: "This is my own site" OR "This is a client's site"
4. Their info is captured in your leads database
5. An automated email sequence begins

### The Email Sequence

**For "My own site" (Solo marketers):**
- Email 1 (Immediate): "Your AI Visibility Score Explained"
- Email 2 (Day 2): "3 Quick Fixes to Improve Your Score"
- Email 3 (Day 5): "Your Free Trial is Waiting"

**For "A client's site" (Agency folks):**
- Email 1 (Immediate): "Found a Sales Opportunity?"
- Email 2 (Day 2): "How to Pitch AI Search Optimization"
- Email 3 (Day 5): "Scale to 10x Content Output"

### Driving Traffic to Your Free Audit

Share your free audit link everywhere:
- Your website homepage
- Social media posts
- Email signatures
- Guest blog posts
- Paid ads

**Your link:** `https://aiso.studio/audit`

### Viewing Captured Leads

Captured leads are stored in your database. To process email sequences:

```
POST /api/admin/process-email-sequences
```

Set this up as a daily cron job to send pending emails automatically.

---

## Working Your Pipeline

### Step 1: Go to Pipeline

**Location:** Dashboard → Pipeline (`/dashboard/pipeline`)

**Requirements:** Professional or Agency tier

### Step 2: Understand the Stages

Your pipeline has these stages (Kanban-style):

| Stage | Meaning |
|-------|---------|
| **New** | Just added, not contacted yet |
| **Contacted** | You've sent first outreach |
| **Engaged** | They responded or showed interest |
| **Demo Scheduled** | Meeting booked |
| **Proposal Sent** | Formal proposal delivered |
| **Negotiating** | Discussing terms/pricing |
| **Won** | Deal closed! |
| **Lost** | Didn't convert (track why) |

### Step 3: Move Leads Through Stages

Drag and drop leads between stages as they progress. Keep your pipeline updated daily.

### Step 4: Track Activity

Click on any lead to:
- View their full audit results
- See contact history
- Add notes
- Generate proposals
- Send emails

---

## Sending Outreach Emails

### From the Pipeline

1. Click on a lead in your pipeline
2. Click **Send Email**
3. Choose a template or write custom

### Email Templates Available

AISO provides 5 email templates:

1. **Initial Outreach** - First contact, highlight their score
2. **Follow-up** - Haven't heard back
3. **Value Proposition** - Explain what you can do
4. **Case Study Share** - Social proof
5. **Closing** - Ask for the meeting/sale

### Best Practices

- **Subject lines:** Include their AISO score (e.g., "Your site scored 47/100 for AI search")
- **Personalization:** Reference specific issues from their audit
- **CTA:** One clear ask (reply, book call, view proposal)
- **Timing:** Tuesday-Thursday, 9am-11am local time

---

## Creating Proposals

### Generate a Proposal

1. Open a lead from your pipeline
2. Click **Generate Proposal**
3. AISO creates an ROI-focused proposal including:
   - Their current AISO score
   - Specific issues found
   - Projected improvement
   - Your pricing/packages
   - ROI calculation

### Customize Before Sending

Review and edit:
- Pricing (match your packages)
- Timeline
- Deliverables
- Terms

### Send or Export

- **Send directly** via email from AISO
- **Export as PDF** to attach elsewhere
- **Copy link** to a hosted version

---

## Closing the Deal

### What Converts Leads

Based on agency success patterns:

1. **Speed** - Respond within 24 hours of any engagement
2. **Specificity** - Reference THEIR audit, not generic pitches
3. **ROI focus** - Show the math on what they'll gain
4. **Social proof** - Share case studies of similar businesses
5. **Low friction** - Make it easy to say yes (trial, guarantee)

### Handling Objections

| Objection | Response |
|-----------|----------|
| "Too expensive" | Show ROI calculator, offer starter package |
| "We do SEO already" | AI search is different—show the score gap |
| "Not a priority" | "40% of search is moving to AI—when will it be?" |
| "Need to think about it" | "What questions can I answer?" + set follow-up |

### After They Say Yes

1. Move lead to **Won** in pipeline
2. Start onboarding (see Agency Guidebook)
3. Set up their first strategy in AISO
4. Deliver quick win in first week

---

## Marketing Pages for Nurturing

Use these pages to educate and convert leads:

### ROI Calculator
**URL:** `/roi-calculator`

Interactive tool showing agencies how much time/money they'll save. Share with leads who ask "is it worth it?"

### Case Studies
**URL:** `/case-studies`

Three agency success stories with real metrics:
- 10x content output
- 2x client base in 60 days
- +68% average client value

Share with leads who need social proof.

### Comparison Page
**URL:** `/compare`

AISO Studio vs. SurferSEO, Clearscope, MarketMuse, Frase. Shows why AISO is different (AI search focus, agency tools).

Share with leads comparing options.

---

## Weekly Sales Routine

### Monday: Prospecting (1-2 hours)

1. Go to Lead Discovery
2. Search 2-3 industry/location combinations
3. Add 10-15 leads with scores < 70 to pipeline
4. Tag leads by priority (score, business size)

### Tuesday: Outreach (1-2 hours)

1. Filter pipeline by "New" status
2. For each new lead:
   - Review their audit
   - Send personalized outreach email
   - Move to "Contacted"
3. Goal: Contact all new leads

### Wednesday: Follow-up (1 hour)

1. Filter pipeline by "Contacted" (3+ days ago)
2. Send follow-up email to non-responders
3. Move engaged leads forward

### Thursday: Nurture (1 hour)

1. Check "Engaged" and "Demo Scheduled" leads
2. Send case studies or ROI calculator links
3. Prepare for any scheduled calls

### Friday: Close (1-2 hours)

1. Generate proposals for hot leads
2. Send proposals with clear next steps
3. Follow up on pending proposals
4. Update pipeline with wins/losses
5. Review week's metrics

### Weekly Targets

| Metric | Target |
|--------|--------|
| New leads added | 10-15 |
| Outreach emails sent | 15-20 |
| Follow-ups sent | 10-15 |
| Proposals sent | 3-5 |
| Deals closed | 1-2 |

---

## Quick Reference

### Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| Free Audit | `/audit` | Capture inbound leads |
| Lead Discovery | `/dashboard/leads` | Find outbound leads |
| Pipeline | `/dashboard/pipeline` | Track all leads |
| ROI Calculator | `/roi-calculator` | Convince on value |
| Case Studies | `/case-studies` | Social proof |
| Comparison | `/compare` | Beat competitors |

### Tier Requirements

| Feature | Starter | Professional | Agency |
|---------|---------|--------------|--------|
| Free Audit (own use) | Yes | Yes | Yes |
| Lead Discovery | No | Yes | Yes |
| Pipeline | No | Yes | Yes |
| Proposal Generator | No | Yes | Yes |
| Email Templates | No | Yes | Yes |
| White-label PDFs | No | No | Yes |

### Email Sequence Timing

| Email | Solo Persona | Agency Persona |
|-------|--------------|----------------|
| 1 | Immediate | Immediate |
| 2 | Day 2 | Day 2 |
| 3 | Day 5 | Day 5 |

---

## Troubleshooting

### "Lead Discovery isn't showing results"

- Check your tier (needs Pro or Agency)
- Try different industry/location combinations
- Some niches have fewer online businesses

### "Emails aren't sending"

- Verify AWS SES is configured
- Check email sequence cron job is running
- Review `/api/admin/process-email-sequences` for errors

### "Pipeline is empty"

- Add leads from Lead Discovery
- Inbound leads from free audit go to `captured_leads` table, not pipeline (different systems)

### "Proposal generator not working"

- Ensure lead has a completed audit
- Check API keys are configured
- Try regenerating

---

## Next Steps

1. **Set up your weekly routine** - Block time on your calendar
2. **Add your first 10 leads** - Use Lead Discovery today
3. **Send your first outreach** - Don't overthink it, just start
4. **Share your free audit link** - Get inbound leads flowing
5. **Track your metrics** - What gets measured improves

---

*Questions? Check the Agency Guidebook for feature details or SPRINT-LAUNCH-TODO.md for testing checklists.*
