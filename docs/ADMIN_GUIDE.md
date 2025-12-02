# 🔐 Admin Guide - Mehendi

## 📋 Table of Contents
1. [Admin Access](#admin-access)
2. [Admin Credentials](#admin-credentials)
3. [Admin API Endpoints](#admin-api-endpoints)
4. [Using Admin Features](#using-admin-features)
5. [Creating Admin UI](#creating-admin-ui)
6. [Security & Permissions](#security--permissions)

---

## 🔑 Admin Access

### Default Admin Account

After running the database seed, you'll have an admin account:

```
Email: admin@mehendi.com
Password: admin123
```

**⚠️ IMPORTANT**: Change this password in production!

### Creating Additional Admins

You can promote users to admin via:
1. Database directly
2. Admin API (if you're already an admin)
3. Seed script modification

---

## 🚀 Admin Credentials

### Seeded Accounts

The seed script creates these accounts:

```typescript
// Admin Account
Email: admin@mehendi.com
Password: admin123
Role: ADMIN

// Artist Account
Email: priya@mehendi.com
Password: artist123
Role: ARTIST
```

### Running the Seed

```bash
# Navigate to server directory
cd server

# Run the seed script
npm run seed

# Or with npx
npx prisma db seed
```

---

## 📡 Admin API Endpoints

### 1. **Dashboard Statistics**

Get overview statistics for the admin dashboard.

```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "totalUsers": 150,
  "totalDesigns": 450,
  "totalBookings": 89,
  "pendingBookings": 12,
  "totalArtists": 5,
  "recentBookings": [
    {
      "id": "...",
      "user": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "scheduledDate": "2024-12-15",
      "status": "PENDING"
    }
  ],
  "bookingsByStatus": {
    "PENDING": 12,
    "CONFIRMED": 45,
    "COMPLETED": 28,
    "CANCELLED": 4
  },
  "designsByStyle": [
    {
      "styleId": "...",
      "styleName": "Regal Bloom",
      "count": 120
    }
  ]
}
```

### 2. **Get All Users**

List all users with pagination and filtering.

```http
GET /api/admin/users?page=1&limit=20&role=USER
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (USER, ARTIST, ADMIN)

**Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00Z",
      "_count": {
        "designs": 5,
        "bookings": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### 3. **Update User Role**

Change a user's role (promote to ARTIST or ADMIN).

```http
PATCH /api/admin/users/:userId/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "ARTIST"
}
```

**Roles:**
- `USER` - Regular user
- `ARTIST` - Artist with profile
- `ADMIN` - Full admin access

**Response:**
```json
{
  "id": "...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ARTIST"
}
```

---

## 🛠️ Using Admin Features

### Method 1: Using cURL

#### Login as Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mehendi.com",
    "password": "admin123"
  }'
```

Save the token from the response.

#### Get Dashboard Stats
```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get All Users
```bash
curl "http://localhost:3001/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Promote User to Artist
```bash
curl -X PATCH http://localhost:3001/api/admin/users/USER_ID_HERE/role \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"role": "ARTIST"}'
```

### Method 2: Using Postman

1. **Import Collection**
   - Create new collection "Mehendi Admin"
   - Add base URL: `http://localhost:3001/api`

2. **Setup Authentication**
   - Create login request
   - Save token to environment variable
   - Use `{{token}}` in Authorization header

3. **Create Requests**
   - GET Dashboard Stats
   - GET Users List
   - PATCH Update User Role

### Method 3: Using JavaScript/TypeScript

Add admin methods to `src/lib/api.ts`:

```typescript
// Admin methods
async getAdminStats() {
  return this.request<any>('/admin/stats');
}

async getAdminUsers(params?: { page?: number; limit?: number; role?: string }) {
  const query = new URLSearchParams(params as any).toString();
  return this.request<{ users: any[]; pagination: any }>(`/admin/users?${query}`);
}

async updateUserRole(userId: string, role: 'USER' | 'ARTIST' | 'ADMIN') {
  return this.request<any>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}
```

Then use in your app:
```typescript
import api from './lib/api';

// Login as admin
await api.login({
  email: 'admin@mehendi.com',
  password: 'admin123'
});

// Get stats
const stats = await api.getAdminStats();
console.log(stats);

// Get users
const { users, pagination } = await api.getAdminUsers({ page: 1, limit: 20 });

// Promote user
await api.updateUserRole('user-id-here', 'ARTIST');
```

---

## 🎨 Creating Admin UI

### Option 1: Simple Admin Page

Create `src/components/AdminDashboard.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers({ page: 1, limit: 20 })
      ]);
      setStats(statsData);
      setUsers(usersData.users);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole as any);
      loadData(); // Reload data
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-3xl font-bold">{stats?.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Designs</h3>
          <p className="text-3xl font-bold">{stats?.totalDesigns}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Bookings</h3>
          <p className="text-3xl font-bold">{stats?.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Bookings</h3>
          <p className="text-3xl font-bold text-orange-500">{stats?.pendingBookings}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'ARTIST' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">{user._count.designs}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="USER">User</option>
                    <option value="ARTIST">Artist</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

### Option 2: Add to App.tsx

Add admin route to your app:

```typescript
// In App.tsx
import AdminDashboard from './components/AdminDashboard';

// Add to AppView enum
enum AppView {
  LANDING = 'landing',
  GENERATOR = 'generator',
  SAVED = 'saved',
  BOOKING = 'booking',
  PROFILE = 'profile',
  GALLERY = 'gallery',
  ARTISTS = 'artists',
  ADMIN = 'admin', // NEW
}

// Add navigation function
const goToAdmin = () => {
  setView(AppView.ADMIN);
  scrollToTop();
};

// Add to render logic
{view === AppView.ADMIN && (
  <AdminDashboard onBack={goHome} />
)}

// Add to header (only show for admins)
{user?.role === 'ADMIN' && (
  <button onClick={goToAdmin}>Admin</button>
)}
```

---

## 🔒 Security & Permissions

### Role Hierarchy

```
ADMIN > ARTIST > USER
```

### Middleware Protection

All admin routes are protected by:

1. **Authentication** - Must be logged in
2. **Role Check** - Must have ADMIN role

```typescript
router.get('/stats', 
  authenticate,           // Check if logged in
  requireRole('ADMIN'),   // Check if admin
  async (req, res) => {
    // Handler
  }
);
```

### Checking User Role in Frontend

```typescript
import { useAuth } from './context/AuthContext';

const { user } = useAuth();

// Check if admin
if (user?.role === 'ADMIN') {
  // Show admin features
}

// Check if artist
if (user?.role === 'ARTIST') {
  // Show artist features
}
```

### Protecting Admin Routes

```typescript
// In your component
const { user } = useAuth();

if (user?.role !== 'ADMIN') {
  return <div>Access Denied</div>;
}

// Or redirect
useEffect(() => {
  if (user && user.role !== 'ADMIN') {
    navigate('/');
  }
}, [user]);
```

---

## 📊 Admin Dashboard Features

### Current Features

✅ **Dashboard Statistics**
- Total users, designs, bookings
- Pending bookings count
- Recent bookings list
- Bookings by status
- Popular design styles

✅ **User Management**
- List all users with pagination
- Filter by role
- View user stats (designs, bookings)
- Update user roles

### Potential Enhancements

You could add:

1. **Booking Management**
   - Approve/reject bookings
   - Assign artists to bookings
   - Update booking status

2. **Design Moderation**
   - Review public designs
   - Remove inappropriate content
   - Feature designs

3. **Artist Management**
   - Approve artist applications
   - Manage artist profiles
   - View artist performance

4. **Analytics**
   - Revenue tracking
   - Popular styles over time
   - User growth charts
   - Booking trends

5. **Content Management**
   - Manage henna styles
   - Update style images
   - Add new styles

---

## 🚀 Quick Start Guide

### 1. Setup Database
```bash
cd server
npm run seed
```

### 2. Login as Admin
```bash
# Via API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mehendi.com","password":"admin123"}'
```

### 3. Get Dashboard Stats
```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Manage Users
```bash
# List users
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Promote user to artist
curl -X PATCH http://localhost:3001/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ARTIST"}'
```

---

## 🔧 Troubleshooting

### "Authentication required"
- Make sure you're logged in
- Check token is valid
- Token should be in Authorization header

### "Insufficient permissions"
- User must have ADMIN role
- Check user role in database
- Re-login after role change

### "User not found"
- Verify user ID is correct
- Check user exists in database

---

## 📝 Best Practices

1. **Change Default Password**
   ```sql
   -- In production, update admin password
   UPDATE "User" 
   SET password = 'new_hashed_password' 
   WHERE email = 'admin@mehendi.com';
   ```

2. **Use Environment Variables**
   ```env
   ADMIN_EMAIL=admin@yourcompany.com
   ADMIN_PASSWORD=secure_password_here
   ```

3. **Audit Logging**
   - Log admin actions
   - Track role changes
   - Monitor sensitive operations

4. **Rate Limiting**
   - Limit admin API calls
   - Prevent brute force
   - Add CAPTCHA for login

5. **Two-Factor Authentication**
   - Add 2FA for admin accounts
   - Use authenticator apps
   - Backup codes

---

## 🎯 Summary

**Admin Access:**
- Email: `admin@mehendi.com`
- Password: `admin123`

**Admin Endpoints:**
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id/role` - Update user role

**Quick Test:**
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mehendi.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Get stats
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Next Steps:**
1. Run seed script
2. Login as admin
3. Test API endpoints
4. Build admin UI (optional)
5. Change default password

---

**Need help?** Check the API routes in `server/src/routes/admin.ts` for implementation details.
