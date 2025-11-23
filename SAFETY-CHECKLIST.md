# Safety Checklist for Major Changes

## ⚠️ BEFORE Making Any Major Changes

### 1. Backup Database
```bash
node backup-database.js
```
OR go to Neon dashboard and create manual backup.

### 2. Create Git Branch
```bash
git checkout -b feature/your-change-name
```

### 3. Verify Current State
```bash
git status
git log --oneline -5
```

---

## 🧪 Testing Changes

### 4. Test Locally First
```bash
npm run dev
# Test at http://localhost:3001
```

### 5. Run Type Check
```bash
npx tsc --noEmit
```

### 6. Test Build
```bash
npm run build
```

---

## 🚀 Deploying to Production

### 7. Commit Changes
```bash
git add .
git commit -m "feat: description of change"
```

### 8. Push to Preview Branch First
```bash
git push origin feature/your-change-name
```
This creates a Vercel preview deployment - test it first!

### 9. Merge to Main (if preview works)
```bash
git checkout main
git merge feature/your-change-name
git push origin main
```

### 10. Monitor Production
- Check Vercel deployment logs
- Test key features (sign-in, main pages)
- Check error monitoring

---

## 🆘 If Something Breaks

### Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Database Rollback
```bash
# Restore from backup in Neon dashboard
# Or use pg_restore with backup file
```

---

## 📋 Environment Variables Checklist

Before deploying, verify these are set in Vercel:

- [ ] CLERK_SECRET_KEY (sk_live_ for production)
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (pk_live_ for production)
- [ ] DATABASE_URL
- [ ] OPENAI_API_KEY
- [ ] ANTHROPIC_API_KEY
- [ ] BRAVE_SEARCH_API_KEY
- [ ] INNGEST_EVENT_KEY (for production)
- [ ] INNGEST_SIGNING_KEY (for production)

---

## 🔍 Common Issues After Deployment

### Sign-in doesn't work
- [ ] Check Clerk keys are LIVE keys (not TEST)
- [ ] Verify domain in Clerk dashboard
- [ ] Clear browser cache

### Database errors
- [ ] Verify DATABASE_URL in Vercel
- [ ] Check migrations ran successfully
- [ ] Verify user_id types match (UUID)

### Build fails
- [ ] Check TypeScript errors locally first
- [ ] Verify all imports are correct
- [ ] Check for missing dependencies

---

**Last Updated:** 2025-11-23
