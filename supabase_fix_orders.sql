-- ============================================================
-- PART 1: Recreate time_slots table (was dropped in earlier rebuild)
-- ============================================================

CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  max_capacity INT NOT NULL DEFAULT 10,
  current_capacity INT NOT NULL DEFAULT 0
);

-- Insert default slots (only if table is empty)
INSERT INTO time_slots (slot_start, slot_end, max_capacity)
SELECT s.slot_start, s.slot_end, 10
FROM (VALUES
  ('09:00'::time, '10:00'::time),
  ('10:00'::time, '11:00'::time),
  ('11:00'::time, '12:00'::time),
  ('13:00'::time, '14:00'::time),
  ('14:00'::time, '15:00'::time)
) AS s(slot_start, slot_end)
WHERE NOT EXISTS (SELECT 1 FROM time_slots);

ALTER TABLE time_slots DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- PART 2: Remove duplicate foreign keys (fixes PGRST201 errors)
-- ============================================================

ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_product;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_user;
ALTER TABLE allocations DROP CONSTRAINT IF EXISTS fk_allocations_order;


-- ============================================================
-- PART 2: Add slot_id column to orders (links orders to time slots)
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES time_slots(id);


-- ============================================================
-- PART 3: Create the atomic order processing function
-- This runs INSIDE the database, so it's a real transaction:
-- if any step fails, everything rolls back automatically.
-- ============================================================

CREATE OR REPLACE FUNCTION public.process_new_order()
RETURNS TRIGGER AS $$
DECLARE
  v_available INT;
  v_slot_id UUID;
  v_slot_capacity INT;
  v_slot_current INT;
BEGIN

  -- STEP 1: Check product stock (lock the row to prevent race conditions)
  SELECT available_quantity INTO v_available
  FROM products
  WHERE id = NEW.product_id
  FOR UPDATE;

  IF v_available IS NULL THEN
    RAISE EXCEPTION 'Product not found: %', NEW.product_id;
  END IF;

  IF v_available < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_available, NEW.quantity;
  END IF;

  -- STEP 2: Deduct stock immediately
  UPDATE products
  SET available_quantity = available_quantity - NEW.quantity
  WHERE id = NEW.product_id;

  -- STEP 3: Find the first available time slot with enough capacity
  SELECT id, max_capacity, current_capacity
  INTO v_slot_id, v_slot_capacity, v_slot_current
  FROM time_slots
  WHERE current_capacity + NEW.quantity <= max_capacity
  ORDER BY slot_start ASC
  LIMIT 1
  FOR UPDATE;

  -- STEP 4: If a slot is available, assign it and update capacity
  IF v_slot_id IS NOT NULL THEN
    UPDATE time_slots
    SET current_capacity = current_capacity + NEW.quantity
    WHERE id = v_slot_id;

    -- Link the order to this slot
    NEW.slot_id := v_slot_id;
  END IF;
  -- If no slot available, order still goes through (slot_id stays NULL = unassigned)

  -- STEP 5: Create allocation record
  -- (done via a separate AFTER trigger to avoid issues with NEW.id not yet committed)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- PART 4: Create the allocation record trigger (AFTER INSERT)
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_allocation_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO allocations (order_id, allocated_quantity)
  VALUES (NEW.id, NEW.quantity);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- PART 5: Attach triggers to orders table
-- ============================================================

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS trg_process_order ON orders;
DROP TRIGGER IF EXISTS trg_create_allocation ON orders;

-- BEFORE INSERT: validate stock, deduct stock, assign slot
CREATE TRIGGER trg_process_order
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.process_new_order();

-- AFTER INSERT: create the allocation record
CREATE TRIGGER trg_create_allocation
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_allocation_record();


-- ============================================================
-- PART 6: Restore stock when an order is cancelled
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_order_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fires when status changes TO 'cancelled'
  IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    -- Restore product stock
    UPDATE products
    SET available_quantity = available_quantity + OLD.quantity
    WHERE id = OLD.product_id;

    -- Free up slot capacity
    IF OLD.slot_id IS NOT NULL THEN
      UPDATE time_slots
      SET current_capacity = GREATEST(current_capacity - OLD.quantity, 0)
      WHERE id = OLD.slot_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_cancelled ON orders;

CREATE TRIGGER trg_order_cancelled
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_cancellation();


-- ============================================================
-- PART 7: Update the status CHECK to include 'cancelled'
-- ============================================================

ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE orders ADD CONSTRAINT check_status
  CHECK (status IN ('pending', 'allocated', 'fulfilled', 'cancelled'));


-- ============================================================
-- PART 8: Verify everything
-- ============================================================

-- Check triggers are attached
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'orders';

-- Check current product stock
SELECT id, name, available_quantity, total_quantity FROM products;

-- Check time slot capacity
SELECT id, slot_start, slot_end, max_capacity, current_capacity FROM time_slots ORDER BY slot_start;
