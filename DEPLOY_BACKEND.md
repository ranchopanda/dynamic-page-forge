# 🚀 Backend Deployment Instructions

## Step 1: Login to Vercel
```bash
vercel login
```

## Step 2: Deploy Backend
```bash
cd server
vercel --prod
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → henna-harmony-server
- **Directory?** → ./
- **Override settings?** → No

## Step 3: Add Environment Variables in Vercel Dashboard

Go to: https://vercel.com/[your-username]/henna-harmony-server/settings/environment-variables

Add these variables:

```
GEMINI_API_KEY=AIzaSyBmE26lEC7izfY_ERA1wBXpxBVKUFwF7pQ
JWT_SECRET=henna-jwt-secret-key-production-2024-secure-random-string-32chars
FRONTEND_URL=https://henna-harmony-him1.vercel.app
NODE_ENV=production
```

## Step 4: Get Backend URL

After deployment, copy the production URL (e.g., `https://henna-harmony-server.vercel.app`)

## Step 5: Update Frontend

Go to frontend Vercel project settings and add:
```
VITE_API_URL=https://henna-harmony-server.vercel.app/api
```

Then redeploy frontend.

## Alternative: Use Vercel CLI with Env Vars

```bash
cd server
vercel env add GEMINI_API_KEY production
# Paste: AIzaSyBmE26lEC7izfY_ERA1wBXpxBVKUFwF7pQ

vercel env add JWT_SECRET production
# Paste: henna-jwt-secret-key-production-2024-secure-random-string-32chars

vercel env add FRONTEND_URL production
# Paste: https://henna-harmony-him1.vercel.app

vercel env add NODE_ENV production
# Paste: production

vercel --prod
```

## ✅ Verify Deployment

Test the backend:
```bash
curl https://your-backend-url.vercel.app/api/health
```

Should return: `{"status":"ok"}`
