# Deploy Backend to Railway

Vercel has CORS issues with Express apps. Railway is better suited for this backend.

## Steps to Deploy to Railway

### 1. Sign up for Railway
- Go to https://railway.app
- Sign up with GitHub

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository: `ranchopanda/dynamic-page-forge`
- Select the `server` directory as the root

### 3. Configure Environment Variables
Add these in Railway dashboard:

```
GEMINI_API_KEY=AIzaSyB5MOEMkgmJatNs8voMxzDm0blv3pBCMsw
JWT_SECRET=henna-jwt-secret-key-production-2024-secure-random-string-32chars
FRONTEND_URL=https://henna-harmony-him1.vercel.app
NODE_ENV=production
PORT=3001
```

### 4. Configure Build Settings
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### 5. Get Your Railway URL
After deployment, Railway will give you a URL like:
`https://your-app.railway.app`

### 6. Update Frontend Environment Variable
Update the frontend's `VITE_API_URL` in Vercel:

```bash
vercel env rm VITE_API_URL production --yes
vercel env add VITE_API_URL production
# Enter: https://your-app.railway.app/api
```

### 7. Redeploy Frontend
```bash
vercel --prod --yes
```

## Alternative: Use Render.com

If Railway doesn't work, try Render.com:

1. Go to https://render.com
2. Create a new Web Service
3. Connect your GitHub repo
4. Root Directory: `server`
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Add the same environment variables
8. Update frontend VITE_API_URL with your Render URL

## Why Not Vercel?

Vercel is optimized for serverless functions and static sites. Express apps with complex middleware (CORS, rate limiting, etc.) work better on traditional hosting platforms like Railway or Render that support long-running Node.js processes.

## Current Status

- ✅ Frontend deployed to Vercel: https://henna-harmony-him1.vercel.app
- ⏳ Backend needs Railway/Render deployment
- ✅ Code pushed to GitHub
- ✅ All environment variables documented

Once you deploy to Railway/Render, update the frontend's API URL and everything will work!
