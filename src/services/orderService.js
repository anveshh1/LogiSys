import { supabase } from '../lib/supabaseClient'

// Place Order
export async function placeOrder(userId, productId, quantity) {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        status: 'pending'
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

// Queue Position
export async function getQueuePosition(order) {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', order.product_id)
    .eq('status', 'pending')
    .lt('created_at', order.created_at)

  if (error) throw error
  return count + 1
}

export async function runAllocation(productId) {
  // 1. Get product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError) throw productError

  let available = product.available_quantity
  if (available <= 0) return

  // 2. Get pending orders FIFO
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (ordersError) throw ordersError

  for (const order of orders) {
    if (available < order.quantity) break

    // 3. Insert allocation
    await supabase.from('allocations').insert([
      {
        order_id: order.id,
        allocated_quantity: order.quantity
      }
    ])

    // 4. Update order
    await supabase
      .from('orders')
      .update({ status: 'allocated' })
      .eq('id', order.id)

    available -= order.quantity
  }

  // 5. Update product stock
  await supabase
    .from('products')
    .update({ available_quantity: available })
    .eq('id', productId)
}