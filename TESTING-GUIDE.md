# Testing Guide - Fact-Checking Integration

## ✅ Setup Complete!

Your Brave API key is configured and the development server is running.

**Server URL**: http://localhost:3001 (or check your terminal for the actual port)

---

## 🧪 Test Plan: End-to-End Fact-Checking

### Test 1: Create a Strategy with Factual Topics

**Goal**: Generate a strategy that will produce topics with factual claims

1. **Navigate to**: http://localhost:3001
2. **Sign in** with your Clerk account (or create one)
3. **Go to**: Dashboard → Strategies → "Create New Strategy"
4. **Fill out the form** with this test data:

```
Client Name: TechCorp Inc
Industry: SaaS, B2B Software
Goals: Increase organic traffic, Generate qualified leads, Build thought leadership
Target Audience: Marketing managers at B2B SaaS companies with 50-200 employees
Brand Voice: Professional yet approachable, data-driven, conversational
Frequency: Weekly
Content Length: Medium (1000-1500 words)
Keywords: content marketing ROI, B2B lead generation, marketing automation
```

5. **Click "Generate Strategy"**
6. **Wait 20-30 seconds** for Claude to generate 15 topics
7. **Verify**: You should see a strategy detail page with topics

---

### Test 2: Generate Content with Fact-Checking

**Goal**: Test the complete pipeline including Brave Search integration

1. **On the strategy detail page**, find a topic that's likely to have factual claims
   - Look for topics with words like: "statistics", "trends", "research", "studies", "2024", "data"
   - Example: "Latest B2B Marketing Statistics for 2024"

2. **Click "Generate Post"** on a topic

3. **Watch the console logs** (open browser DevTools → Console):
   ```
   You should see:
   - "Extracting factual claims..."
   - "Found X claims to verify"
   - "Searching for: [claim text]"
   - "Verifying claims with Claude..."
   - "Fact-checking complete: X/Y verified"
   ```

4. **Wait 30-60 seconds** (depending on number of claims)
   - Content generation: ~15-20 seconds
   - Claim extraction: ~5 seconds
   - Web searches: ~5-15 seconds (depends on number of claims)
   - Verification: ~10-15 seconds

5. **Verify success**: You should be redirected to the post editor

---

### Test 3: Review Fact-Check Results

**Goal**: Verify fact-checks are displayed correctly

1. **On the post editor page**, check the right sidebar:

   **Should see**:
   - Overall Score (0-100)
   - Count of Verified claims (green)
   - Count of Uncertain claims (yellow)
   - Count of Unverified claims (red)

2. **Expand the claims section**:
   - Each claim should show:
     - The extracted claim text
     - Status (verified/uncertain/unverified)
     - Confidence score (0-100)

3. **Verify the content**:
   - Preview mode: Should render the blog post nicely
   - Edit mode: Should show raw markdown

---

### Test 4: Edge Cases

#### Test 4a: Content with NO Factual Claims

**Create a strategy for**:
```
Client Name: Yoga Studio
Industry: Health & Wellness
Goals: Build community, Share inspiration
Target Audience: Yoga practitioners
Keywords: mindfulness, meditation, yoga philosophy
```

**Generate a post** from a philosophical/opinion-based topic

**Expected result**:
- Overall score: 100 (perfect)
- Total claims: 0
- Message: "No factual claims found to verify"

#### Test 4b: Content with MANY Claims

**Create a strategy for**:
```
Client Name: Tech Research Firm
Industry: Technology Research
Goals: Share industry insights
Target Audience: Tech executives
Keywords: AI statistics, cloud computing trends, cybersecurity data
```

**Generate a post** from a statistics/data-heavy topic

**Expected result**:
- 5-10+ claims extracted
- Multiple Brave searches performed
- Mix of verified/uncertain/unverified claims
- Should take 45-90 seconds total

---

## 🐛 Troubleshooting

### Issue: "Brave Search API key not configured"

**Console shows**: `Brave Search API key not configured, skipping web search`

**Solution**:
1. Check `.env.local` has: `BRAVE_SEARCH_API_KEY=BSAm-VPjTVPc5o6Td1XxKsuktfzcGLL`
2. Restart the dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Issue: "No factual claims found" for every post

**Possible causes**:
1. Content is truly opinion-based (this is normal)
2. Claude's claim extraction is being too conservative

**To verify**:
- Try a very factual topic like "SaaS Market Statistics 2024"
- Check server console logs for errors

### Issue: Fact-check taking too long (>2 minutes)

**Possible causes**:
1. Many claims extracted (10+)
2. Brave API slow response

**To verify**:
- Check server console for number of claims
- Each claim adds ~2-3 seconds
- 10 claims = ~30 seconds just for searches

### Issue: All claims marked "unverified"

**Possible causes**:
1. Brave Search returning no results
2. Search queries too specific/niche

**To verify**:
- Check server console for search results
- Try broader topics (marketing, technology, business)

### Issue: Server crashes during fact-checking

**Check for**:
- Out of memory (large number of searches)
- API rate limits exceeded
- Network timeouts

**Solution**:
- Reduce max claims in `lib/fact-check.ts` (currently unlimited)
- Add timeout handling

---

## 📊 What to Check in Logs

### Server Console (Terminal)

```bash
# Good output:
Extracting factual claims...
Found 5 claims to verify
Searching for: "B2B SaaS market grew by 23% in 2023"
Searching for: "Content marketing ROI averages 3:1"
...
Verifying claims with Claude...
Fact-checking complete: 3/5 verified

# Warning (but OK):
Brave Search API key not configured, skipping web search
# → Means no Brave key, fact-checking will skip search

# Error:
Error performing fact check: [error details]
# → Something went wrong, check the error
```

### Browser Console (DevTools)

```javascript
// Should NOT see:
- 500 errors on /api/topics/[id]/generate
- Network timeouts
- "Unauthorized" errors

// Should see:
- 200 OK on API calls
- Redirect to post editor after generation
```

---

## ✅ Success Criteria

After testing, you should have:

- [ ] Created at least one strategy successfully
- [ ] Generated at least one post with fact-checking
- [ ] Seen fact-check results in the post editor
- [ ] Verified claims have sources (even if unverified)
- [ ] Overall score calculated (0-100)
- [ ] No critical errors in console
- [ ] Post saved to database
- [ ] Can edit and save the post
- [ ] Can approve the post

---

## 📝 Test Results Template

Copy this and fill it out:

```
## Test Results - [Date]

### Environment
- Server: http://localhost:____
- Brave API: ✅ Configured / ❌ Not configured
- Database: ✅ Connected / ❌ Error

### Test 1: Strategy Generation
- Status: ✅ Pass / ❌ Fail
- Topics generated: ___
- Time taken: ___ seconds
- Notes: ___________

### Test 2: Content Generation
- Status: ✅ Pass / ❌ Fail
- Claims extracted: ___
- Verified: ___ | Uncertain: ___ | Unverified: ___
- Overall score: ___/100
- Time taken: ___ seconds
- Notes: ___________

### Test 3: Fact-Check Display
- Status: ✅ Pass / ❌ Fail
- UI renders correctly: ✅ / ❌
- Claims visible: ✅ / ❌
- Sources shown: ✅ / ❌
- Notes: ___________

### Issues Found
1. ___________
2. ___________
3. ___________

### Overall Assessment
- Ready for production: ✅ / ❌ / ⚠️ With fixes
- Next steps: ___________
```

---

## 🚀 Next Steps After Testing

If all tests pass:

1. **Run the database migration** (see `RUN-THIS-MIGRATION.md`)
2. **Add export functionality** to post editor
3. **Implement rate limiting** for API calls
4. **Test with real client data**
5. **Deploy to Vercel staging**

If tests fail:

1. **Document the errors** using template above
2. **Check server console logs**
3. **Verify environment variables**
4. **Test individual components** (strategy, content, fact-check separately)
5. **Ask for help** with specific error messages

---

## 📞 Need Help?

If you encounter issues:

1. **Share**:
   - Server console logs
   - Browser console errors
   - Specific steps that failed
   - Test results template

2. **Check**:
   - `IMPLEMENTATION-SUMMARY.md` for integration details
   - `CODING-STYLE-GUIDE.md` for code patterns
   - `.env.local` for missing variables

---

Last Updated: 2025-11-03

**Your dev server is ready at port 3001!**
**Start testing: http://localhost:3001**
