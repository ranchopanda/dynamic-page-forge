# Deployment Guide

## Deploy to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed (`npm i -g vercel`)

### Step 1: Deploy Backend (Server)

```bash
cd server
vercel --prod
```

When prompted:
- Set up and deploy: **Y**
- Which scope: Choose your account
- Link to existing project: **N**
- Project name: **henna-harmony-api**
- Directory: **./server**
- Override settings: **N**

After deployment, note the URL (e.g., `https://henna-harmony-api.vercel.app`)

### Step 2: Set Backend Environment Variables

In Vercel dashboard for the backend project:

1. Go to Settings → Environment Variables
2. Add these variables:

```
DATABASE_URL = your-postgres-connection-string
JWT_SECRET = your-secret-key-here
FRONTEND_URL = https://your-frontend-url.vercel.app
NODE_ENV = production
```

**For Database:** Use a hosted PostgreSQL (recommended):
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Free tier available

### Step 3: Deploy Frontend

```bash
# From project root
vercel --prod
```

When prompted:
- Set up and deploy: **Y**
- Which scope: Choose your account
- Link to existing project: **N**
- Project name: **henna-harmony**
- Directory: **./** (root)
- Override settings: **N**

### Step 4: Set Frontend Environment Variables

In Vercel dashboard for the frontend project:

1. Go to Settings → Environment Variables
2. Add these variables:

```
VITE_API_URL = https://your-backend-url.vercel.app/api
VITE_GEMINI_API_KEY = your-gemini-api-key
```

### Step 5: Update Backend URL in Frontend

Update `vercel.json` in root:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://YOUR-ACTUAL-BACKEND-URL.vercel.app/api/$1"
    }
  ]
}
```

### Step 6: Redeploy

```bash
# Redeploy frontend with updated config
vercel --prod
```

## Quick Deploy (Alternative)

If you want to deploy both at once:

```bash
# Deploy backend
cd server && vercel --prod

# Deploy frontend (from root)
cd .. && vercel --prod
```

## Post-Deployment

1. **Initialize Database:**
   - Connect to your hosted PostgreSQL
   - Run migrations: `npx prisma db push`
   - Seed data: `npx tsx prisma/seed.ts`

2. **Test the deployment:**
   - Visit your frontend URL
   - Try signing in with: admin@hennaharmony.com / admin123
   - Test the design flow

## Troubleshooting

- **CORS errors:** Make sure `FRONTEND_URL` is set correctly in backend env vars
- **Database errors:** Verify `DATABASE_URL` connection string
- **API not found:** Check the proxy route in `vercel.json`
- **Build fails:** Check build logs in Vercel dashboard

## Local Development

```bash
npm run dev:all  # Runs both frontend and backend
```
