#!/bin/bash

echo "🧪 Testing Local Development Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo "1️⃣  Testing Backend Health..."
HEALTH=$(curl -s http://localhost:3001/health)
if [[ $HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    echo "   Response: $HEALTH"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: Frontend
echo "2️⃣  Testing Frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [[ $FRONTEND == "200" ]]; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    echo "   Status: $FRONTEND"
else
    echo -e "${YELLOW}⚠️  Frontend returned: $FRONTEND${NC}"
    echo "   (This is OK if Vite is still starting)"
fi
echo ""

# Test 3: Check Environment Variables
echo "3️⃣  Checking Environment Variables..."
if [ -f "server/.env" ]; then
    if grep -q "GEMINI_API_KEY" server/.env; then
        echo -e "${GREEN}✅ GEMINI_API_KEY is set in server/.env${NC}"
    else
        echo -e "${RED}❌ GEMINI_API_KEY not found in server/.env${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ server/.env file not found${NC}"
    exit 1
fi

if [ -f ".env.local" ]; then
    if grep -q "VITE_GEMINI_API_KEY" .env.local; then
        echo -e "${RED}❌ SECURITY ISSUE: VITE_GEMINI_API_KEY found in .env.local${NC}"
        echo "   Remove it immediately!"
        exit 1
    else
        echo -e "${GREEN}✅ No VITE_GEMINI_API_KEY in .env.local (secure)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
fi
echo ""

# Test 4: API Endpoints
echo "4️⃣  Testing API Endpoints..."

# Test styles endpoint (should work without auth)
STYLES=$(curl -s http://localhost:3001/api/styles)
if [[ $STYLES == *"id"* ]] || [[ $STYLES == "[]" ]]; then
    echo -e "${GREEN}✅ Styles endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  Styles endpoint: $STYLES${NC}"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}🎉 Local setup is ready!${NC}"
echo ""
echo "📱 Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🧪 Test the Pro Feature:"
echo "   1. Go to http://localhost:3000"
echo "   2. Click 'Create Design'"
echo "   3. Upload a hand image"
echo "   4. Try all three modes:"
echo "      - Overlay (instant)"
echo "      - AI Standard (free)"
echo "      - AI Pro ⭐ (requires login)"
echo ""
echo "📊 Monitor logs:"
echo "   Backend:  Check terminal running 'npm run dev' in server/"
echo "   Frontend: Check terminal running 'npm run dev' in root"
echo ""
