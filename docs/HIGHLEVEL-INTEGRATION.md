# HighLevel Integration Guide

**Bidirectional sync between AISO Studio and GoHighLevel CRM**

---

## Overview

AISO Studio integrates with HighLevel (GoHighLevel) to create a powerful lead generation and nurturing workflow:

| Direction | What Happens |
|-----------|--------------|
| **AISO → HighLevel** | Export leads with AISO scores to your CRM |
| **HighLevel → AISO** | Auto-audit new contacts, sync opportunity stages |

---

## Setup

### Step 1: Get Your HighLevel API Credentials

1. Log into HighLevel
2. Go to **Settings** → **Integrations** → **Private Integrations**
3. Create a new Private Integration or use existing
4. Copy the **Private Integration Token** (starts with `pit-`)
5. Note your **Location ID** from your URL: `app.gohighlevel.com/v2/location/[THIS-PART]/...`

### Step 2: Connect in AISO Studio

1. Go to **Dashboard** → **Settings** → **Integrations**
2. Enter your Private Integration Token
3. Enter your Location ID
4. Click **Connect HighLevel**

### Step 3: Configure Optional Settings

Once connected, you can:

- **Select default pipeline** for new opportunities
- **Select default stage** for new leads
- **Map AISO Score** to a custom field
- **Map Source URL** to a custom field
- **Enable Auto-Audit** for new contacts

### Step 4: Set Up Webhooks (Optional)

To receive events FROM HighLevel:

1. In HighLevel, go to **Settings** → **Integrations** → **Webhooks**
2. Add webhook URL: `https://aiso.studio/api/webhooks/highlevel`
3. Select events:
   - ContactCreate
   - ContactUpdate
   - ContactTagUpdate
   - OpportunityStageUpdate
   - OpportunityStatusUpdate

---

## Features

### Export Lead to HighLevel

From the Pipeline or Lead Discovery:

1. Click on a lead
2. Click **Export to HighLevel**
3. Optionally create an opportunity

What gets synced:
- Contact info (email, name, phone, company)
- Website URL
- AISO Score (as custom field)
- Tags: "AISO Lead", "Low/Medium/High AISO Score", "Business Owner" or "Agency/Consultant"

### Auto-Audit New Contacts

When enabled and a new contact is added in HighLevel with a website:
1. AISO receives the webhook
2. Queues an audit for that website
3. Syncs the AISO score back to the contact

### Sync Opportunity Stages

When an opportunity moves stages in HighLevel:
- AISO pipeline updates automatically
- Won/Lost status syncs both ways

### Tag-Triggered Actions

Add the tag "Needs AISO Audit" to any contact in HighLevel:
- AISO automatically runs an audit on their website
- Results sync back to the contact

---

## Custom Fields Setup

To store AISO data in HighLevel:

1. In HighLevel, go to **Settings** → **Custom Fields**
2. Create two new contact fields:
   - **AISO Score** (Number type)
   - **AISO Source URL** (Text/URL type)
3. In AISO Settings → Integrations, map these fields

---

## API Reference

### Export Lead

```
POST /api/integrations/highlevel/export-lead

Body:
{
  "leadId": "uuid",           // OR provide direct data:
  "email": "lead@example.com",
  "name": "John Doe",
  "companyName": "Acme Inc",
  "website": "https://acme.com",
  "aisoScore": 65,
  "createOpportunity": true,  // Optional
  "estimatedValue": 5000      // Optional
}

Response:
{
  "success": true,
  "contactId": "abc123",
  "opportunityId": "xyz789"
}
```

### Get Pipelines

```
GET /api/integrations/highlevel/pipelines

Response:
{
  "pipelines": [
    {
      "id": "pipe123",
      "name": "Sales Pipeline",
      "stages": [
        { "id": "stage1", "name": "New Lead" },
        { "id": "stage2", "name": "Contacted" }
      ]
    }
  ]
}
```

### Get Custom Fields

```
GET /api/integrations/highlevel/custom-fields

Response:
{
  "customFields": [
    { "id": "field1", "name": "AISO Score", "fieldKey": "aiso_score" }
  ]
}
```

---

## Webhook Events

AISO receives and processes these HighLevel events:

| Event | AISO Action |
|-------|-------------|
| `ContactCreate` | Queue auto-audit (if enabled and has website) |
| `ContactUpdate` | Sync contact changes |
| `ContactTagUpdate` | Check for "Needs AISO Audit" tag |
| `OpportunityStageUpdate` | Update AISO pipeline lead stage |
| `OpportunityStatusUpdate` | Sync won/lost status |

---

## Database Schema

HighLevel data stored in AISO:

**Users table additions:**
- `highlevel_api_key` - Encrypted API token
- `highlevel_location_id` - Sub-account ID
- `highlevel_pipeline_id` - Default pipeline
- `highlevel_pipeline_stage_id` - Default stage
- `highlevel_aiso_score_field_id` - Custom field mapping
- `highlevel_aiso_source_field_id` - Custom field mapping
- `highlevel_auto_sync` - Enable auto-audit
- `highlevel_connected_at` - Connection timestamp

**Pipeline leads additions:**
- `highlevel_contact_id` - Linked GHL contact
- `highlevel_opportunity_id` - Linked GHL opportunity
- `highlevel_stage_id` - Current GHL stage
- `highlevel_exported_at` - Export timestamp

---

## Troubleshooting

### "Failed to connect to HighLevel"

- Check your API token is correct (starts with `pit-`)
- Verify Location ID matches your sub-account
- Ensure your HighLevel subscription includes API access

### "Custom fields not showing"

- Refresh the page after connecting
- Create custom fields in HighLevel first (Settings → Custom Fields)
- Fields must be "Contact" type, not "Opportunity" type

### "Webhooks not working"

- Verify webhook URL is exactly: `https://aiso.studio/api/webhooks/highlevel`
- Check the events you want are selected in HighLevel
- Look at webhook_logs table for errors

### "Auto-audit not running"

- Enable "Auto-Audit New Contacts" in AISO settings
- Ensure the contact has a website field populated
- Check webhook_queue table for pending items

---

## Security

- API keys are stored encrypted in the database
- Webhook signatures are verified using HighLevel's public key
- Only the location owner can access their integration settings
- Webhook logs are retained for 30 days

---

## Don't Have HighLevel?

AISO Studio works great standalone, but HighLevel supercharges your lead nurturing.

**Get 14 days free:** [Try HighLevel](https://www.gohighlevel.com/?fp_ref=aiso)

(This is an affiliate link - AISO earns a commission if you subscribe)

---

## Support

- **HighLevel API Docs:** https://marketplace.gohighlevel.com/docs/
- **HighLevel Support:** https://help.gohighlevel.com/
- **AISO Support:** support@aiso.studio
