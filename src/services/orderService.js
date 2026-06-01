import { supabase } from '../lib/supabaseClient'

// Place Order
export async function placeOrder(userId, productId, quantity) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('orders')
    .insert([{ user_id: userId, product_id: productId, quantity, status: 'pending' }])
    .select()

  if (error) throw error
  return data[0]
}

// Queue Position (FIFO — how many pending orders are ahead of this one)
export async function getQueuePosition(order) {
  if (!supabase) throw new Error('Supabase not configured')
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', order.product_id)
    .eq('status', 'pending')
    .lt('created_at', order.created_at)

  if (error) throw error
  return (count ?? 0) + 1
}

// Admin allocation runner — FIFO over pending orders, bounded by available stock.
// Records each allocation in `allocations` and decrements product stock.
export async function runAllocation(productId) {
  if (!supabase) throw new Error('Supabase not configured')

  // 1. Get product + current stock
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError) throw productError

  let available = product.available_quantity
  if (available <= 0) return { allocated: 0, message: 'Out of stock' }

  // 2. Get pending orders FIFO (rank, then created_at as tie-breaker)
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, quantity')
    .eq('product_id', productId)
    .eq('status', 'pending')
    .order('rank', { ascending: true })
    .order('created_at', { ascending: true })

  if (ordersError) throw ordersError
  if (!orders || orders.length === 0) return { allocated: 0, message: 'No pending orders' }

  let allocated = 0

  for (const order of orders) {
    if (available < order.quantity) break

    // 3. Record allocation
    const { error: allocErr } = await supabase
      .from('allocations')
      .insert([{ order_id: order.id, allocated_quantity: order.quantity }])

    if (allocErr) throw allocErr

    // 4. Mark order allocated
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ status: 'allocated' })
      .eq('id', order.id)

    if (orderErr) throw orderErr

    available -= order.quantity
    allocated++
  }

  // 5. Persist remaining stock
  const { error: stockErr } = await supabase
    .from('products')
    .update({ available_quantity: available })
    .eq('id', productId)

  if (stockErr) throw stockErr

  return { allocated, remaining: available }
}
