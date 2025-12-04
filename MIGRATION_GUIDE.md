# Migration Guide

## Overview

This guide documents the recent security and architecture improvements made to the application.

## Breaking Changes

### 1. Gemini API Key Location

**Before**:
```typescript
// Client-side (EXPOSED)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

**After**:
```typescript
// Server-side (SECURE)
const apiKey = process.env.GEMINI_API_KEY;
```

**Action Required**:
1. Remove `VITE_GEMINI_API_KEY` from `.env.local`
2. Add `GEMINI_API_KEY` to `server/.env`
3. Restart both frontend and backend servers

### 2. AI Service Calls

**Before**:
```typescript
// Direct API calls from client
const response = await fetch(`https://generativelanguage.googleapis.com/...?key=${API_KEY}`);
```

**After**:
```typescript
// Calls through server
const response = await fetch(`${API_URL}/ai/analyze-hand`, {
  method: 'POST',
  body: JSON.stringify({ image: base64 })
});
```

**Action Required**:
- Ensure `VITE_API_URL` is set in `.env.local`
- Ensure backend server is running for AI features to work

### 3. Rate Limiting

**New Behavior**:
- AI generation limited to 5 requests/minute with 10s cooldown
- AI analysis limited to 10 requests/minute with 3s cooldown
- Users will see error messages when limits exceeded

**Action Required**:
- Inform users about rate limits
- Consider upgrading limits for premium users

### 4. Image Storage

**Before**:
```typescript
// Base64 stored in localStorage
localStorage.setItem('design', base64Image);
```

**After**:
```typescript
// Uploaded to Supabase Storage (authenticated users)
const url = await supabaseApi.uploadImage(file);
```

**Action Required**:
- Ensure Supabase Storage bucket 'designs' exists
- Set appropriate bucket policies
- Anonymous users still use localStorage (temporary)

## New Features

### 1. Automatic Design Migration

When users log in, their anonymous designs are automatically migrated to their account.

**How it works**:
1. User creates designs while not logged in (stored in localStorage)
2. User logs in or registers
3. System automatically uploads designs to Supabase
4. localStorage is cleared after successful migration

**No action required** - happens automatically

### 2. Security Utilities

New security module available at `src/lib/security.ts`:

```typescript
import { 
  sanitizeHtml, 
  isValidEmail, 
  isValidImageType 
} from './lib/security';

// Sanitize user input
const clean = sanitizeHtml(userInput);

// Validate email
if (isValidEmail(email)) { /* ... */ }

// Validate image
if (isValidImageType(file)) { /* ... */ }
```

### 3. Rate Limiter

Client-side rate limiting available at `src/lib/rateLimiter.ts`:

```typescript
import { rateLimiter, RATE_LIMITS } from './lib/rateLimiter';

// Check if operation allowed
const check = rateLimiter.checkLimit('my-operation', 10, 60000);
if (!check.allowed) {
  alert(`Please wait ${check.retryAfter} seconds`);
}
```

## Environment Variables Update

### Frontend (.env.local)

**Remove**:
```env
VITE_GEMINI_API_KEY=xxx  # ❌ REMOVE - Security risk
```

**Keep**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

### Backend (server/.env)

**Add**:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

**Keep existing**:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
DATABASE_URL=file:./dev.db
```

## Database Changes

### Supabase Storage Setup

Create storage bucket for designs:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('designs', 'designs', true);

-- Set policies
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'designs');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'designs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'designs' 
  AND auth.uid() = owner
);
```

## Testing the Migration

### 1. Test API Key Security

```bash
# Should NOT find API key in client bundle
npm run build
grep -r "AIzaSy" dist/

# Should be empty - if found, API key is exposed!
```

### 2. Test Rate Limiting

```javascript
// In browser console
for (let i = 0; i < 10; i++) {
  await generateHennaDesign(image, style);
}
// Should see rate limit error after 5 attempts
```

### 3. Test Design Migration

1. Open app in incognito mode
2. Create a design (not logged in)
3. Log in with existing account
4. Check "Saved Designs" - should see migrated design
5. Check localStorage - should be empty

### 4. Test Image Upload

```javascript
// In browser console (logged in)
const file = new File(['test'], 'test.png', { type: 'image/png' });
const url = await supabaseApi.uploadImage(file);
console.log(url); // Should be Supabase Storage URL
```

## Rollback Plan

If issues occur, you can rollback:

### 1. Restore Client-Side AI (Emergency Only)

```typescript
// In src/services/geminiService.ts
// Temporarily restore direct API calls
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// ... restore old code
```

**WARNING**: This exposes your API key. Only use temporarily.

### 2. Disable Rate Limiting

```typescript
// In src/services/geminiService.ts
// Comment out rate limit checks
// const check = rateLimiter.checkLimit(...);
// if (!check.allowed) { ... }
```

### 3. Disable Image Upload

```typescript
// In src/components/DesignFlow.tsx
// Use base64 instead of upload
generatedImageUrl: generatedImage, // Instead of uploaded URL
```

## Performance Impact

### Before
- Client-side AI calls: ~2-5s
- localStorage writes: <10ms
- No rate limiting overhead

### After
- Server-side AI calls: ~2-5s (same)
- Image upload: +500ms-2s (authenticated users only)
- Rate limiting: <1ms overhead
- Design migration: +1-3s on first login

**Net impact**: Minimal for most users, slight delay for authenticated users saving designs.

## Support

If you encounter issues:

1. Check browser console for errors
2. Check server logs: `npm run server:dev`
3. Verify environment variables are set
4. Ensure backend server is running
5. Clear browser cache and localStorage

For persistent issues, contact: himanshiparashar44@gmail.com

## Changelog

### 2024-12-03 - Security & Architecture Update

**Added**:
- Server-side AI endpoints
- Rate limiting (client + server)
- Input sanitization utilities
- CSRF protection utilities
- Role verification from database
- Automatic design migration
- Image upload to Supabase Storage

**Changed**:
- AI calls now go through server
- Images uploaded to storage (authenticated)
- Role checked from database, not token

**Removed**:
- Client-side Gemini API key
- Direct API calls from client

**Security**:
- Fixed API key exposure
- Fixed role manipulation vulnerability
- Added XSS protection
- Added rate limiting
