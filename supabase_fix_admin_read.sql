-- ============================================================
-- Fix: Replace recursive RLS policy with a safe one
-- The previous policy caused infinite recursion because it 
-- queried profiles inside a profiles policy.
-- This version uses auth.jwt() metadata instead — no recursion.
-- Run this in Supabase SQL Editor IMMEDIATELY.
-- ============================================================

-- Drop the broken policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Recreate using auth.jwt() which reads from the token, NOT the profiles table
-- This avoids the infinite recursion entirely.
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Verify it works
SELECT id, name, email, role FROM profiles LIMIT 5;
