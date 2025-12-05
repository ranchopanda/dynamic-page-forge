#!/bin/bash

echo "🚀 Deploying Supabase Edge Function..."

# Check if GEMINI_API_KEY is provided
if [ -z "$1" ]; then
  echo "❌ Error: GEMINI_API_KEY is required"
  echo "Usage: ./deploy-edge-function.sh YOUR_GEMINI_API_KEY"
  echo ""
  echo "Get your API key from: https://makersuite.google.com/app/apikey"
  exit 1
fi

GEMINI_API_KEY=$1

echo "📝 Setting Edge Function secret..."
supabase secrets set GEMINI_API_KEY="$GEMINI_API_KEY" --project-ref kowuwhlwetplermbdvbh

echo "📦 Deploying generate-design function..."
supabase functions deploy generate-design --project-ref kowuwhlwetplermbdvbh

echo "✅ Deployment complete!"
echo ""
echo "Test your function at:"
echo "https://kowuwhlwetplermbdvbh.supabase.co/functions/v1/generate-design"
