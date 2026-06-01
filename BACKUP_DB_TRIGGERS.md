# DB Backup — orders triggers, functions, RLS (pre-change)
Captured live before the order-creation fix. Restore = re-run the CREATE statements below.

## Triggers on public.orders (8, all enabled 'O')
```sql
CREATE TRIGGER trg_allocate_order   AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION allocate_order_to_slot();
CREATE TRIGGER trg_assign_rank      BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION assign_order_rank();
CREATE TRIGGER trg_create_allocation AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION create_allocation_record();
CREATE TRIGGER trg_decrement_stock  BEFORE INSERT ON public.orders FOR EACH ROW WHEN ((new.status = 'pending')) EXECUTE FUNCTION decrement_stock();
CREATE TRIGGER trg_order_cancelled  BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION handle_order_cancellation();
CREATE TRIGGER trg_process_order    BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION process_new_order();
CREATE TRIGGER trg_restore_on_cancel AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION restore_on_cancel();
CREATE TRIGGER trg_restore_stock    AFTER UPDATE OF status ON public.orders FOR EACH ROW EXECUTE FUNCTION restore_stock_on_cancel();
```

## Function bodies (verbatim) — see conversation capture
- allocate_order_to_slot(): INSERT INTO order_allocations(order_id, slot_id) ...  [BROKEN: no slot_id column]
- assign_order_rank(): NEW.rank := MAX(rank)+1 per product_id
- create_allocation_record() SECDEF: INSERT INTO allocations(order_id, allocated_quantity)
- decrement_stock(): UPDATE products SET available_quantity-=qty WHERE id=.. AND available>=qty; else RAISE 'Insufficient stock for product %'
- handle_order_cancellation() SECDEF: on ->cancelled restore products.available_quantity += OLD.quantity, free slot via orders.slot_id
- process_new_order() SECDEF: check+deduct stock (FOR UPDATE), assign slot, RAISE 'Insufficient stock. Available..' / 'Product not found'
- restore_on_cancel(): on ->cancelled restore stock, free slot via order_allocations.slot_id [BROKEN], DELETE order_allocations
- restore_stock_on_cancel(): on ->cancelled restore products.available_quantity += OLD.quantity

## Functions are NOT dropped (only triggers detached) so all bodies remain restorable.

## RLS (public) — healthy, NOT modified
- profiles: "Admin reads all profiles" USING is_admin()  [recursion already fixed], "Users read own profile", "Users can view own profile", "Users update own profile", "Users can update own name", "Service can insert profiles"
- orders: "Users see own orders" (auth.uid()=user_id), "Users insert own orders" CHECK (auth.uid()=user_id), "Users cancel own orders" UPDATE, "Admin sees all orders" ALL is_admin-subquery
- products: "Public product read" (true), "Business modifies own products" (auth.uid()=created_by), "Admin modifies all products"
- order_allocations: "Admin full access allocations", "Users read own allocations"  (table empty/unused)
