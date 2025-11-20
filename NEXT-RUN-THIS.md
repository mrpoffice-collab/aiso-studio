# 🚀 Run This Next - AISO Migration & Testing

## Step 1: Run the Database Migration (2 minutes)

### Option A: Neon SQL Editor (Easiest)
1. Open https://console.neon.tech/
2. Select your project
3. Click "SQL Editor"
4. Copy contents of `migrations/002_add_aiso_fields.sql`
5. Paste and click "Run"

### Option B: Command Line
```bash
node run-aiso-migration.js
```

You should see:
```
✅ Migration completed successfully!
✅ Posts table columns: OK
✅ Strategies table columns: OK
✅ Topics table columns: OK
```

---

## Step 2: Test the New Scoring Functions (5 minutes)

Create a test file to verify everything works:

```bash
node test-aiso-scoring.js
```

**Create this file**:
```javascript
const { calculateAEOScore, calculateGEOScore, calculateAISOScore } = require('./lib/content-scoring.ts');

const sampleContent = `
## What Is Content Marketing?

Content marketing is defined as a strategic approach focused on creating valuable content.

### How Does Content Marketing Work?

The answer is simple: by providing value to your audience through consistent, high-quality content.

### Frequently Asked Questions

#### What are the benefits of content marketing?

Content marketing builds trust, generates leads, and establishes authority in your industry.

#### How long does content marketing take to work?

Typically, content marketing shows results in 3-6 months with consistent effort.
`;

console.log('Testing AEO Score:');
const aeoResult = calculateAEOScore(sampleContent);
console.log('AEO Score:', aeoResult.score);
console.log('Has FAQ:', aeoResult.details.hasFAQSection);
console.log('Has Direct Answer:', aeoResult.details.hasDirectAnswer);

console.log('\nTesting GEO Score:');
const geoContent = sampleContent + '\n\nWe serve Austin, Texas and the surrounding areas including Round Rock and Cedar Park.';
const geoResult = calculateGEOScore(geoContent, { city: 'Austin', state: 'Texas' });
console.log('GEO Score:', geoResult.score);
console.log('City Mentions:', geoResult.details.cityMentions);

console.log('\nTesting Complete AISO Score:');
const aisoResult = calculateAISOScore(sampleContent, 'Sample Title', 'Sample meta description', 85);
console.log('AISO Score (with fact-check):', aisoResult.aisoScore);
console.log('AEO:', aisoResult.aeoScore);
console.log('SEO:', aisoResult.seoScore);
console.log('Fact-Check:', aisoResult.factCheckScore);
```

Expected output:
- AEO Score: 70-85
- GEO Score: 60-75 (if local content)
- AISO Score: 75-85

---

## Step 3: What We've Built (Phase 1 Summary)

### ✅ Completed:

**1. AISO Scoring System**
- `calculateAEOScore()` - Answer Engine Optimization (0-100)
- `calculateGEOScore()` - Local Intent Optimization (0-100)
- `calculateAISOScore()` - Complete score with fact-checking (30% weight!)

**2. Enhanced Prompts**
- Content generation now includes mandatory FAQ sections
- Answer-first structure enforced
- Quotable insights emphasized
- AEO focus types (definition, how-to, comparison, etc.)

**3. Schema Generator**
- `lib/schema-generator.ts` - Auto-generates JSON-LD
- Article, FAQ, HowTo, LocalBusiness schemas
- Auto-extracts from content

**4. Database Schema**
- Added `aeo_score`, `geo_score`, `aiso_score` to posts
- Added `content_type`, `city`, `state`, `service_area` to strategies
- Added `aeo_focus` to topics

**5. Documentation**
- `AISO-FRAMEWORK.md` - Complete framework
- `AISO-QUICK-START.md` - User guide
- `AISO-IMPLEMENTATION-SUMMARY.md` - Technical details

### 🚧 Still Needed (Phase 2):

**1. API Route Updates** (Next priority)
- Update audit routes to use `calculateAISOScore()`
- Store AEO/GEO/AISO scores in database
- Pass local context through content generation

**2. UI Components**
- AEOScoreCard.tsx
- GEOScoreCard.tsx
- SchemaViewer.tsx

**3. Strategy Builder**
- Add "Content Type" dropdown (National/Local/Hybrid)
- Show local fields when "Local" selected
- City, State, Service Area inputs

**4. Post Editor**
- Display AISO score breakdown
- Show schema markup
- Copy schema to clipboard

---

## Step 4: Key Differentiator - Fact-Checking

### Maintained High Weight for Fact-Checking:

**National Content Scoring**:
- AEO: 25%
- SEO: 15%
- Readability: 15%
- Engagement: 15%
- **Fact-Check: 30%** ⭐ Highest weight!

**Local Content Scoring** (with GEO):
- AEO: 20%
- GEO: 10%
- SEO: 15%
- Readability: 15%
- Engagement: 15%
- **Fact-Check: 25%** ⭐ Still highest!

### Why This Matters:
- Fact-checking is your key competitive advantage
- No other AISO platform has Brave Search integration
- Maintains accuracy while adding AI optimization
- Differentiates from generic AI content tools

---

## Step 5: Updated Positioning

### Marketing Message:

**Before**:
> "AI-powered content generation with fact-checking"

**After**:
> "The only AISO platform that combines AI-quotable content, automatic schema markup, local optimization (GEO), and Brave Search fact-checking. Optimize for ChatGPT, Perplexity, Google SGE, and traditional SEO - all in one system."

**Key Points**:
1. ✅ **AEO** - Optimize for AI answer engines
2. ✅ **GEO** - Local business AI search optimization
3. ✅ **Fact-Checking** - Brave Search verification (30% weight!)
4. ✅ **Schema Markup** - Automatic JSON-LD generation
5. ✅ **Complete AISO** - The full stack, not just SEO

---

## Step 6: Quick Test Checklist

After running migration, test these:

- [ ] Migration ran successfully
- [ ] New columns exist in database
- [ ] Generate a new strategy
- [ ] Generate content from topic
- [ ] Content includes FAQ section
- [ ] Content has answer-first structure
- [ ] Test schema generation functions
- [ ] Verify AEO scoring works
- [ ] Verify GEO scoring works (with local context)
- [ ] Verify AISO scoring includes fact-check

---

## Step 7: Next Development Tasks

**Priority Order**:

1. **Update API Routes** (3-4 hours)
   - audit/route.ts
   - audit/batch/route.ts
   - topics/[id]/generate/route.ts

2. **Create Score Card Components** (4-5 hours)
   - AEOScoreCard.tsx
   - GEOScoreCard.tsx
   - SchemaViewer.tsx

3. **Update Strategy Builder** (2-3 hours)
   - Add content type selector
   - Add local business fields
   - Conditional display logic

4. **Update Terminology** (1-2 hours)
   - Dashboard headers
   - Page titles
   - Score labels

**Total Estimated Time**: 10-14 hours

---

## Step 8: Testing AISO in Action

### Test Case 1: National Content
1. Create strategy (content_type: "national")
2. Generate topic with aeo_focus: "how-to"
3. Generate content
4. Verify FAQ section appears
5. Check AEO score (target: 70+)
6. Check AISO score (target: 75+)
7. Fact-check weight should be 30%

### Test Case 2: Local Content
1. Create strategy (content_type: "local")
2. Set city: "Austin", state: "Texas"
3. Generate local-optimized topic
4. Generate content with GEO keywords
5. Check AEO score (target: 70+)
6. Check GEO score (target: 70+)
7. Check AISO score (target: 75+)
8. Fact-check weight should be 25%

---

## Files Created in Phase 1

**New Files**:
- `AISO-FRAMEWORK.md` - Complete framework guide
- `AISO-QUICK-START.md` - User quick start
- `AISO-IMPLEMENTATION-SUMMARY.md` - Technical details
- `lib/schema-generator.ts` - Schema generation
- `migrations/002_add_aiso_fields.sql` - Database migration
- `run-aiso-migration.js` - Migration script
- `RUN-AISO-MIGRATION.md` - Migration instructions
- `NEXT-RUN-THIS.md` - This file

**Modified Files**:
- `lib/content-scoring.ts` - Added AEO/GEO/AISO scoring
- `lib/content.ts` - Enhanced prompts for AEO
- `lib/claude.ts` - AISO-focused strategy generation
- `neon-schema.sql` - Updated base schema

---

## Questions?

Check these docs:
- `AISO-FRAMEWORK.md` - Full framework explanation
- `AISO-QUICK-START.md` - How to use AISO
- `RUN-AISO-MIGRATION.md` - Migration details

---

**You're Ready!** Run the migration and start testing. Phase 1 (core functionality) is complete. Phase 2 (UI) is next.

**Current Status**:
- ✅ Phase 1: Core Foundation Complete
- 🚧 Phase 2: UI & Integration (10-14 hours remaining)
