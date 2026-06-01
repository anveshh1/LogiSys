import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { Link } from 'react-router-dom'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    if (user) fetchOrders()
  }, [user])

  async function fetchOrders() {
    setLoading(true)
    setFetchError(null)
    const { data, error } = await supabase
      .from('orders')
      .select(`id, quantity, status, created_at, rank,
        products!orders_product_id_fkey(name),
        allocations!allocations_order_id_fkey(allocated_quantity)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setOrders(data || [])
      setLoading(false)
      return
    }

    // The allocations join failed — retry without it before treating this as an error.
    console.error(error)
    const { data: fallback, error: fallbackError } = await supabase
      .from('orders')
      .select(`id, quantity, status, created_at, rank, products!orders_product_id_fkey(name)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fallbackError) {
      console.error(fallbackError)
      setFetchError(true) // genuine failure — orders could not be loaded
      setOrders([])
    } else {
      setOrders(fallback || []) // recovered; empty result is just "no orders", not an error
    }
    setLoading(false)
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader title="My Orders" subtitle="Track your order status and allocations">
        <Link to="/app/create-order">
          <button className="btn btn-outline btn-sm" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>+ NEW ORDER</button>
        </Link>
      </PageHeader>

      {loading && <LoadingSkeleton type="table" count={5} />}

      {!loading && fetchError && (
        <EmptyState icon="✕" title="Unable to load orders"
          description="Something went wrong while fetching your orders." />
      )}

      {!loading && !fetchError && orders.length === 0 && (
        <EmptyState icon="≡" title="No orders yet" description="Place your first order to see it here."
          action={<Link to="/app/create-order"><button className="btn btn-outline btn-sm">Create Order →</button></Link>} />
      )}

      {!loading && orders.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table-clean">
            <thead><tr style={{ background: 'var(--bg-3)' }}>
              <th>PRODUCT</th><th>QTY</th><th>ALLOCATED</th><th>STATUS</th><th>DATE</th>
            </tr></thead>
            <tbody>
              {orders.map(order => {
                const alloc = order.allocations?.reduce((s, a) => s + (a.allocated_quantity ?? 0), 0) || 0
                const badgeClass = order.status === 'pending' ? 'badge-accent'
                  : order.status === 'fulfilled' ? 'badge-success'
                  : order.status === 'cancelled' ? 'badge-cancelled'
                  : 'badge-neutral'
                return (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'var(--sans)', fontWeight: '500', color: '#111' }}>
                      {order.products?.name ?? 'Unknown'}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', color: '#555550' }}>{order.quantity}</td>
                    <td style={{ fontFamily: 'var(--mono)', color: '#555550' }}>{alloc || '—'}</td>
                    <td><span className={`badge ${badgeClass}`}>{order.status}</span></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#888880' }}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}