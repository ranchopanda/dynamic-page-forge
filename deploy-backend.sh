#!/bin/bash
set -e

echo "🚀 Deploying Backend to Vercel..."

cd server

# Add environment variables
echo "📝 Adding environment variables..."
echo "AIzaSyBmE26lEC7izfY_ERA1wBXpxBVKUFwF7pQ" | vercel env add GEMINI_API_KEY production
echo "henna-jwt-secret-key-production-2024-secure-random-string-32chars" | vercel env add JWT_SECRET production
echo "https://henna-harmony-him1.vercel.app" | vercel env add FRONTEND_URL production
echo "production" | vercel env add NODE_ENV production

# Deploy
echo "🚀 Deploying to production..."
vercel --prod --yes

echo "✅ Backend deployed successfully!"
echo "📋 Copy the deployment URL and update frontend VITE_API_URL"
