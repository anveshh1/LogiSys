-- ============================================================
-- Fix: Ensure products table supports business features
-- Run in Supabase SQL Editor
-- ============================================================

-- Add missing columns (safe — skips if they exist)
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add check constraint for valid statuses
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('active', 'inactive'));

-- Backfill: set existing products with no created_by to the admin user
UPDATE products
SET created_by = (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com' LIMIT 1)
WHERE created_by IS NULL;

-- Verify
SELECT id, name, category, available_quantity, status, created_by FROM products;
