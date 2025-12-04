# 🔐 Admin User Setup Guide

## Your Credentials
- **Email**: justfun2842@gmail.com
- **Password**: 123456789

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Create Auth User in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **kowuwhlwetplermbdvbh**
3. Click **Authentication** (left sidebar)
4. Click **Users** tab
5. Click **"Add user"** button (top right)
6. Select **"Create new user"**
7. Fill in:
   ```
   Email: justfun2842@gmail.com
   Password: 123456789
   ```
8. ✅ **Check "Auto Confirm User"** (important!)
9. Click **"Create user"**

### Step 2: Make User Admin

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Get user ID and update profile to ADMIN (MUST BE UPPERCASE!)
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'justfun2842@gmail.com';
  
  -- Create or update profile with ADMIN role
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    user_id,
    'justfun2842@gmail.com',
    'Admin User',
    'ADMIN',  -- MUST BE UPPERCASE!
    NOW(),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'ADMIN',
    updated_at = NOW();
END $$;
```

4. Click **"Run"** (or press Cmd+Enter)
5. Should see: "Success. No rows returned"

### Step 3: Verify Setup

Run this query to verify:

```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'justfun2842@gmail.com';
```

**Expected result:**
```
id: (some UUID)
email: justfun2842@gmail.com
email_confirmed_at: (timestamp - not null)
role: ADMIN  (UPPERCASE!)
name: Admin User
```

---

## ✅ Test Login

1. Go to your app: http://localhost:3000
2. Click **"Sign In"**
3. Enter:
   - Email: `justfun2842@gmail.com`
   - Password: `123456789`
4. Click **"Sign In"**
5. ✅ Should log in successfully!
6. ✅ Should see admin features (if implemented)

---

## 🐛 Troubleshooting

### Error: "Invalid login credentials"

**Cause**: User doesn't exist in `auth.users` table

**Fix**: 
1. Go to Supabase Dashboard → Authentication → Users
2. Check if `justfun2842@gmail.com` is listed
3. If not, create it using Step 1 above

### Error: "Email not confirmed"

**Cause**: User exists but email not confirmed

**Fix**:
```sql
-- Confirm email manually
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'justfun2842@gmail.com';
```

### User exists but not admin

**Fix**:
```sql
-- Update role to ADMIN (MUST BE UPPERCASE!)
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'justfun2842@gmail.com';
```

### Check current state

```sql
-- See all users
SELECT id, email, email_confirmed_at FROM auth.users;

-- See all profiles
SELECT id, email, role FROM public.profiles;
```

---

## 🔒 Security Note

**⚠️ Important**: The password `123456789` is weak and should only be used for development/testing.

**For production:**
1. Use a strong password (16+ characters, mixed case, numbers, symbols)
2. Enable 2FA if available
3. Never commit passwords to Git
4. Use environment variables for sensitive data

---

## 📝 Alternative: Sign Up Through App

If you prefer, you can also:

1. Go to http://localhost:3000
2. Click **"Sign Up"** (not "Sign In")
3. Enter:
   - Email: `justfun2842@gmail.com`
   - Password: `123456789`
4. If email confirmation is required, check your email
5. After signing up, run this SQL to make yourself admin:

```sql
-- IMPORTANT: Role must be UPPERCASE!
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'justfun2842@gmail.com';
```

---

## ✅ Summary

**To fix your login issue:**

1. Create user in Supabase Dashboard (Authentication → Users → Add user)
2. Use email: `justfun2842@gmail.com`, password: `123456789`
3. Check "Auto Confirm User"
4. Run SQL to set role to 'admin'
5. Try logging in again

**That's it!** Your admin account will be ready to use.
