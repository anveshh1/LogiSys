-- ============================================================
-- LogiSys: FINAL Role Fix (run this ONCE in Supabase SQL Editor)
-- This builds ON TOP of your existing tables. Nothing is dropped.
-- ============================================================


-- ============================================================
-- STEP 1: Add missing columns (safe — skips if they exist)
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_id TEXT;


-- ============================================================
-- STEP 2: Fix old 'user' roles → 'customer'
-- Your old trigger was inserting role='user', but the correct
-- values are: customer, business, admin
-- ============================================================
UPDATE profiles SET role = 'customer' WHERE role = 'user';
UPDATE profiles SET role = 'customer' WHERE role IS NULL;


-- ============================================================
-- STEP 3: Protect admin accounts
-- ============================================================
UPDATE profiles SET role = 'admin' WHERE email = 'adithyask45@gmail.com';
UPDATE profiles SET role = 'admin' WHERE email = 'ankitha@gmail.com';


-- ============================================================
-- STEP 4: Add CHECK constraint (only valid roles allowed)
-- ============================================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'business', 'admin'));


-- ============================================================
-- STEP 5: Replace the old trigger with the correct one
-- Old trigger: always set role='user' (WRONG)
-- New trigger: reads role from signup metadata (CORRECT)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, business_name, business_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'business'
      THEN SUBSTRING(NEW.id::text, 1, 8)
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- STEP 6: Backfill any users who have no profiles row yet
-- ============================================================
INSERT INTO profiles (id, name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', ''),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'customer')
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = au.id);


-- ============================================================
-- STEP 7: Enable RLS on profiles (keeps other tables as-is)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own name" ON profiles;
DROP POLICY IF EXISTS "Service can insert profiles" ON profiles;

-- Read own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Update own name (role cannot change)
CREATE POLICY "Users can update own name"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
  );

-- Trigger can insert new profiles
CREATE POLICY "Service can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- STEP 8: Verify — check the output of this query
-- ============================================================
SELECT id, name, email, role, business_name FROM profiles ORDER BY role, name;
