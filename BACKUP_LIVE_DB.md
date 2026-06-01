# LogiSys — Live Database Backup / Snapshot
Source: live PostgREST OpenAPI introspection (service key) + anon RLS probes.
Generated before any DB modification.

## Tables & Columns (LIVE, confirmed)

- **orders**: id (uuid, PK), user_id (uuid), product_id (uuid), quantity (int), status (text), created_at (timestamptz), rank (int), slot_id (uuid)
- **profiles**: id (uuid, PK), email (text), name (text), role (text), created_at (timestamptz), business_name (text), business_id (text)
- **products**: id (uuid, PK), name (text), total_quantity (int), available_quantity (int), created_at (timestamptz), category (text), created_by (uuid), category_id (uuid), description (text), status (text)
- **allocations**: id (uuid, PK), order_id (uuid), allocated_quantity (int), allocated_at (timestamptz)  — **27 rows, app's real allocation table**
- **order_allocations**: id (uuid, PK), order_id (uuid), allocated_quantity (int), created_at (timestamptz)
- **time_slots**: id (uuid, PK), slot_start (time), slot_end (time), max_capacity (int), current_capacity (int) — 6 rows
- **categories**: id (uuid, PK), name (text)

## Live behavior probes (anon key)

| Table | Result |
|-------|--------|
| profiles | ❌ 42P17 infinite recursion detected in policy for relation "profiles" |
| products | ❌ 42P17 (recursion via profiles policy) |
| orders | ❌ 42P17 (recursion via profiles policy) |
| order_allocations | ❌ 42P17 (recursion via profiles policy) |
| categories | ❌ 42501 permission denied |
| allocations | ✅ readable (27 rows) |
| time_slots | ✅ readable (6 rows) |

## Service-role key probes
- All tables → 42501 permission denied (this key's role lacks table GRANTs).
- pg_policies / pg_tables → PGRST205 (pg_catalog not exposed via REST — cannot read policies/triggers/functions through any API key).

## Confirmed root cause (data layer)
`42P17 infinite recursion` on **profiles** RLS — a SELECT policy on `profiles` whose `USING` clause itself queries `profiles` (admin check). Every table whose policy references `profiles` for an admin check inherits the failure. This breaks profile load → role detection → products/orders/admin pages.

## NOT yet readable (require direct Postgres or SQL Editor)
- Exact RLS policy definitions & names
- Triggers (expected: trg_process_order, trg_create_allocation, trg_order_cancelled per local SQL — UNVERIFIED against live)
- Functions (handle_new_user, etc. — UNVERIFIED)
- Views
