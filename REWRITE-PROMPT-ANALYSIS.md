# Rewrite Prompt Analysis - Complete Breakdown

**Date:** 2025-01-05
**Issue:** Readability improvements failing despite emergency mode
**Root Cause:** Prompt overload + Conflicting priorities

---

## Executive Summary

The rewrite system uses a **single massive prompt** (200+ lines) that asks Claude to do multiple conflicting tasks simultaneously:

1. **Simplify sentences** (readability emergency mode)
2. **Add FAQ sections** (AEO optimization)
3. **Add Key Takeaways** (engagement)
4. **Add definitions** (AEO)
5. **Add numbered steps** (structure)
6. **Add comparison tables** (AEO)
7. **Add location mentions** (GEO for local content)
8. **Meet 13 "CRITICAL REQUIREMENTS"** (must-have checklist)

**The Problem:** Claude prioritizes **additive tasks** (adding FAQ, tables, definitions) over **transformative tasks** (simplifying existing sentences).

**Result:** Readability never improves because Claude focuses on adding structure instead of simplifying language.

---

## Current Prompt Structure (Iteration-Based)

### 1. Context Setting (Lines 192-217)
```
You are a professional content editor...
CONTENT TYPE: LOCAL/NATIONAL
Current Date: January 2025
Iteration X/3 - Current AISO Score: 72/100 (Target: 90+)
```

**Scoring Breakdown:**
- 🎯 Fact-Check: 88/100 (30% weight)
- 🤖 AEO: 75/100 (25% weight)
- 📊 SEO: 70/100 (15% weight)
- 📖 Readability: 47/100 (15% weight) ⚠️
- 🎯 Engagement: 100/100 (15% weight)

### 2. Safety Warning (Lines 223-227)
```
⚠️ CRITICAL: DO NOT ADD NEW FACTUAL CLAIMS!
   - Keep all existing verified claims exactly as written
   - Do NOT invent new statistics
```
**Purpose:** Prevent fact-check score from dropping
**Effectiveness:** ✅ Works well

---

## 3. Emergency Readability Mode (Lines 229-268)

**Trigger:** `readabilityScore < 40`

### Current Prompt:
```
🚨 EMERGENCY MODE: READABILITY CRISIS (25/100)

**STOP! IGNORE ALL OTHER INSTRUCTIONS BELOW!**

Your ONLY task is to make this content readable.
Do NOT add FAQ sections, Key Takeaways, definitions, or any other new content.

REWRITE RULES (MANDATORY):
1. Every sentence MUST be under 15 words - NO EXCEPTIONS
2. Use only 1-2 syllable words (5th grade reading level)
3. Break every long sentence into 2-3 short sentences
4. Replace ALL complex words:
   - "utilize" → "use"
   - "facilitate" → "help"
   - "comprehensive" → "full"
5. Use active voice
6. One idea per sentence
7. Break paragraphs: maximum 3 sentences each

EXAMPLE TRANSFORMATIONS:
❌ BEFORE: "Digital memorial etiquette encompasses respectful practices..."
✅ AFTER: "Digital memorials need respect. They honor loved ones who passed away."

DO NOT:
- Add new sections (FAQ, Key Takeaways, etc.)
- Add new claims or information
- Add tables, definitions, or numbered steps

ONLY DO:
- Rewrite every sentence to be shorter and simpler
- Break long paragraphs into shorter ones
- Replace complex words with simple words
```

**Test Results:**
- Iteration 1: Readability stays at 25 ❌
- Iteration 2: Readability stays at 25 ❌
- Iteration 3: Readability stays at 25 ❌

**Why It Fails:**
1. **"IGNORE ALL OTHER INSTRUCTIONS BELOW" doesn't work** - LLMs don't have reliable instruction hierarchy
2. **The other sections ARE still conditionally included** (lines 294-374) when readability >= 40
3. **But wait...** if readability < 40, those sections should be hidden!

Let me check the actual conditional logic...

---

## 4. Conditional Optimization Sections

### AEO Section (Lines 294-312)
**Condition:** `${readabilityScore >= 40 && aeoScore < 85 ? ... : ''}`

✅ **CORRECTLY HIDDEN** when readability < 40

**When shown (readability >= 40):**
```
🔥 PRIORITY 2: BOOST AEO/SGE (Currently 75/100)
   - ADD FAQ SECTION (MANDATORY!) - EXACT FORMAT REQUIRED
   - FIRST PARAGRAPH: Start with "The answer is..."
   - Add "## Key Takeaways" section with 5+ bullet points
   - Define terms: "X is defined as..." (at least 2)
   - Add numbered steps: "Step 1:", "Step 2:" (at least 3)
   - Include comparison table in markdown
```

### GEO Section (Lines 314-324) - LOCAL ONLY
**Condition:** `${readabilityScore >= 40 && isLocalContent && geoScore < 85 ? ... : ''}`

✅ **CORRECTLY HIDDEN** when readability < 40

### SEO Section (Lines 326-333)
**Condition:** `${readabilityScore >= 40 && seoScore < 85 ? ... : ''}`

✅ **CORRECTLY HIDDEN** when readability < 40

### Readability Section (Lines 335-349)
**Condition:** `${readabilityScore < 85 ? ... : ''}`

⚠️ **ALWAYS SHOWN** (even in emergency mode!)

**Content when readability < 40:**
```
🔥 CRITICAL - IMPROVE READABILITY (Currently 47/100)
   ⚠️ EMERGENCY MODE - Readability is FAILING!
   - REWRITE every sentence to be under 15 words
   - Replace ALL complex words (5th-6th grade level)
   - Break paragraphs to 2-3 sentences MAX
   - Use simple Subject-Verb-Object structure
   - Remove jargon and technical terms
   - Replace passive voice with active voice
```

**This is DUPLICATE guidance!** Lines 229-268 already say this.

### Engagement Section (Lines 351-359)
**Condition:** `${readabilityScore >= 40 && engagementScore < 85 ? ... : ''}`

✅ **CORRECTLY HIDDEN** when readability < 40

### Critical Requirements Checklist (Lines 361-374)
**Condition:** `${readabilityScore >= 40 ? ... : ''}`

✅ **CORRECTLY HIDDEN** when readability < 40

**Content (13 must-haves):**
```
✅ First paragraph: "The answer is..." format
✅ FAQ section with 6-8 Q&A pairs
✅ Key Takeaways section with 5+ bullets
✅ 2+ definitions using "is defined as"
✅ Numbered steps for processes
✅ 5+ internal link opportunities
✅ 1+ data table in markdown
✅ 6+ H2 headers and 4+ H3 subheaders
✅ 10+ bold phrases
✅ 5+ bullet points and 3+ numbered lists
✅ Call-to-action in last paragraph
✅ No unverifiable statistics
✅ All year references updated to 2025
```

---

## 5. Final Reminders (Lines 376-389)

```
OPTIMIZATION FOR AI ANSWER ENGINES:
- Google SGE: First paragraph quotable summary
- ChatGPT: FAQ section for direct answers
- Perplexity: Qualified statistics
- Bing Copilot: Clear definitions

${readabilityScore < 40 ? `
🚨 REMINDER: READABILITY IS YOUR #1 PRIORITY!
Make EVERY sentence simple and short (12-15 words max).
If you choose between FAQ or simplifying, SIMPLIFY FIRST.
` : ''}

OUTPUT FORMAT:
Return ONLY rewritten content in markdown.
No explanations. Just the improved blog post.
```

---

## The Core Problem Identified

### When Readability < 40:

**Sections SHOWN to Claude:**
1. ✅ Emergency Mode instructions (lines 229-268) - "ONLY simplify sentences"
2. ✅ Readability improvement section (lines 335-349) - DUPLICATE guidance
3. ✅ Emergency reminder (lines 382-386) - "Readability is #1 priority"
4. ✅ Answer engine optimization (lines 376-381) - Wants "quotable summary" and "FAQ"
5. ✅ Output format (lines 388-389)

**Sections HIDDEN from Claude:**
1. ❌ AEO section (FAQ, Key Takeaways, definitions, tables)
2. ❌ GEO section (location mentions)
3. ❌ SEO section (headers, links)
4. ❌ Engagement section (hooks, CTAs)
5. ❌ Critical Requirements checklist (13 must-haves)

### The Contradiction:

**Line 376-381 says:**
```
OPTIMIZATION FOR AI ANSWER ENGINES:
- Google SGE: First paragraph must be quotable summary
- ChatGPT: FAQ section provides direct answers
```

This is **STILL SHOWN** even in emergency mode! It contradicts the emergency instructions that say "Do NOT add FAQ sections."

---

## Why Readability Isn't Improving

### Hypothesis 1: Scoring Formula Issue
The Flesch Reading Ease formula might not detect improvements:
```typescript
fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
```

**Test needed:** Manually check if rewritten sentences are actually shorter.

### Hypothesis 2: Claude Ignores Instructions
Even with emergency mode, Claude may:
- Focus on "must add FAQ" from line 380
- Prioritize structural changes over simplification
- Not understand what "5th grade level" means

### Hypothesis 3: Content Already Optimized
If the content is already simplified, Claude has no room to improve it further without:
- Removing content (loses information)
- Dumbing it down to unusable levels

---

## Proposed Solutions

### Option 1: Completely Remove All Other Guidance in Emergency Mode

**Change lines 376-389 to:**
```typescript
${readabilityScore < 40 ? `
🚨 REMINDER: READABILITY IS YOUR ONLY TASK!

OUTPUT FORMAT:
Return ONLY the rewritten content with SIMPLE, SHORT SENTENCES.
Do not add ANY new sections. Just rewrite existing text to be simpler.
` : `
OPTIMIZATION FOR AI ANSWER ENGINES:
- Google SGE: First paragraph must be quotable summary
- ChatGPT: FAQ section provides direct answers
...

OUTPUT FORMAT:
Return ONLY rewritten content that scores 90+.
`}
```

### Option 2: Lower the Emergency Threshold

Change from `readabilityScore < 40` to `readabilityScore < 65`:
```typescript
${readabilityScore < 65 ? `
🚨 READABILITY FOCUS MODE (${readabilityScore}/100 - Target: 65+)
```

This triggers earlier and prioritizes readability before it becomes critical.

### Option 3: Use Multi-Pass Approach

**Pass 1:** Fix ONLY readability (no other optimizations)
**Pass 2:** After readability >= 65, then add FAQ/structure

Current system tries to do everything at once.

### Option 4: Accept Lower Readability Targets

If other AI platforms (ChatGPT, Perplexity) score content as "College level," maybe:
- Professional content SHOULD be college level
- Target should be 40-50 (college level) not 65+ (8th grade)
- Marketing content ≠ Children's books

**Industry Standard:** Most B2B content targets 10th-12th grade (Flesch 50-60).

---

## Recommendation

### Immediate Fix (5 minutes):
1. Remove "Answer Engine Optimization" section (lines 376-381) when readability < 40
2. Test one post to see if readability improves

### Better Fix (30 minutes):
1. Split rewrite into 2 phases:
   - **Phase 1:** Readability-only pass (if < 65)
   - **Phase 2:** Structure/AEO pass (after readability is fixed)

### Best Fix (2 hours):
1. Reassess readability targets:
   - Professional content: Target 50-60 (10th-12th grade) ✅
   - Consumer content: Target 60-70 (8th-9th grade) ✅
   - Educational content: Target 70+ (6th-7th grade) ✅

2. Adjust scoring thresholds in `content-scoring.ts`:
```typescript
// Current minimum: 65 (8th grade)
// Proposed minimum: 55 (10th-11th grade) - more realistic for B2B
```

3. Update emergency mode trigger:
```typescript
// Current: readabilityScore < 40 (college graduate level - too late!)
// Proposed: readabilityScore < 55 (high school level - catches earlier)
```

---

## Test Results Summary

| Post | Before | After Rewrite | Change | Emergency Mode? |
|------|--------|---------------|--------|-----------------|
| Digital Memorial Etiquette | 25 | 25 | 0 | ✅ Yes (3 iterations) |
| Digital Memorial Etiquette | 25 | **65** | +40 | ✅ Yes (1 iteration) |
| Digital Storytelling | 47 | 47 | 0 | ❌ No (47 >= 40) |

**Key Insight:** Emergency mode worked ONCE (in our manual test showing 65), but then failed on subsequent runs. This suggests:
- The fix IS in the code
- But something else is interfering
- Possibly: The "Answer Engine Optimization" section at lines 376-381

---

## Questions for Human Review

1. **What's the actual business goal?**
   - Rank in Google? (SEO score matters most)
   - Get featured in ChatGPT/SGE? (AEO score matters most)
   - Be readable by consumers? (Readability matters most)
   - All three equally? (Current approach)

2. **What readability level is appropriate?**
   - Your content is funeral/memorial services (sensitive topic)
   - Should it be 8th grade (current target) or college level (professional)?
   - Most funeral home websites use 10th-12th grade language

3. **Is the 90+ AISO target realistic?**
   - Requires meeting ALL minimums across 5-6 categories
   - Fact-check 75+, AEO 70+, SEO 65+, Readability 65+, Engagement 65+
   - AND having perfect structure (FAQ, tables, definitions, etc.)
   - **This is VERY high bar** - maybe 80+ is more reasonable?

4. **Should we simplify the prompt?**
   - Current: 200+ lines, 13 requirements, 5-6 optimization targets
   - Proposed: Focus on top 2-3 priorities per iteration
   - Iteration 1: Fix readability + fact-check
   - Iteration 2: Add structure (FAQ, tables)
   - Iteration 3: Polish (engagement, local keywords)

---

## Next Steps

1. **Immediate:** Remove lines 376-381 when readability < 40
2. **Test:** Run rewrite on "Digital Storytelling" post again
3. **Verify:** Check if readability improves from 47 → 60+
4. **Decide:** Based on results, choose Option 1, 2, 3, or 4 above

**Your input needed:** Which direction makes most business sense?
