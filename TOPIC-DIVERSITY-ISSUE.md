# Topic Diversity Issue

## Problem
When generating topics (especially regenerating after some topics already exist), the AI produces very similar topics with repetitive themes.

**Example from fireflygrove.app strategy:**
- "What Is a Digital Memorial?"
- "Online Memorial Page Setup"
- "Memorial Website vs Social Media"
- "Memorial Planning Checklist"
- "Digital Tribute Ideas"
- etc.

All heavily focused on "memorial", "remembrance", "digital tribute" themes with little variety.

## Root Cause

1. **No Context of Existing Topics**: The `generateStrategy()` function doesn't receive existing topics, so it can't avoid duplication
2. **No Diversity Mechanism**: Prompt doesn't explicitly encourage diverse angles
3. **Keyword-Driven Repetition**: AI latches onto a few keywords and explores variations on the same theme

## Current Workaround

**Manual Strategy:**
- Reset topics and regenerate with different keywords/goals
- Edit strategy to emphasize different aspects before regenerating
- Manually review and delete similar topics

## Proposed Solutions

### Option 1: Pass Existing Topics to AI (Quick Fix)
Modify `regenerate-topics/route.ts` and `claude.ts` to:

```typescript
// In regenerate-topics route
const existingTopicTitles = existingTopics.map(t => t.title);

// Pass to generateStrategy
const { topics: generatedTopics, tokensUsed } = await generateStrategy({
  // ... existing params
  existingTopics: existingTopicTitles, // NEW
});

// In claude.ts prompt
${existingTopics && existingTopics.length > 0 ? `
**EXISTING TOPICS (DO NOT DUPLICATE):**
The following topics already exist. Generate completely different topics with different angles, keywords, and themes:
${existingTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

CRITICAL: Your new topics must explore different aspects, different keywords, and different content angles than the above.
` : ''}
```

### Option 2: Topic Categorization System (Better Long-term)
Implement a category/pillar system:

1. Define content pillars for each industry
2. Ensure topic generation covers multiple pillars
3. Track topic distribution across pillars
4. Force diversity across categories

**Example for Funeral/Memorial Industry:**
- Pillar 1: Pre-planning (advance directives, wills, etc.)
- Pillar 2: Immediate arrangements (funeral planning, cremation vs burial)
- Pillar 3: Memorial/remembrance (digital tributes, services)
- Pillar 4: Grief support (coping, therapy, support groups)
- Pillar 5: Legal/financial (estates, insurance, benefits)

###Option 3: Iterative Diversity Check (Most Robust)
After generating topics, check semantic similarity:

```typescript
// Pseudo-code
const newTopics = await generateTopics();
const combinedTopics = [...existingTopics, ...newTopics];

// Check similarity matrix
const diversityScore = calculateTopicDiversity(combinedTopics);

if (diversityScore < threshold) {
  // Regenerate with explicit diversity instructions
  // OR remove most similar topics and generate replacements
}
```

## Recommendation

**For MVP**: Implement Option 1 (pass existing topics)
- Quick to implement (~30 min)
- Immediate improvement
- Low risk

**For Production**: Implement Option 2 (content pillars)
- Better long-term strategy
- Aligns with content marketing best practices
- Enables better topic planning

**For Scale**: Add Option 3 (diversity checking)
- Quality assurance
- Prevents bad topic sets
- Can be added iteratively

## Implementation Priority

1. **Immediate** (Option 1): Pass existing topics to avoid exact duplicates
2. **Next Sprint**: Add diversity requirements to prompt
3. **Future**: Implement content pillar system

## Testing Strategy

After implementing fixes:
1. Generate 15 initial topics
2. Regenerate 15 more topics
3. Manually review for diversity
4. Measure keyword overlap
5. Check semantic similarity scores

**Success Criteria:**
- No identical or near-identical topics
- At least 3-5 distinct themes/angles
- Keyword variety across topics
- Different user intents covered (awareness, consideration, decision)
