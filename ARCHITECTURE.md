# Architecture Documentation

## System Overview

This application uses **Supabase as the primary backend** with a legacy Express backend that is **no longer actively used** by the frontend.

## Current Architecture (Active)

```
Frontend (React + Vite)
    ↓
Supabase Backend
    ├─ PostgreSQL Database
    ├─ Authentication
    ├─ Storage (file uploads)
    └─ Real-time subscriptions
```

## Data Flow

### Authentication
- **Provider**: Supabase Auth
- **Storage**: localStorage (with memory fallback)
- **Context**: `src/context/SupabaseAuthContext.tsx`
- **Client**: `src/lib/supabase.ts`

### Data Persistence
- **Authenticated Users**: Supabase PostgreSQL
- **Anonymous Users**: localStorage (temporary)
- **API Client**: `src/lib/supabaseApi.ts`

### AI Services
- **Hand Analysis**: Server-side via `/api/ai/analyze-hand`
- **Outfit Analysis**: Server-side via `/api/ai/analyze-outfit`
- **Design Generation**: Server-side via `/api/ai/generate-design`
- **Server**: Express backend at `server/src/routes/ai.ts`

## Legacy Express Backend (Inactive)

The `server/` directory contains a complete Express + Prisma backend that was used during development but is **NOT used by the production frontend**.

### Why It Exists
- Initial development used Express backend
- Migration to Supabase for better scalability
- Kept for reference and potential future use

### What It Contains
- SQLite database (Prisma ORM)
- JWT authentication
- File upload handling
- Email service
- Complete REST API

### Should You Remove It?

**Keep it if:**
- You plan to migrate back to self-hosted backend
- You need the AI endpoints (currently used)
- You want email service functionality

**Remove it if:**
- You're fully committed to Supabase
- You want to reduce maintenance burden
- You migrate AI endpoints to Supabase Edge Functions

## File Structure

```
src/
├── lib/
│   ├── supabase.ts          ← Active: Supabase client
│   ├── supabaseApi.ts       ← Active: API methods
│   ├── api.ts               ← Inactive: Express API client
│   └── storage.ts           ← Active: Safe localStorage wrapper
├── context/
│   └── SupabaseAuthContext.tsx  ← Active: Auth provider
└── services/
    └── geminiService.ts     ← Active: AI service (uses server)

server/                      ← Legacy (except AI routes)
├── src/routes/ai.ts        ← Active: AI endpoints
└── ...                     ← Inactive: Other routes
```

## Environment Variables

### Frontend (.env.local)
```env
# Supabase (Active)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Express Backend (for AI only)
VITE_API_URL=http://localhost:3001/api
```

### Backend (server/.env)
```env
# Only needed for AI endpoints
GEMINI_API_KEY=your-gemini-key
PORT=3001
```

## Migration Path (If Removing Express)

1. **Migrate AI Endpoints** to Supabase Edge Functions
2. **Remove** `server/` directory
3. **Remove** `src/lib/api.ts`
4. **Update** `src/services/geminiService.ts` to call Edge Functions
5. **Update** environment variables

## Current Status

✅ **Active**: Supabase backend, AI endpoints
❌ **Inactive**: Express auth, designs, bookings, etc.
⚠️ **Hybrid**: AI generation uses Express server
