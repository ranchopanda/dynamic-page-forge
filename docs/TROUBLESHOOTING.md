# 🔧 Troubleshooting Guide

## Common Errors & Solutions

### ❌ Error: "ERR_CONNECTION_REFUSED"

**Problem:** Backend server is not running

**Solution:**
```bash
# Start the backend server
cd server
npm run dev
```

The server should start on `http://localhost:3001`

---

### ❌ Error: "Access to storage is not allowed from this context"

**Problem:** localStorage access issue (usually happens when server is down)

**Solution:**
1. Make sure backend server is running
2. Refresh the page
3. If persists, clear browser cache and cookies

---

### ❌ Error: "Failed to load resource: 404" for favicon.ico

**Problem:** Missing favicon file (cosmetic issue)

**Solution:** This is harmless and can be ignored. To fix:
```bash
# Add a favicon to public folder
# Or add to index.html:
<link rel="icon" href="data:," />
```

---

### ❌ Error: "Authentication required"

**Problem:** Not logged in or token expired

**Solution:**
```bash
# Login again
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mehendi.com","password":"admin123"}'
```

---

### ❌ Error: "Insufficient permissions"

**Problem:** User doesn't have required role

**Solution:**
1. Check your role: `GET /api/auth/me`
2. For admin access, role must be "ADMIN"
3. Run seed script to create admin user:
```bash
cd server
npm run db:seed
```

---

### ❌ Database Errors

**Problem:** Database not initialized or out of sync

**Solution:**
```bash
cd server

# Push schema to database
npm run db:push

# Seed with initial data
npm run db:seed

# If issues persist, reset database
npx prisma migrate reset
npm run db:seed
```

---

## 🚀 Complete Setup Checklist

### 1. Backend Setup
```bash
cd server

# Install dependencies (if not done)
npm install

# Setup database
npm run db:push

# Seed database
npm run db:seed

# Start server
npm run dev
```

Server should be running on `http://localhost:3001`

### 2. Frontend Setup
```bash
# In root directory

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

Frontend should be running on `http://localhost:5173`

### 3. Verify Setup
```bash
# Test backend
curl http://localhost:3001/api/styles

# Test admin login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mehendi.com","password":"admin123"}'
```

---

## 🔍 Debugging Tips

### Check Server Status
```bash
# See if server is running
lsof -i :3001

# Or check process
ps aux | grep "npm run dev"
```

### Check Database
```bash
cd server

# Open Prisma Studio
npm run db:studio

# View database in browser at http://localhost:5555
```

### Check Logs
```bash
# Backend logs
cd server
npm run dev
# Watch console output

# Frontend logs
# Open browser DevTools (F12)
# Check Console tab
```

### Test API Endpoints
```bash
# Save token
TOKEN="your_token_here"

# Test endpoints
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Known Issues

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use different port in server/.env
PORT=3002
```

### Issue: CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solution:** Backend already has CORS enabled. If issues persist:
```typescript
// In server/src/index.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue: JWT Token Errors

**Error:** `Invalid or expired token`

**Solution:**
1. Token might be expired (24h default)
2. Login again to get new token
3. Check JWT_SECRET in server/.env

---

## 📊 Health Check

Run this to verify everything is working:

```bash
#!/bin/bash

echo "🔍 Checking Mehendi Setup..."

# Check backend
if curl -s http://localhost:3001/api/styles > /dev/null; then
  echo "✅ Backend is running"
else
  echo "❌ Backend is NOT running"
  echo "   Run: cd server && npm run dev"
fi

# Check frontend
if curl -s http://localhost:5173 > /dev/null; then
  echo "✅ Frontend is running"
else
  echo "❌ Frontend is NOT running"
  echo "   Run: npm run dev"
fi

# Check database
if [ -f "server/prisma/dev.db" ]; then
  echo "✅ Database exists"
else
  echo "❌ Database not found"
  echo "   Run: cd server && npm run db:push"
fi

echo ""
echo "🎉 Setup check complete!"
```

---

## 🆘 Still Having Issues?

### Quick Reset (Nuclear Option)

```bash
# Stop all processes
# Kill backend: Ctrl+C
# Kill frontend: Ctrl+C

# Reset database
cd server
npx prisma migrate reset
npm run db:seed

# Restart everything
npm run dev &
cd ..
npm run dev
```

### Check Environment Variables

```bash
# Backend (.env in server/)
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3001

# Frontend (.env.local in root)
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your-key-here
```

---

## 📞 Getting Help

If you're still stuck:

1. **Check the logs** - Look for error messages
2. **Read the error** - Error messages usually tell you what's wrong
3. **Check documentation** - See ADMIN_GUIDE.md, DEPLOYMENT.md
4. **Verify setup** - Follow ADMIN_QUICK_START.md step by step

---

## ✅ Success Indicators

You know everything is working when:

- ✅ Backend server shows: `🚀 Server running on http://localhost:3001`
- ✅ Frontend loads without errors
- ✅ Can login as admin
- ✅ Can access admin dashboard
- ✅ No console errors in browser
- ✅ API calls succeed

---

**Most Common Fix:** Just start the backend server! 🚀

```bash
cd server
npm run dev
```
