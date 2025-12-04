# Deployment Checklist - Security Updates

## ✅ Pre-Deployment Verification

### 1. Environment Variables

#### Frontend (.env.local) ✅
```bash
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://kowuwhlwetplermbdvbh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- ✅ No `VITE_GEMINI_API_KEY` (removed for security)
- ✅ Supabase credentials present
- ✅ API URL points to backend

#### Backend (server/.env) ✅
```bash
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://henna-harmony-him1.vercel.app
JWT_SECRET=your_secure_jwt_secret_at_least_32_characters_long
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=postgresql://your_database_connection_string
```
- ✅ `GEMINI_API_KEY` present (secure on server)
- ✅ JWT secret configured
- ✅ Database URL configured

### 2. Code Security Audit

Run this command to verify API key is NOT in client bundle:
```bash
npm run build
grep -r "AIzaSy" dist/
```
**Expected result**: No matches (empty output)

If API key is found, **DO NOT DEPLOY** - contact support immediately.

### 3. Test Locally

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
npm run dev

# Open browser
open http://localhost:3000
```

**Test these features**:
- [ ] Upload hand image
- [ ] Analyze hand (should work)
- [ ] Generate design (should work)
- [ ] Try 10 rapid generations (should see rate limit after 5)
- [ ] Save design while logged in (should upload to Supabase)
- [ ] Save design anonymously (should use localStorage)
- [ ] Log in after saving anonymously (designs should migrate)

### 4. Verify Security Features

#### Rate Limiting Test
```javascript
// In browser console
for (let i = 0; i < 10; i++) {
  console.log(`Attempt ${i + 1}`);
  // Try generating design
}
// Should fail after 5 attempts with rate limit message
```

#### API Key Security Test
```bash
# Build production bundle
npm run build

# Search for API key in bundle
grep -r "AIzaSy" dist/

# Should return NOTHING - if found, API key is exposed!
```

#### Role Verification Test
```javascript
// In browser console (as regular user)
localStorage.setItem('user', JSON.stringify({...user, role: 'ADMIN'}));
// Refresh page
// Try accessing /admin
// Should be denied (role verified from database)
```

## 🚀 Production Deployment

### Vercel Frontend Deployment

1. **Set Environment Variables in Vercel Dashboard**:
   ```
   VITE_API_URL=https://your-backend.vercel.app/api
   VITE_SUPABASE_URL=https://kowuwhlwetplermbdvbh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **DO NOT SET** (security risk):
   ```
   ❌ VITE_GEMINI_API_KEY  # Never expose API keys in frontend
   ```

3. **Deploy**:
   ```bash
   git push origin main
   # Or use Vercel CLI
   vercel --prod
   ```

### Vercel Backend Deployment

1. **Set Environment Variables in Vercel Dashboard**:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   JWT_SECRET=your_secure_jwt_secret_at_least_32_characters_long
   FRONTEND_URL=https://henna-harmony-him1.vercel.app
   DATABASE_URL=postgresql://postgres.kowuwhlwetplermbdvbh:...
   NODE_ENV=production
   PORT=3001
   ```

2. **Deploy Backend**:
   ```bash
   cd server
   vercel --prod
   ```

3. **Update Frontend API URL**:
   - Get backend URL from Vercel
   - Update `VITE_API_URL` in frontend Vercel settings
   - Redeploy frontend

### Supabase Setup

1. **Create Storage Bucket**:
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('designs', 'designs', true);
   ```

2. **Set Storage Policies**:
   ```sql
   -- Public read access
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'designs');

   -- Authenticated users can upload
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'designs' 
     AND auth.role() = 'authenticated'
   );

   -- Users can delete own files
   CREATE POLICY "Users can delete own files"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'designs' 
     AND auth.uid() = owner
   );
   ```

3. **Verify RLS Policies**:
   - Check that Row Level Security is enabled on all tables
   - Test that users can only access their own data

## 🧪 Post-Deployment Testing

### 1. Production Smoke Tests

Visit your production URL and test:

- [ ] Homepage loads
- [ ] Can register new account
- [ ] Can log in
- [ ] Can upload hand image
- [ ] Can generate design (AI works)
- [ ] Can save design (uploads to Supabase)
- [ ] Can view saved designs
- [ ] Can book consultation
- [ ] Admin panel works (for admin users)
- [ ] Rate limiting works (try 10 rapid generations)

### 2. Security Verification

```bash
# Check production bundle for API key
curl https://your-app.vercel.app/_next/static/chunks/*.js | grep -i "AIzaSy"
# Should return nothing

# Check that API calls go through backend
# Open browser DevTools > Network
# Generate a design
# Should see POST to /api/ai/generate-design (not direct to Google)
```

### 3. Performance Check

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] Images load from Supabase CDN

### 4. Error Handling

Test error scenarios:
- [ ] Invalid login credentials
- [ ] Rate limit exceeded
- [ ] Network error during generation
- [ ] Invalid image upload
- [ ] Unauthorized access to admin

## 📊 Monitoring

### Set Up Monitoring

1. **Vercel Analytics**:
   - Enable in Vercel dashboard
   - Monitor page views and performance

2. **Supabase Logs**:
   - Check database logs for errors
   - Monitor storage usage

3. **Error Tracking** (Optional):
   - Set up Sentry or similar
   - Track client-side errors

### Key Metrics to Monitor

- API response times
- Error rates
- Rate limit hits
- Storage usage
- Database query performance
- AI generation success rate

## 🔒 Security Checklist

- [x] API key moved to server-side
- [x] Rate limiting implemented
- [x] Input sanitization utilities created
- [x] CSRF protection utilities available
- [x] Role verification from database
- [x] XSS protection implemented
- [x] Image upload to secure storage
- [x] Design migration on login
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] CSP headers configured (optional)
- [ ] Regular security audits scheduled

## 🐛 Troubleshooting

### "AI service not configured"
**Cause**: Backend can't access Gemini API key
**Fix**: 
1. Check `GEMINI_API_KEY` in Vercel backend environment
2. Redeploy backend
3. Check backend logs

### "Rate limit exceeded"
**Cause**: User hit rate limit (5 generations/min)
**Fix**: This is normal behavior. User should wait 60 seconds.

### "Failed to upload image"
**Cause**: Supabase storage not configured
**Fix**:
1. Create 'designs' bucket in Supabase
2. Set storage policies (see above)
3. Verify bucket is public

### "Unauthorized" on admin routes
**Cause**: Role verification working correctly
**Fix**: Ensure user has ADMIN role in database (not just localStorage)

### Backend not responding
**Cause**: Backend deployment failed or sleeping
**Fix**:
1. Check Vercel backend logs
2. Verify environment variables set
3. Redeploy backend

## 📝 Rollback Plan

If critical issues occur:

1. **Revert to previous deployment**:
   ```bash
   vercel rollback
   ```

2. **Emergency API key exposure**:
   - Immediately revoke exposed API key in Google Cloud Console
   - Generate new API key
   - Update backend environment variable
   - Redeploy

3. **Database issues**:
   - Supabase has automatic backups
   - Restore from backup if needed

## ✅ Final Checklist

Before marking deployment complete:

- [ ] All environment variables set correctly
- [ ] API key NOT in client bundle (verified)
- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] AI features working in production
- [ ] Rate limiting active
- [ ] Image upload working
- [ ] Design migration tested
- [ ] Admin panel accessible (for admins only)
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Monitoring set up
- [ ] Team notified of changes

## 🎉 Success Criteria

Deployment is successful when:

1. ✅ All features work in production
2. ✅ No API key exposed in client
3. ✅ Rate limiting prevents abuse
4. ✅ Images upload to Supabase
5. ✅ Designs migrate on login
6. ✅ Security measures active
7. ✅ Performance acceptable
8. ✅ No critical errors

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Version**: 2.0.0 (Security Update)  
**Status**: ⬜ Pending / ⬜ In Progress / ⬜ Complete
