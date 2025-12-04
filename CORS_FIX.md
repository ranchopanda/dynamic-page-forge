# CORS Error Fix

## Problem
CORS preflight requests are being blocked because:
1. HTTPS redirect was happening BEFORE CORS headers were set
2. NODE_ENV was set to 'production' in development
3. Preflight OPTIONS requests were being redirected

## Solution Applied

### 1. Fixed server/src/index.ts
**Changed**: Moved CORS configuration BEFORE HTTPS redirect
**Added**: Skip HTTPS redirect for OPTIONS (preflight) requests
**Added**: Explicit CORS configuration for development

```typescript
// CORS MUST come before HTTPS redirect
app.use(cors({
  origin: config.nodeEnv === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001']
    : config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Skip redirect for OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  // ... HTTPS redirect
});
```

### 2. Fixed server/.env
**Changed**: NODE_ENV from 'production' to 'development'
**Changed**: FRONTEND_URL to 'http://localhost:3000'

```bash
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Fixed server/src/config/index.ts
**Added**: Better default for frontendUrl based on NODE_ENV

## How to Apply the Fix

### Step 1: Restart Backend Server

**Stop the current server** (Ctrl+C in the terminal running the backend)

Then restart:
```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📝 Environment: development
```

### Step 2: Verify CORS is Working

Test the health endpoint:
```bash
curl -i http://localhost:3001/health
```

Should see:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
...
```

### Step 3: Test AI Endpoints

In your browser console (http://localhost:3000):
```javascript
fetch('http://localhost:3001/api/ai/analyze-hand', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Should NOT see CORS errors anymore.

## Verification Checklist

- [ ] Backend server restarted
- [ ] Server shows "Environment: development"
- [ ] Health endpoint returns 200 OK
- [ ] CORS headers present in response
- [ ] AI endpoints work without CORS errors
- [ ] Hand analysis works in UI
- [ ] Design generation works in UI

## If Still Not Working

### Check 1: Server Environment
```bash
cd server
cat .env | grep NODE_ENV
# Should show: NODE_ENV=development
```

### Check 2: Server is Running
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check 3: CORS Headers
```bash
curl -i -X OPTIONS http://localhost:3001/api/ai/analyze-hand \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
```

Should see:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### Check 4: No HTTPS Redirect in Development
```bash
curl -i http://localhost:3001/health
# Should return 200 OK, NOT 301 Redirect
```

## Production Configuration

For production deployment, use these settings:

**server/.env (production)**:
```bash
NODE_ENV=production
FRONTEND_URL=https://henna-harmony-him1.vercel.app
```

The CORS and HTTPS redirect will work correctly in production because:
1. CORS is configured first
2. OPTIONS requests skip the redirect
3. Production URL is HTTPS by default

## Common Issues

### Issue: "Redirect is not allowed for a preflight request"
**Cause**: HTTPS redirect happening before CORS
**Fix**: Applied - CORS now comes first

### Issue: "No 'Access-Control-Allow-Origin' header"
**Cause**: CORS not configured or wrong origin
**Fix**: Applied - CORS configured for localhost in development

### Issue: Server redirecting to HTTPS in development
**Cause**: NODE_ENV set to 'production'
**Fix**: Applied - Changed to 'development' in server/.env

## Testing After Fix

1. **Restart backend**: `cd server && npm run dev`
2. **Open frontend**: http://localhost:3000
3. **Upload hand image**
4. **Click "Analyze My Hand"**
5. **Should work without CORS errors** ✅

## Summary

The fix ensures:
- ✅ CORS headers sent before any redirects
- ✅ OPTIONS (preflight) requests handled correctly
- ✅ Development uses HTTP (no redirect)
- ✅ Production uses HTTPS (with proper CORS)
- ✅ Both localhost:3000 and localhost:3001 allowed in dev

**Status**: Fixed - Restart backend server to apply changes
