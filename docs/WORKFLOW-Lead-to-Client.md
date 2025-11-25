# AISO Marketing Machine: Complete Workflow
## From Batch Discovery to Client Email

This guide walks through the complete workflow of using the AISO Marketing Machine to discover, qualify, and reach out to potential clients.

---

## Overview

**Total Time:** 15-30 minutes for batch discovery + 5 minutes per outreach email
**Tools Used:** Batch Discovery, Pipeline View, Email Client
**Outcome:** Qualified leads with ready-to-send personalized pitches

---

## Step 1: Start Batch Discovery

### Navigate to Batch Discovery
1. Go to **Dashboard > Leads > Batch Discovery**
2. You'll see the batch discovery interface with industry/location inputs

### Configure Your Search
Fill in the discovery parameters:

```
Industry: dentist
City: Austin
State: TX
Target Count: 10
Filter Range: sweet-spot (45-75 score)
```

**Filter Range Options:**
- **Sweet Spot (45-75)**: Best leads - need help but have foundation
- **High (76+)**: Already strong, harder to sell
- **Low (0-44)**: Too much work needed
- **All**: No filtering

### Start the Batch Job
1. Click **"Start Batch Discovery"**
2. You'll see a confirmation: *"Batch job started! Processing in background..."*
3. The job is now running via Inngest (background worker)

### What Happens Behind the Scenes
For each business found, the system:
1. **Searches** using Brave API (20 businesses at a time)
2. **Scores website** for SEO, content, design, speed
3. **Runs WCAG audit** via Playwright + axe-core
4. **Gets search visibility** via Serper API
5. **Calculates AISO fit score** (0-100)
6. **Identifies pain points** (content, WCAG, SEO)
7. **Generates personalized pitch**
8. **Saves to pipeline** if it matches your filter

---

## Step 2: Monitor Progress

### Check Batch Status
1. Scroll down to **"Recent Batch Jobs"** on the Batch Discovery page
2. You'll see your job with:
   - Status: `processing` → `completed`
   - Progress: `5/10 leads found`
   - Businesses searched: `40`
   - Time elapsed

### Expected Timeline
- **10 leads**: ~10-15 minutes
- **25 leads**: ~20-30 minutes
- **50 leads**: ~45-60 minutes

**Why it takes time:**
- WCAG audits require full page loads (15-30 sec per site)
- Serper API calls for search visibility
- Quality filtering to find sweet-spot leads

---

## Step 3: Review Leads in Pipeline

### Navigate to Pipeline
1. Go to **Dashboard > Pipeline**
2. You'll see all discovered leads sorted by AISO score

### Understanding the Lead Table

Each lead shows:

#### Business Column
```
🏢 Austin Family Dental
🔥 HOT (AISO Score: 78)
💡 12 critical accessibility violations
$449/mo opportunity
```

**Badge Colors:**
- 🔥 **HOT** (red): AISO Score 70+ — Close in days
- **WARM** (yellow): AISO Score 40-69 — Close in 1-2 weeks
- **COLD** (blue): AISO Score <40 — 2+ months nurture

#### Score Column
```
Overall: 58  (SEO + Content + Design)
AISO: 78     (Opportunity score for AISO.studio)
WCAG: 42     (Accessibility compliance)
  [5 CRITICAL] ← Red flag for legal risk
```

#### Key Indicators
- **Critical WCAG violations** = Legal urgency (ADA lawsuits)
- **Low ranking keywords** = SEO opportunity
- **No blog** = Content marketing gap
- **High AISO score** = Perfect fit for AISO.studio

---

## Step 4: Deep Dive on a Lead

### Click on a Lead
Opens the detailed modal with complete analysis:

### 1. AISO Opportunity Score Section
```
┌─────────────────────────────────────────┐
│  AISO Opportunity Score        78       │
│  Estimated Value: $449/mo               │
│  Time to Close: immediate               │
│                                         │
│  PRIMARY PAIN POINT:                    │
│  💡 12 critical accessibility violations│
│                                         │
│  SECONDARY PAIN POINTS:                 │
│  • No content marketing strategy        │
│  • Poor search engine visibility        │
└─────────────────────────────────────────┘
```

**What this tells you:**
- **78 = HOT lead** — They have multiple urgent issues
- **$449/mo** — They can afford premium pricing
- **Immediate** — Close within days if you act fast
- **Primary pain point** — Lead with accessibility (legal urgency)

### 2. Accessibility (WCAG) Score Section
```
┌─────────────────────────────────────────┐
│  ♿ Accessibility (WCAG) Score   42     │
│                                         │
│  Violations Breakdown:                  │
│  Critical: 12   Serious: 23             │
│  Moderate: 45   Minor: 18               │
│  Total: 98                              │
└─────────────────────────────────────────┘
```

**Why this matters:**
- **Critical violations** = Legal liability (ADA lawsuits are $10K-$50K+)
- **Google SEO penalty** = Accessibility affects rankings
- **AISO differentiator** = Your content meets WCAG 2.1 AA automatically

### 3. Search Visibility Section
```
┌─────────────────────────────────────────┐
│  🔍 Search Visibility                   │
│                                         │
│  Ranking Keywords: 8                    │
│  Avg Search Position: 47                │
│  Est. Organic Traffic: 120/mo          │
└─────────────────────────────────────────┘
```

**Translation:**
- Only ranking for 8 keywords (competitors rank for 100+)
- Average position is page 5 (nobody goes there)
- Getting ~120 visitors/month (could be 5,000+)

### 4. Recommended Pitch
```
┌─────────────────────────────────────────┐
│  💬 Recommended Pitch                   │
│                                         │
│  "Austin Family Dental - I ran an      │
│  accessibility audit and found 12      │
│  critical WCAG violations. This        │
│  affects SEO rankings AND opens you    │
│  to ADA lawsuits. AISO's content       │
│  automatically meets WCAG 2.1 AA       │
│  standards. Can I send you the full    │
│  report?"                              │
└─────────────────────────────────────────┘
```

**This pitch is pre-generated based on:**
- Their specific pain points
- Their AISO score/urgency
- Industry and location
- Compliance risks they face

---

## Step 5: Craft Your Outreach Email

### Option A: Use the Recommended Pitch (Quick)

**Subject:** Accessibility Audit for Austin Family Dental

**Body:**
```
Hi [Contact Name],

I ran an accessibility audit on austinfamilydental.com and found 12 critical WCAG violations. This affects your SEO rankings AND opens you to ADA lawsuits (which average $10K-$50K in settlements).

The good news: This is fixable, and it's actually a huge SEO opportunity.

AISO.studio publishes SEO-optimized content that automatically meets WCAG 2.1 AA standards. We can help you:

✅ Fix accessibility issues through compliant content
✅ Improve search rankings (you're only ranking for 8 keywords vs competitors' 100+)
✅ Protect against ADA lawsuits

Can I send you the full accessibility report? It's eye-opening.

Best,
[Your Name]

P.S. - We offer a 7-day free trial, no credit card needed.
```

### Option B: Customize Based on Pain Points

If **primary pain point = "No content marketing strategy"**:

**Subject:** Quick question about [Business Name]'s blog

**Body:**
```
Hi [Contact Name],

I noticed [Business Name] doesn't have a blog. In the dental industry, businesses that publish consistent content get 3-5x more organic leads than those that don't.

AISO.studio automates this entirely:
• 12 SEO-optimized articles per month
• Automatically meets accessibility standards
• Zero effort on your part

Your competitors in Austin are ranking for 100+ keywords. You're at 8.

Want to see how this would look for your practice? I can send you a sample content plan.

Best,
[Your Name]
```

If **primary pain point includes "critical accessibility violations"**:

**Lead with legal urgency** (use recommended pitch as-is)

If **primary pain point = "Poor search engine visibility"**:

**Subject:** [Business Name] only ranking for 8 keywords?

**Body:**
```
Hi [Contact Name],

I ran a search analysis on [domain] and saw you're only ranking for 8 keywords. Your top competitors in [City] are ranking for 100+.

This means you're missing out on thousands of potential customers searching for [industry] services every month.

AISO.studio publishes 12 SEO-optimized articles/month that target high-value keywords in your industry. Our clients typically see:

📈 5-10x increase in ranking keywords within 90 days
📈 300-500% more organic traffic
📈 Significantly more qualified leads

Want to see a keyword gap analysis? I can show you exactly what keywords you're missing.

Best,
[Your Name]
```

---

## Step 6: Send and Track

### Find Contact Information

**From the lead details:**
```
Email: info@austinfamilydental.com
Phone: (512) 555-1234
Address: 123 Main St, Austin, TX 78701
```

**If email is missing:**
1. Google: `[Business Name] contact`
2. Check their website's contact page
3. Use tools like Hunter.io for `@domain.com` emails
4. LinkedIn search for owner/marketing manager

### Send the Email

**Best practices:**
- ✅ Send from your business email (not Gmail)
- ✅ Personalize the greeting with their actual name
- ✅ Keep it under 150 words
- ✅ Single clear call-to-action
- ✅ Send Tuesday-Thursday 10am-2pm (best response rates)

### Track in Pipeline

1. Click on the lead in Pipeline
2. Click **"Update Status"**
3. Change from `new` → `contacted`
4. Add note: *"Sent accessibility audit email on [date]"*

---

## Step 7: Follow-Up Strategy

### Timeline

**Day 1**: Send initial email
**Day 3**: Follow-up #1 (if no response)
**Day 7**: Follow-up #2 with value-add
**Day 14**: Final follow-up or move to nurture

### Follow-Up #1 (Day 3)

**Subject:** Re: Accessibility Audit for Austin Family Dental

**Body:**
```
Hi [Name],

Following up on my email from Tuesday about the 12 critical accessibility violations I found on your site.

Quick question: Are you aware of the recent surge in ADA website lawsuits? Over 4,000 were filed last year, with dental practices being a top target.

I'd love to send you the full audit report — it breaks down exactly which violations pose the highest legal risk.

Would that be helpful?

Best,
[Your Name]
```

### Follow-Up #2 (Day 7) — Value-Add

**Subject:** Free WCAG compliance checklist for dental practices

**Body:**
```
Hi [Name],

I put together a compliance checklist specifically for dental practices after seeing how many are at risk.

It's yours free — no strings attached. Just wanted to help.

[Link to checklist or PDF]

If you're interested in fixing these issues on your site, let me know. AISO can handle it automatically through our content platform.

Best,
[Your Name]
```

### Follow-Up #3 (Day 14) — Final

**Subject:** Closing the loop

**Body:**
```
Hi [Name],

I know you're busy, so I'll keep this short.

If accessibility compliance isn't a priority right now, no worries. But if it ever becomes urgent (or if you get hit with a lawsuit), we're here to help.

I'll check back in 3 months.

Best,
[Your Name]
```

---

## Step 8: When They Respond

### Positive Response Signals

**"Can you send me more info?"**
→ Send case studies + pricing

**"What's this cost?"**
→ "$299-$449/mo depending on volume. Want a custom quote?"

**"We already have a marketing agency"**
→ "We're not replacing them — we're adding WCAG-compliant content that protects you legally AND helps SEO"

**"Can we see a sample?"**
→ Send 2-3 sample blog posts from their industry

### Move to Demo/Sales Call

Once they're engaged:

1. **Schedule 15-min call** (not 30, not 60)
2. **Come prepared** with their specific data:
   - Their WCAG violations
   - Their ranking keyword gap
   - Competitor analysis
3. **Show, don't tell**: Demo the AISO platform
4. **Offer free trial**: 7 days, no credit card

---

## Success Metrics

### What to Track

**Per Batch:**
- Leads discovered: 10
- Hot leads (70+): 3
- Warm leads (40-69): 5
- Cold leads (<40): 2

**Per Outreach:**
- Emails sent: 10
- Response rate: 30% (3 responses)
- Positive responses: 20% (2 interested)
- Booked demos: 10% (1 demo)
- Closed deals: 5% (1 sale every 20 leads)

### ROI Calculation

**Batch discovery cost:**
- Brave API: $0.05 per lead
- Serper API: $0.10 per lead
- Playwright hosting: $0.02 per lead
- **Total: ~$0.17 per qualified lead**

**If you close 1 in 20:**
- Cost: 20 leads × $0.17 = $3.40
- Revenue: $299-$449/mo AISO subscription
- **ROI: 8,800% - 13,200%** (first month)

---

## Tips for Maximum Conversion

### 1. Lead with Urgency
**Critical WCAG violations = legal risk** is the strongest angle. Use it when available.

### 2. Use Specifics
Don't say "your website has issues"
Say "I found 12 critical accessibility violations"

### 3. Tie to Money
"These violations are costing you ~$2,000/mo in lost organic traffic"

### 4. Social Proof
"We help 50+ dental practices with this exact issue"

### 5. Low Friction
"7-day free trial, no credit card" removes the risk

### 6. Multi-Channel
Email + LinkedIn message + phone call = 3x response rate

---

## Advanced: Automation Ideas

### Email Sequences (Future)
Set up automated sequences in the platform:
1. Day 0: Initial pitch
2. Day 3: Follow-up
3. Day 7: Value-add
4. Day 14: Final touch

### Slack Notifications
Get notified when:
- Hot lead (70+) is discovered
- Lead responds to email
- Demo is booked

### Integration with CRM
Sync pipeline leads to:
- HubSpot
- Salesforce
- Pipedrive

---

## Troubleshooting

### "I'm not getting responses"

**Check:**
- Are you emailing info@ addresses? (Try finding personal emails)
- Is your subject line compelling? (Test A/B variations)
- Are you sending Tuesday-Thursday 10am-2pm? (Timing matters)
- Is your sender domain verified? (Avoid spam folder)

### "Batch discovery is taking too long"

**Normal:** 15-30 min for 10 leads
**Too long (45+ min):** Check Inngest logs for errors

### "AISO scores seem low"

This is **good**! Low scores = bigger opportunity.
AISO is looking for businesses that *need help*, not those already crushing it.

### "No critical WCAG violations found"

Some businesses are already compliant. Focus on other angles:
- Content marketing gap
- Low search visibility
- Competitor analysis

---

## Next Steps

**After your first batch:**
1. Review what worked (which pitches got responses)
2. Refine your targeting (industry, location, score range)
3. Scale up (run 3-5 batches per week)
4. Track conversion funnel (leads → demos → sales)

**Goal:** 50 qualified leads per week → 10 demos → 2-3 new clients

---

## Support

**Questions?** Check the docs or reach out to support.

**Found a bug?** Report it via GitHub issues.

**Want a new feature?** Submit a feature request.

---

*Last updated: 2025-01-24*
