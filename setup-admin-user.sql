-- Setup Admin User for Henna Harmony
-- Email: justfun2842@gmail.com
-- Password: 123456789

-- Step 1: Check if user already exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'justfun2842@gmail.com';

-- Step 2: If user doesn't exist, create it
-- Note: Run this in Supabase SQL Editor
-- The password will be hashed automatically

-- If you need to create the user (only if step 1 returns no results):
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Email: justfun2842@gmail.com
-- Password: 123456789
-- Check "Auto Confirm User"

-- Step 3: After user is created, get the user ID
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'justfun2842@gmail.com';
  
  IF user_id IS NOT NULL THEN
    -- Create or update profile with ADMIN role (must be UPPERCASE)
    INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
    VALUES (
      user_id,
      'justfun2842@gmail.com',
      'Admin User',
      'ADMIN',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
      role = 'ADMIN',
      email = 'justfun2842@gmail.com',
      updated_at = NOW();
    
    RAISE NOTICE 'Profile updated for user: %', user_id;
  ELSE
    RAISE NOTICE 'User not found. Please create user first in Authentication → Users';
  END IF;
END $$;

-- Step 4: Verify the setup
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'justfun2842@gmail.com';

-- Expected result:
-- id: (some UUID)
-- email: justfun2842@gmail.com
-- email_confirmed_at: (timestamp)
-- role: ADMIN (must be UPPERCASE)
-- name: Admin User
