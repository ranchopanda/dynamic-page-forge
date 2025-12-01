# 🚀 Admin Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Seed the Database (30 seconds)

```bash
cd server
npm run seed
```

This creates:
- ✅ Admin account: `admin@hennaharmony.com` / `admin123`
- ✅ Artist account: `priya@hennaharmony.com` / `artist123`
- ✅ 4 henna styles

### Step 2: Start the Server (if not running)

```bash
# In server directory
npm run dev
```

### Step 3: Test Admin Access (2 minutes)

#### Option A: Using cURL

```bash
# 1. Login as admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hennaharmony.com","password":"admin123"}'

# Copy the token from response

# 2. Get dashboard stats
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Get users list
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Option B: Using Browser Console

1. Open your app in browser
2. Open DevTools Console (F12)
3. Run:

```javascript
// Login as admin
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@hennaharmony.com',
    password: 'admin123'
  })
});
const { token } = await response.json();
console.log('Token:', token);

// Get stats
const stats = await fetch('http://localhost:3001/api/admin/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
console.log('Stats:', stats);
```

---

## 🎯 Common Admin Tasks

### Task 1: Promote User to Artist

```bash
# Get user ID from users list first
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Then promote user
curl -X PATCH http://localhost:3001/api/admin/users/USER_ID_HERE/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ARTIST"}'
```

### Task 2: View Dashboard Statistics

```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Returns:
- Total users, designs, bookings
- Pending bookings count
- Recent bookings
- Popular design styles

### Task 3: Filter Users by Role

```bash
# Get only artists
curl "http://localhost:3001/api/admin/users?role=ARTIST" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only admins
curl "http://localhost:3001/api/admin/users?role=ADMIN" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Using the Admin UI (Optional)

### Add Admin Dashboard to Your App

1. **Add to App.tsx:**

```typescript
import AdminDashboard from './components/AdminDashboard';

// Add to AppView enum
enum AppView {
  // ... existing views
  ADMIN = 'admin',
}

// Add navigation function
const goToAdmin = () => {
  setView(AppView.ADMIN);
  scrollToTop();
};

// Add to render
{view === AppView.ADMIN && (
  <AdminDashboard 
    onBack={goHome}
    onStartDesign={startFlow}
    onGallery={goToGallery}
    onArtists={goToArtists}
    onSaved={goToSaved}
    onBooking={goToBooking}
    onAuth={() => openAuth('login')}
  />
)}
```

2. **Add Admin Link to Header:**

```typescript
// In Header.tsx, add for admin users
{user?.role === 'ADMIN' && (
  <button 
    onClick={onAdminClick}
    className="text-sm font-medium leading-normal hover:text-primary transition-colors"
  >
    Admin
  </button>
)}
```

3. **Access Admin Dashboard:**
- Login as admin
- Click "Admin" in header
- View stats and manage users

---

## 🔐 Security Checklist

### Before Production:

- [ ] Change default admin password
- [ ] Use strong passwords
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Enable CORS properly
- [ ] Add audit logging
- [ ] Consider 2FA for admins

### Change Admin Password:

```bash
# Via API (after login)
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "your_secure_password_here"
  }'
```

---

## 📊 Admin API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/:id/role` | Update user role |

### Authentication

All admin endpoints require:
1. Valid JWT token
2. User role = ADMIN

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🐛 Troubleshooting

### "Authentication required"
**Solution:** Make sure you're logged in and token is in Authorization header

```bash
# Check if token is valid
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### "Insufficient permissions"
**Solution:** User must have ADMIN role

```bash
# Check your role
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
# Look for "role": "ADMIN"
```

### "User not found"
**Solution:** Verify user ID is correct

```bash
# List all users to find correct ID
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Seed script fails
**Solution:** Reset database

```bash
cd server
npx prisma migrate reset
npm run seed
```

---

## 💡 Pro Tips

### 1. Save Token for Quick Testing

```bash
# Save token to variable
export ADMIN_TOKEN="your_token_here"

# Use in requests
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 2. Use jq for Pretty JSON

```bash
# Install jq (if not installed)
brew install jq  # macOS
apt-get install jq  # Linux

# Pretty print responses
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

### 3. Create Admin Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias admin-login='curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@hennaharmony.com\",\"password\":\"admin123\"}"'

alias admin-stats='curl http://localhost:3001/api/admin/stats -H "Authorization: Bearer $ADMIN_TOKEN"'

alias admin-users='curl http://localhost:3001/api/admin/users -H "Authorization: Bearer $ADMIN_TOKEN"'
```

---

## 📚 Next Steps

1. ✅ **Test Admin Access** - Verify you can login and access endpoints
2. ✅ **Change Password** - Update default admin password
3. ✅ **Explore API** - Try all admin endpoints
4. ⬜ **Build Admin UI** - Create dashboard interface (optional)
5. ⬜ **Add Features** - Extend admin functionality as needed

---

## 🎉 You're Ready!

Admin system is now set up and ready to use. You can:
- ✅ View dashboard statistics
- ✅ Manage users
- ✅ Update user roles
- ✅ Monitor platform activity

**Default Credentials:**
```
Email: admin@hennaharmony.com
Password: admin123
```

**Remember to change the password before deploying to production!**

---

For detailed documentation, see:
- **ADMIN_GUIDE.md** - Complete admin documentation
- **server/src/routes/admin.ts** - API implementation
- **src/components/AdminDashboard.tsx** - UI component
