-- Quick Fix: Set Admin Role (UPPERCASE)
-- Run this in Supabase SQL Editor

-- Option 1: If profile already exists, just update the role
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'justfun2842@gmail.com';

-- Option 2: If profile doesn't exist, create it
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'justfun2842@gmail.com';
  
  IF user_id IS NOT NULL THEN
    -- Insert or update profile with ADMIN role
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
    
    RAISE NOTICE 'Success! User is now ADMIN';
  ELSE
    RAISE EXCEPTION 'User not found in auth.users. Please create user first.';
  END IF;
END $$;

-- Verify it worked
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'justfun2842@gmail.com';

-- Should show:
-- role: ADMIN (in UPPERCASE)
