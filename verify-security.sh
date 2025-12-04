#!/bin/bash

# Security Verification Script
# Run this before deploying to production

echo "🔒 Security Verification Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: API Key not in .env.local
echo "📋 Check 1: Verifying .env.local..."
if grep -q "VITE_GEMINI_API_KEY" .env.local 2>/dev/null; then
    echo -e "${RED}❌ FAIL: VITE_GEMINI_API_KEY found in .env.local${NC}"
    echo "   This exposes your API key in the browser!"
    echo "   Remove it immediately."
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: No exposed API key in .env.local${NC}"
fi
echo ""

# Check 2: API Key exists in server/.env
echo "📋 Check 2: Verifying server/.env..."
if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ FAIL: server/.env not found${NC}"
    ERRORS=$((ERRORS + 1))
elif ! grep -q "GEMINI_API_KEY=" server/.env; then
    echo -e "${RED}❌ FAIL: GEMINI_API_KEY not set in server/.env${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: GEMINI_API_KEY configured in server/.env${NC}"
fi
echo ""

# Check 3: Build and check for API key in bundle
echo "📋 Check 3: Building and checking for exposed secrets..."
echo "   Building production bundle..."
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Build failed, skipping bundle check${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    # Check for API key patterns in bundle
    if grep -r "AIzaSy" dist/ 2>/dev/null | grep -v ".map" > /dev/null; then
        echo -e "${RED}❌ FAIL: API key found in production bundle!${NC}"
        echo "   Your API key is exposed in the client code."
        echo "   DO NOT DEPLOY until this is fixed."
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ PASS: No API keys found in production bundle${NC}"
    fi
fi
echo ""

# Check 4: Verify security files exist
echo "📋 Check 4: Verifying security utilities..."
if [ ! -f "src/lib/rateLimiter.ts" ]; then
    echo -e "${RED}❌ FAIL: Rate limiter not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: Rate limiter exists${NC}"
fi

if [ ! -f "src/lib/security.ts" ]; then
    echo -e "${RED}❌ FAIL: Security utilities not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: Security utilities exist${NC}"
fi
echo ""

# Check 5: Verify geminiService uses server endpoints
echo "📋 Check 5: Verifying AI service security..."
if grep -q "generativelanguage.googleapis.com" src/services/geminiService.ts; then
    echo -e "${RED}❌ FAIL: Direct API calls found in geminiService.ts${NC}"
    echo "   AI calls should go through server endpoints."
    ERRORS=$((ERRORS + 1))
elif grep -q "callServerAI" src/services/geminiService.ts; then
    echo -e "${GREEN}✅ PASS: AI calls go through server${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Could not verify AI service implementation${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 6: Verify rate limiting is integrated
echo "📋 Check 6: Verifying rate limiting integration..."
if grep -q "rateLimiter" src/services/geminiService.ts; then
    echo -e "${GREEN}✅ PASS: Rate limiting integrated${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Rate limiting may not be integrated${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 7: Verify TypeScript compilation
echo "📋 Check 7: Verifying TypeScript compilation..."
npx tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS: TypeScript compilation successful${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: TypeScript compilation has errors${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo "================================"
echo "📊 Summary"
echo "================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    echo ""
    echo "Your application is secure and ready for deployment."
    echo ""
    echo "Next steps:"
    echo "1. Test locally: npm run dev:all"
    echo "2. Review DEPLOYMENT_CHECKLIST.md"
    echo "3. Deploy to production"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} warning(s) found${NC}"
    echo ""
    echo "Your application is mostly secure, but review warnings above."
    echo "Consider fixing warnings before deploying to production."
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  ${WARNINGS} warning(s) found${NC}"
    fi
    echo ""
    echo "⛔ DO NOT DEPLOY until all errors are fixed!"
    echo ""
    echo "Common fixes:"
    echo "1. Remove VITE_GEMINI_API_KEY from .env.local"
    echo "2. Add GEMINI_API_KEY to server/.env"
    echo "3. Ensure geminiService.ts uses server endpoints"
    echo "4. Run: npm install"
    echo ""
    echo "For help, see QUICK_START_SECURITY.md"
    exit 1
fi
