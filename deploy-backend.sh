#!/bin/bash
set -e

echo "🚀 Deploying Backend to Vercel..."

cd server

# Add environment variables
echo "📝 Adding environment variables..."
echo "⚠️  Please add these manually in Vercel dashboard:"
echo "   GEMINI_API_KEY=your_actual_gemini_api_key"
echo "   JWT_SECRET=your_secure_jwt_secret"
echo "   FRONTEND_URL=https://henna-harmony-him1.vercel.app"
echo ""
echo "Or use: vercel env add GEMINI_API_KEY production"
echo "production" | vercel env add NODE_ENV production

# Deploy
echo "🚀 Deploying to production..."
vercel --prod --yes

echo "✅ Backend deployed successfully!"
echo "📋 Copy the deployment URL and update frontend VITE_API_URL"
