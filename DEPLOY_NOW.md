# 🚀 Production Deployment Guide

## ✅ Files Already Configured
- ✅ CSP headers updated in `vercel.json`
- ✅ `.env.local` configured for local development
- ✅ `.env.production` template ready

## 🔧 Vercel Environment Variables (REQUIRED)

Go to: https://vercel.com/stufi339s-projects/henna-harmony-him1/settings/environment-variables

Add these 3 variables:

### Variable 1: API URL
```
Name: VITE_API_URL
Value: /api
Environment: Production, Preview, Development
```

### Variable 2: Supabase URL
```
Name: VITE_SUPABASE_URL
Value: https://kowuwhlwetplermbdvbh.supabase.co
Environment: Production, Preview, Development
```

### Variable 3: Supabase Anon Key
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3V3aGx3ZXRwbGVybWJkdmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTkwNzQsImV4cCI6MjA4MDIzNTA3NH0.1D7JUXGprx8OfJap3slR4J6-UZPhnmMSWsamdOVsTCM
Environment: Production, Preview, Development
```

## 📊 Supabase Setup (Make Yourself Admin)

Go to: https://supabase.com/dashboard/project/kowuwhlwetplermbdvbh/editor

Click "SQL Editor" and run:

```sql
UPDATE profiles
SET role = 'ADMIN'
WHERE email = 'justfun2842@gmail.com';
```

## 🚀 Deploy Commands

```bash
# Commit changes
git add .
git commit -m "Production ready: CSP fixed, env configured"
git push origin main
```

Vercel will auto-deploy. Or manually trigger from dashboard.

## ✅ Post-Deployment Checklist

1. [ ] Environment variables added in Vercel
2. [ ] Admin role set in Supabase
3. [ ] Code pushed to GitHub
4. [ ] Vercel deployment successful
5. [ ] Test login at https://henna-harmony-him1.vercel.app
6. [ ] Verify Admin panel appears in header
7. [ ] Test design generation (no CSP errors)

## 🐛 If Issues Persist

1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
2. Clear browser cache
3. Check Vercel deployment logs
4. Verify environment variables are set for "Production"

## 📝 Notes

- Local dev uses `http://localhost:3001/api`
- Production uses `/api` (relative path, same domain)
- CSP allows: self, Supabase, Vercel, Google APIs
- Admin role stored in `profiles` table, not `admin_users`
