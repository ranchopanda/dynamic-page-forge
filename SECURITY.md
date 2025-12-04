# Security Documentation

## Security Measures Implemented

### 1. API Key Protection ✅
**Issue**: Gemini API key was exposed in client-side code
**Fix**: Moved all AI operations to server-side endpoints
- Client calls `/api/ai/*` endpoints
- Server holds API key securely in environment variables
- API key never exposed in browser

**Files Changed**:
- `src/services/geminiService.ts` - Now calls server endpoints
- `server/src/routes/ai.ts` - Server-side AI handler
- `.env.example` - Removed VITE_GEMINI_API_KEY

### 2. Rate Limiting ✅
**Issue**: No protection against API abuse
**Fix**: Implemented client-side and server-side rate limiting

**Client-Side** (`src/lib/rateLimiter.ts`):
- AI Generation: 5 requests/minute, 10s cooldown
- AI Analysis: 10 requests/minute, 3s cooldown
- Image Upload: 20 requests/minute, 1s cooldown

**Server-Side** (`server/src/index.ts`):
- General API: 100 requests/15min per IP
- Auth endpoints: 10 requests/15min per IP
- Password reset: 3 requests/hour per IP

### 3. Input Sanitization ✅
**Issue**: No XSS protection
**Fix**: Created security utilities (`src/lib/security.ts`)

**Features**:
- HTML sanitization (removes script tags, event handlers)
- HTML entity escaping
- Email/phone/URL validation
- Filename sanitization (prevents path traversal)
- Image type and size validation
- Recursive object sanitization

**Usage**:
```typescript
import { sanitizeHtml, isValidEmail } from './lib/security';

const clean = sanitizeHtml(userInput);
if (isValidEmail(email)) { /* ... */ }
```

### 4. Role-Based Access Control ✅
**Issue**: Admin routes accessible if role changed in localStorage
**Fix**: Server-side role verification from database

**Implementation**:
- Server middleware verifies role from database, not token
- Client re-fetches role from database on every auth check
- Role validation on both client and server

**Files**:
- `server/src/middleware/auth.ts` - Database role verification
- `src/context/SupabaseAuthContext.tsx` - Client role validation

### 5. CSRF Protection ✅
**Issue**: No CSRF token validation
**Fix**: CSRF utilities in security module

**Features**:
- Token generation: `generateCsrfToken()`
- Token storage: `storeCsrfToken(token)`
- Token validation: `validateCsrfToken(token)`

**Usage** (for sensitive forms):
```typescript
import { generateCsrfToken, storeCsrfToken } from './lib/security';

// On form mount
const token = generateCsrfToken();
storeCsrfToken(token);

// On form submit
if (!validateCsrfToken(formToken)) {
  throw new Error('Invalid CSRF token');
}
```

### 6. Image Storage Security ✅
**Issue**: Large base64 images in localStorage
**Fix**: Upload to Supabase Storage for authenticated users

**Implementation**:
- Authenticated users: Images uploaded to Supabase Storage
- Anonymous users: Base64 in localStorage (temporary)
- Images migrated to storage on login

**Benefits**:
- Reduced localStorage usage
- Better performance
- Persistent storage
- CDN delivery

### 7. Data Migration ✅
**Issue**: Anonymous designs lost on login
**Fix**: Automatic migration on authentication

**Process**:
1. User logs in
2. System reads localStorage designs
3. Uploads each design to Supabase
4. Clears localStorage after successful migration

**File**: `src/context/SupabaseAuthContext.tsx`

## Security Best Practices

### Environment Variables
```bash
# ✅ GOOD - Server-side only
GEMINI_API_KEY=secret

# ❌ BAD - Exposed in client bundle
VITE_GEMINI_API_KEY=secret
```

### Authentication
- ✅ JWT tokens stored in httpOnly cookies (server)
- ✅ Supabase session in localStorage with fallback
- ✅ Role verified from database, not token
- ✅ Session timeout and refresh

### Data Validation
```typescript
// Always validate and sanitize user input
const sanitized = sanitizeUserInput(req.body);
const email = sanitized.email;

if (!isValidEmail(email)) {
  throw new Error('Invalid email');
}
```

### File Uploads
```typescript
// Validate file type and size
if (!isValidImageType(file)) {
  throw new Error('Invalid file type');
}

if (!isValidImageSize(file, 10)) {
  throw new Error('File too large (max 10MB)');
}

// Sanitize filename
const safeName = sanitizeFilename(file.name);
```

### Database Queries
- ✅ Use Prisma/Supabase (parameterized queries)
- ✅ Never concatenate user input into queries
- ✅ Use Row Level Security (RLS) in Supabase

## Remaining Security Considerations

### High Priority
1. **HTTPS Enforcement** - Ensure production uses HTTPS only
2. **Content Security Policy** - Add CSP headers
3. **Secure Headers** - Helmet.js already configured
4. **Session Management** - Implement session invalidation

### Medium Priority
5. **Two-Factor Authentication** - Add 2FA for admin accounts
6. **Audit Logging** - Log sensitive operations
7. **Backup Strategy** - Regular database backups
8. **Penetration Testing** - Professional security audit

### Low Priority
9. **Honeypot Fields** - Add to forms for bot detection
10. **Captcha** - Add to registration/login if needed

## Security Checklist

- [x] API keys protected (server-side only)
- [x] Rate limiting implemented
- [x] Input sanitization
- [x] XSS protection
- [x] CSRF utilities available
- [x] Role-based access control
- [x] Database role verification
- [x] Secure file uploads
- [x] Image storage optimization
- [x] Data migration on login
- [ ] HTTPS enforcement (production)
- [ ] CSP headers
- [ ] 2FA for admins
- [ ] Audit logging
- [ ] Regular security audits

## Reporting Security Issues

If you discover a security vulnerability, please email:
**himanshiparashar44@gmail.com**

Do not create public GitHub issues for security vulnerabilities.

## Security Updates

- **2024-12-03**: Initial security audit and fixes
  - Moved API keys to server-side
  - Implemented rate limiting
  - Added input sanitization
  - Enhanced role verification
  - Added CSRF protection utilities
