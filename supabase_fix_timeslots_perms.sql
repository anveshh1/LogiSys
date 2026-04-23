-- ============================================================
-- Fix: Grant permissions on time_slots table
-- The table was created fresh, so it doesn't have the grants
-- that were applied to the original tables.
-- Run this in Supabase SQL Editor.
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON time_slots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON time_slots TO authenticated;

-- Also ensure RLS is disabled (belt and suspenders)
ALTER TABLE time_slots DISABLE ROW LEVEL SECURITY;

-- Verify it works
SELECT id, slot_start, slot_end, max_capacity, current_capacity FROM time_slots ORDER BY slot_start;
