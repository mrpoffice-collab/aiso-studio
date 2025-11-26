# AISO Studio - Implementation Phases

**Created**: Nov 26, 2025
**Status**: Ready to implement

---

## Completed

- [x] **Phase 0: Mascot** - `components/AISOMascot.tsx` - Stickman Lottie animation

---

## Phase 1: AISO Audit Engine Consolidation

**Goal**: Single audit engine called by all parts of the app. Auto-saves. Modal results.

### Deliverables

1. **`lib/aiso-audit-engine.ts`** - Core engine
   - Runs full audit (WCAG + content + technical)
   - Auto-saves to `accessibility_audits` table
   - Auto-generates PDF
   - Auto-saves PDF to Vault (linked to domain)
   - Returns audit result + Vault asset ID

2. **Recent audit check** - Before running:
   - Check if audit exists for domain in last X days
   - Show option: "View Existing" or "Run New Audit Anyway"

3. **`components/AuditResultModal.tsx`** - Results display
   - Score cards (WCAG, SEO, AISO)
   - Top issues list
   - "Saved to Vault" confirmation
   - Buttons: Download PDF, View Full Report, Close

4. **Pipeline integration** - "Run Audit" button:
   - Calls `runAISOAudit()` from engine
   - Shows mascot loading state
   - Opens modal with results
   - Updates lead card with new scores

5. **Mascot integration** - Use `<AISOMascotProgress />` during audit

---

## Phase 2: Clients Page + Client Profile

**Goal**: Manage won clients with profile drawer and contact actions.

### Navigation Change

```
Dashboard → Leads → Pipeline → Clients → Strategies → Posts → Vault → AISO Audit
                                  ↑
                               (new)
```

### Deliverables

1. **`/dashboard/clients`** - Clients list page
   - Cards view with client info
   - Filter and sort options
   - "+ Add Client" button

2. **Client sources**:
   - Auto-add when Pipeline lead → "Won"
   - Manual add via "+ Add Client" button

3. **`components/ClientProfile.tsx`** - Slide-in drawer
   - Contact info with Call/Email/Visit buttons
   - Status and monthly value
   - Tabs: Overview, Tasks, Audits, Content, Emails, Notes
   - Quick actions: Run Audit, New Task, Send Email, Add Note

4. **Database** - Link strategies to clients:
   ```sql
   ALTER TABLE strategies ADD COLUMN lead_id INTEGER REFERENCES leads(id);
   ```

---

## Phase 3: Task System

**Goal**: Track deliverables and internal work. Multiple tasks per client. Internal tasks too.

### Deliverables

1. **Tasks table**:
   ```sql
   CREATE TABLE tasks (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     lead_id INTEGER REFERENCES leads(id),  -- NULL for internal tasks
     title VARCHAR(255) NOT NULL,
     description TEXT,
     status VARCHAR(50) DEFAULT 'todo',     -- todo, in_progress, done
     due_date TIMESTAMP,
     tags TEXT[],                           -- ['deadline', 'content', etc.]
     is_auto_generated BOOLEAN DEFAULT false,
     source_type VARCHAR(50),               -- 'audit', 'strategy', 'manual'
     source_id INTEGER,                     -- ID of audit/strategy that created it
     created_at TIMESTAMP DEFAULT NOW(),
     completed_at TIMESTAMP
   );
   ```

2. **Auto-generated tasks** (from system):
   - Audit overdue (last audit > 30 days)
   - Content due (from strategy schedule)
   - WCAG fixes needed (critical issues from audit)

3. **Manual tasks** (user creates):
   - Title, description
   - Optional client link
   - Optional due date
   - Tags

4. **Task views**:
   - Inside Client Profile → "Tasks" tab (filtered to that client)
   - Dashboard → "Needs Attention" widget (overdue + upcoming)

5. **Filters**:
   - By client (dropdown + "Internal")
   - By tag
   - By status
   - By due date (overdue, due soon, no date)

---

## Phase 4: Branded Email System

**Goal**: WYSIWYG emails with agency branding. Send from anywhere.

### Deliverables

1. **TipTap WYSIWYG editor** (free, modern)
   - Rich text formatting
   - Variable insertion button
   - Template selection
   - Preview before send

2. **Email branding** - Uses agency settings:
   - Logo in header
   - Primary/secondary colors
   - Signature block (name, title, phone)

3. **Variables** (all available):
   ```
   {{first_name}}     {{aiso_score}}      {{agency_name}}
   {{company}}        {{wcag_score}}      {{signature_name}}
   {{domain}}         {{critical_issues}} {{signature_title}}
   {{topics_count}}   {{posts_generated}}
   ```

4. **Tracking**:
   - Open tracking (pixel)
   - Click tracking (redirect)
   - Show in Client Profile → "Emails" tab

5. **Send from anywhere**:
   - Pipeline lead → [Email]
   - Client Profile → [Send Email]
   - Pre-fills recipient, suggests relevant template

---

## Phase 5: Dashboard Hub

**Goal**: Agency command center with metrics and action items.

### Deliverables

1. **Metrics row**:
   - Clients (active count)
   - Tasks (open count, overdue count)
   - Pipeline (total value, lead count)
   - Content (posts this month)

2. **Needs Attention** (auto + manual):
   - Late deliverables (auto-detected)
   - User tasks (manual)
   - Action buttons on each item

3. **Recent activity** (filterable):
   - All activity or filter by client
   - Shows: audits, emails, tasks, content

4. **Quick actions**:
   - Run Audit
   - Add Client
   - New Task
   - View Pipeline

---

## Phase 6: Agency Onboarding

**Goal**: Guided setup. Reminds on every login until complete.

### Deliverables

1. **Onboarding checklist** (shows on dashboard until done):
   - Progress bar
   - Checklist items with status
   - Action buttons to complete each step

2. **Steps**:
   - Agency info (name, website)
   - Upload logo
   - Set colors
   - Email signature (name, title, phone)
   - First audit (real OR sample - user choice)

3. **Persistence**:
   - Shows on dashboard every login
   - Can skip individual steps
   - Dismisses when all complete

---

## Quick Reference

| Phase | Focus | Key File/Component |
|-------|-------|-------------------|
| 0 | Mascot | `components/AISOMascot.tsx` ✅ |
| 1 | Audit Engine | `lib/aiso-audit-engine.ts` |
| 2 | Clients | `/dashboard/clients`, `components/ClientProfile.tsx` |
| 3 | Tasks | `tasks` table, task components |
| 4 | Email | TipTap editor, `lib/email-templates/` |
| 5 | Dashboard | Dashboard redesign |
| 6 | Onboarding | Onboarding checklist component |

---

## Architecture Notes

### AISO Audit as Internal Tool
- Single codebase in `lib/aiso-audit-engine.ts`
- Called by: Pipeline, Clients page, AISO Audit page, API
- Clonable as standalone app if needed

### Client vs Lead
- Pipeline = sales (leads, prospects)
- Clients = won deals (delivery, tasks, content)
- Lead becomes Client when status = "Won"

### Task System
- Client tasks: linked to a lead_id
- Internal tasks: lead_id = NULL
- Auto-generated: from audits, strategies
- Manual: user creates

### Email Branding
- Agency sets: logo, colors, signature
- Templates default to agency preferences
- User can edit via WYSIWYG before send
