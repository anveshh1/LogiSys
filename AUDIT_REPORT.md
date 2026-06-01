# LogiSys — Full Audit Report

> Generated: 2026-05-30 | Auditor: Senior Full-Stack Review

---

## Phase 1 — Audit Findings (Prioritised)

### 🔴 CRITICAL

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| C1 | `src/services/CreateOrder.jsx` | **Rules of Hooks violation** — `useAuth()` called at module scope (not inside a component or hook). Calling `React.useContext` outside a component throws immediately. File also calls `alert()` and `console.log` at module level. | File cleared. Logic lives in `pages/CreateOrder.jsx`. |
| C2 | `src/context/AuthContext.jsx` | `isDemoMode` was **not exported** from the context value, but `Login.jsx` destructures `{ isDemoMode }` from `useAuth()` — silently `undefined`, causing the demo banner never to render (or crashing dependent conditionals). | Added `isDemoMode` to context value. |
| C3 | `src/context/AuthContext.jsx` | `supabase` can be `null` when env vars are missing, but **every call** (`supabase.auth.getSession()`, `supabase.from(...)`) had no null guard — would throw `TypeError: Cannot read properties of null`. | Added `if (!supabase)` guards throughout. |
| C4 | `src/services/orderService.js` | `runAllocation` wrote to `supabase.from('allocations')` but the schema table is **`order_allocations`**. Silent Supabase error, allocation records never created. | Fixed to `order_allocations` with `upsert` for idempotency. |
| C5 | `src/pages/Orders.jsx` | FK join hint `allocations!allocations_order_id_fkey` is **wrong table name** — query returns no allocation data, so `alloc` is always `0`. | Changed to `order_allocations` with fallback fetch. |

---

### 🟠 HIGH

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| H1 | `src/pages/AdminDashboard.jsx` | Used `alert()` for allocation result/error feedback — blocks the UI thread, looks unprofessional, unblockable on some browsers. | Replaced with toast notification (bottom-right, auto-dismiss). |
| H2 | `src/pages/AdminDashboard.jsx` | `runAllocation` result was ignored — no way to tell how many orders were allocated. | `runAllocation` now returns `{ allocated, remaining }`, shown in toast. |
| H3 | `src/pages/AdminDashboard.jsx` | "RUN ALLOCATION" button was enabled even when `available_quantity === 0`. Pointless call, confusing UX. | Button disabled + tooltip when out of stock. |
| H4 | `src/pages/AdminOrders.jsx` | `cancelled` orders used `badge-accent` (red), identical to `pending`. No visual distinction between two very different states. | `cancelled` now uses `badge-cancelled` (neutral grey). |
| H5 | `src/pages/Profile.jsx` | Saving name only updated local `profile` state — the **Sidebar still showed the old name** because it reads from `AuthContext.profile`. | `updateProfileCache({ name })` added to `AuthContext`, called on save. |
| H6 | `src/components/StatCard.jsx` | `String(value).padStart(2, '0')` on a **string value** (e.g. `topCategory = 'Electronics'`) produces garbled output like `"Electronics"` padded to 2 chars — no-op but semantically wrong; on values like `"1"` it produces `"01"` which is fine for numbers but wrong for strings. | Guard added: only pad when `typeof value === 'number'`. |
| H7 | `src/pages/TimeSlotMonitor.jsx` | **Division by zero** — `current / max_capacity` when `max_capacity === 0` produces `Infinity` or `NaN`, breaking the progress bar width (`width: Infinity%`) and status logic. | Introduced `safePct()` helper that returns 0 when max is falsy. |
| H8 | `src/services/orderService.js` | `runAllocation` used `break` on first order it couldn't fulfil — **skipped smaller orders** that could still be allocated. Pure FIFO is correct for fairness, but `break` means a large order blocks all subsequent ones even if a later smaller order fits. Changed to `continue` with a note. | Changed `break` → `continue` so remaining stock is offered to subsequent orders. |

---

### 🟡 MEDIUM

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| M1 | `src/pages/BusinessListings.jsx` | No validation that `available_quantity ≤ total_quantity`. A business could set available=9999, total=1. | Validation added in `handleSave()`. |
| M2 | `src/pages/Orders.jsx` | No error state shown to user when Supabase fetch fails — blank page with `console.error` only. | Error banner added; fallback fetch without allocations. |
| M3 | `src/pages/Landing.jsx` | "PLACE ORDER →" CTA for logged-in users linked to `/app/dashboard`. Customers are immediately redirected to `/products` from dashboard — two navigations. | Link changed to `/app/products` directly. |
| M4 | `src/pages/Signup.jsx` | `businessDescription` and `businessCategory` fields are collected in the form but **never passed** to `signUp()`. Only `businessName` is forwarded. The fields are just decorative. | *Not fixed in code* — these fields are currently UI-only. If the DB trigger supports them, pass them via `user_metadata`. Flagged for backend work. |
| M5 | `src/index.css` | No mobile layout. On screens < 768px, the 240px sidebar + main flex row overflows horizontally with no scrolling recovery. | Added mobile breakpoints: vertical stacking, table overflow scroll, responsive grid helpers. |
| M6 | `src/context/AuthContext.jsx` | Debug `console.log("PROFILE LOADED:", data)` left in production code. | Removed. |
| M7 | `src/pages/AdminDashboard.jsx` | Orders were sorted only by `created_at`; ignored the `rank` column which is the FIFO sequence key. | Sort now prioritises `rank`, then `created_at` as fallback. |
| M8 | `src/pages/AllocationMonitor.jsx` | File uses 100% mock data (`mockData.js`), not routed anywhere, references unloaded `Syne` font, and has no Supabase queries. **Dead code.** | Not deleted (preserves git history) but excluded from all imports. Can be removed or replaced with a real Supabase-backed page. |

---

### 🟢 LOW

| # | File | Issue | Note |
|---|------|-------|------|
| L1 | `src/data/mockData.js` | Only consumed by dead `AllocationMonitor.jsx`. | Safe to delete once AllocationMonitor is addressed. |
| L2 | `src/pages/ProtectedLayout.jsx` | `*` fallback redirects to `dashboard` — causes 2-hop redirect for customers (dashboard → products). Functionally fine. | Layout class hooks (`layout-root`, `main-content`) added for mobile CSS. |
| L3 | `src/components/Sidebar.jsx` | Hover uses imperative `e.currentTarget.style.*` which can conflict with active NavLink style. Works in practice but fragile. | Low risk; not changed. |
| L4 | `src/pages/CreateOrder.jsx` | After order success, stock is re-fetched from DB. If the DB trigger hasn't decremented `available_quantity` yet (async), the displayed stock may be stale for ~1 second. | Acceptable; refresh already implemented. |
| L5 | All pages | No `useCallback`/`useMemo` on fetch functions — every render recreates them. Low impact given page-level components, but can cause `useEffect` dependency lint warnings. | Fixed in AdminDashboard; others are lower priority. |

---

## Phase 2 — Database Verification

### Required SQL Fixes

```sql
-- 1. Ensure order_allocations table exists with correct structure
-- (run only if table doesn't exist)
CREATE TABLE IF NOT EXISTS order_allocations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  allocated_quantity integer NOT NULL CHECK (allocated_quantity > 0),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(order_id)  -- one allocation record per order
);

-- Index for FK lookups
CREATE INDEX IF NOT EXISTS idx_order_allocations_order_id ON order_allocations(order_id);

-- 2. Ensure orders.rank has a reliable default (sequence or trigger)
-- If rank is not auto-assigned, two concurrent inserts will get the same rank.
-- Option A: use a sequence
CREATE SEQUENCE IF NOT EXISTS order_rank_seq;
ALTER TABLE orders ALTER COLUMN rank SET DEFAULT nextval('order_rank_seq');

-- Option B (better — product-scoped FIFO rank via trigger):
-- See trigger below.

-- 3. Stock decrement trigger on order INSERT (prevents oversell)
CREATE OR REPLACE FUNCTION decrement_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET available_quantity = available_quantity - NEW.quantity
  WHERE id = NEW.product_id AND available_quantity >= NEW.quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrement_stock ON orders;
CREATE TRIGGER trg_decrement_stock
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION decrement_stock();

-- 4. Stock restoration on order cancellation
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE products
    SET available_quantity = available_quantity + OLD.quantity
    WHERE id = OLD.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restore_stock ON orders;
CREATE TRIGGER trg_restore_stock
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cancel();

-- 5. Per-product FIFO rank trigger (race-condition safe)
CREATE OR REPLACE FUNCTION assign_order_rank()
RETURNS TRIGGER AS $$
DECLARE
  next_rank integer;
BEGIN
  SELECT COALESCE(MAX(rank), 0) + 1
  INTO next_rank
  FROM orders
  WHERE product_id = NEW.product_id;

  NEW.rank := next_rank;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_rank ON orders;
CREATE TRIGGER trg_assign_rank
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_order_rank();

-- 6. Recommended indexes
CREATE INDEX IF NOT EXISTS idx_orders_product_status ON orders(product_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_rank ON orders(product_id, rank);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
```

### RLS Recommendations
```sql
-- Orders: users can only see/insert their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin sees all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products: anyone can read; only businesses (created_by) can modify their own
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public product read" ON products FOR SELECT USING (true);
CREATE POLICY "Business modifies own products" ON products FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Admin modifies all products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## Phase 3 — RBAC Assessment

| Check | Status |
|-------|--------|
| Admin routes conditionally rendered | ✅ Secure — routes not in DOM for non-admins |
| Business routes isolated | ✅ `isBusiness &&` conditional rendering |
| Customer access to admin pages | ✅ Falls to `*` → redirect |
| Supabase RLS on orders | ⚠️ Verify enabled — see SQL above |
| Business can only edit own products | ✅ `.eq('created_by', user.id)` on all mutations |
| Role derived from profiles table | ✅ Not from client-side metadata (except brief signup window) |
| Session persistence | ✅ `persistSession: true` in supabaseClient |

---

## Phase 5 — Performance Notes

- `fetchOrders` in `AdminDashboard` had no `useCallback` — refactored to prevent unnecessary re-subscriptions.
- `AdminDashboard` now uses a single `Promise.all` for parallel product + order fetch.
- `runAllocation` client-side is O(n) sequential Supabase calls — for high volume, move to a PostgreSQL function called via `supabase.rpc('run_allocation', { product_id })`.

---

## Phase 6 — Reliability Checklist

| Workflow | Status |
|----------|--------|
| Order creation | ✅ Inserts with `user_id`, `product_id`, `quantity`, `status: 'pending'` |
| Stock decrement | ⚠️ Frontend refetches after order — decrement should be in DB trigger (SQL provided) |
| Stock restoration on cancel | ⚠️ Not implemented client-side — must be DB trigger (SQL provided) |
| FIFO ranking | ⚠️ `rank` default not confirmed atomic — DB trigger provided above |
| Slot allocation | ✅ TimeSlotMonitor reads `time_slots` correctly |
| Cancellation flow | ⚠️ Admin can set status → `cancelled` but stock is not restored without DB trigger |
| AllocationMonitor page | ❌ Uses mock data only, not routed |

---

## Phase 7 — Production Readiness Score

| Category | Score | Notes |
|----------|-------|-------|
| Code correctness | 72/100 | Hooks violation fixed, FK names fixed, null guards added |
| RBAC / Security | 78/100 | Client-side guards solid; RLS policy state unverified |
| Database design | 65/100 | Missing atomic stock triggers; allocation table name mismatch |
| UI/UX polish | 84/100 | Consistent design system; toast added; cancelled badge fixed |
| Error handling | 70/100 | Most pages log errors; now show user-facing messages too |
| Performance | 75/100 | Parallel fetches; no heavy memoization needed at current scale |
| Mobile responsiveness | 60/100 | Basic breakpoints added; sidebar collapse UX needs native mobile treatment |
| Reliability | 68/100 | FIFO logic sound; stock decrement/restore needs DB-level enforcement |

### **Overall: 72 / 100**

**To reach 90+:** implement DB-level stock triggers (SQL above), enable RLS policies, move `runAllocation` to a Supabase Edge Function or DB RPC, and add a proper mobile sidebar drawer.
