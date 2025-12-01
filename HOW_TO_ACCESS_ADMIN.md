# 🔐 How to Access Admin Dashboard

## ✅ Admin Page is Now Integrated!

The admin dashboard is now fully integrated into your app.

---

## 🚀 Quick Access Steps

### 1. Login as Admin

First, you need to login with an admin account:

**Default Admin Credentials:**
```
Email: admin@hennaharmony.com
Password: admin123
```

### 2. Find the Admin Link

Once logged in as an admin, you'll see an **"Admin"** link in the header navigation:

```
Gallery | Artists | My Designs | 🛡️ Admin | How It Works
```

The Admin link will **only appear** if:
- ✅ You are logged in
- ✅ Your role is ADMIN

### 3. Click Admin

Click the "Admin" link in the header to access the admin dashboard.

---

## 📊 What You'll See

The Admin Dashboard shows:

### Statistics Cards
- **Total Users** - Number of registered users
- **Total Designs** - All designs created
- **Total Bookings** - All bookings made
- **Pending Bookings** - Bookings awaiting confirmation

### Recent Bookings
- Last 5 bookings
- User details
- Status badges
- Scheduled dates

### User Management Table
- All users with pagination
- User details (name, email, role)
- Activity stats (designs, bookings)
- **Role dropdown** - Change user roles instantly
- Filter by role
- Pagination controls

---

## 🎯 Admin Features

### Change User Roles

1. Find the user in the table
2. Click the role dropdown
3. Select new role:
   - **USER** - Regular user
   - **ARTIST** - Artist with profile
   - **ADMIN** - Full admin access
4. Confirm the change

### View Statistics

- See platform overview at a glance
- Monitor pending bookings
- Track popular design styles
- View recent activity

### Filter Users

Use the pagination and filters to:
- View users by role
- Navigate through pages
- See user activity stats

---

## 🔍 Can't Find the Admin Link?

### Checklist:

1. **Are you logged in?**
   - Check if you see your profile in the header
   - If not, click "Login" and use admin credentials

2. **Is your role ADMIN?**
   - Only admin users see the Admin link
   - Default admin: admin@hennaharmony.com

3. **Did you refresh after login?**
   - Sometimes you need to refresh the page
   - Press F5 or Cmd+R

4. **Check the header navigation**
   - Look between "My Designs" and "How It Works"
   - Should have a shield icon 🛡️

---

## 🛠️ Testing Admin Access

### Via Browser Console

Open DevTools (F12) and run:

```javascript
// Check if you're logged in as admin
const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
console.log('User:', user);
console.log('Role:', user.role);

// Should show: Role: "ADMIN"
```

### Via API

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hennaharmony.com","password":"admin123"}'

# Copy the token, then check your role
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Mobile Access

On mobile devices:
1. Login as admin
2. Open the hamburger menu (☰)
3. Look for "Admin" in the menu
4. Tap to access dashboard

---

## 🎨 Admin Dashboard Features

### Desktop View
- Full statistics dashboard
- User management table
- Pagination controls
- Role dropdowns

### Mobile View
- Responsive design
- Touch-friendly controls
- Stacked layout
- Easy navigation

---

## 🔐 Security

### Who Can Access?

- ✅ Users with role = ADMIN
- ❌ Regular users (role = USER)
- ❌ Artists (role = ARTIST)
- ❌ Not logged in users

### What Happens if Non-Admin Tries?

If someone tries to access the admin page without admin role:
- Shows "Access Denied" message
- Displays red block icon
- Provides "Go Back" button
- No sensitive data exposed

---

## 💡 Pro Tips

### 1. Bookmark the Admin Page
Once you're on the admin page, bookmark it for quick access.

### 2. Use Keyboard Shortcuts
- `Cmd/Ctrl + K` - Quick search (if implemented)
- `Tab` - Navigate through controls
- `Enter` - Confirm actions

### 3. Monitor Pending Bookings
Check the orange "Pending Bookings" card regularly to stay on top of new requests.

### 4. Promote Users to Artists
When someone applies to be an artist:
1. Find them in the user table
2. Change role to "ARTIST"
3. They can now create artist profile

---

## 🆘 Troubleshooting

### "I don't see the Admin link"

**Solution:**
1. Make sure you're logged in
2. Verify you're using admin@hennaharmony.com
3. Check password is admin123
4. Refresh the page after login

### "Access Denied" message

**Solution:**
- Your account doesn't have admin role
- Login with admin@hennaharmony.com
- Or promote your account to admin via database

### "Admin page is blank"

**Solution:**
1. Check backend server is running
2. Open browser console (F12)
3. Look for errors
4. Verify API is accessible

---

## 🎉 You're Ready!

The admin dashboard is fully functional and ready to use. Just:

1. ✅ Login as admin
2. ✅ Click "Admin" in header
3. ✅ Manage your platform!

**Default Admin:**
```
Email: admin@hennaharmony.com
Password: admin123
```

---

## 📚 Related Documentation

- **ADMIN_GUIDE.md** - Complete admin API documentation
- **ADMIN_QUICK_START.md** - Quick setup guide
- **ADMIN_SUMMARY.md** - Admin system overview
- **TROUBLESHOOTING.md** - Common issues and fixes

---

**Happy administrating! 🛡️✨**
