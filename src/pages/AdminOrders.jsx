import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, quantity, status, rank, created_at,
        profiles!orders_user_id_fkey(name, email),
        products!orders_product_id_fkey(name),
        time_slots(slot_start, slot_end)
      `)
      .order('created_at', { ascending: false })

    if (error) console.error('Fetch orders error:', error)
    else setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId, newStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error('Status update error:', error)
      alert('Failed to update status')
    } else {
      // Refresh from DB to get consistent state
      fetchOrders()
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = {
    all: orders.length,
    allocated: orders.filter(o => o.status === 'allocated').length,
    pending: orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (loading) return <LoadingSkeleton type="table" count={6} />

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader title="All Orders" subtitle="Manage and update order statuses" accent />

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: '2px', border: '1px solid #d8d4ce', borderRadius: 'var(--radius-sm)',
        padding: '3px', background: '#f5f2ee', alignSelf: 'flex-start',
      }}>
        {['all', 'allocated', 'pending', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
            background: filter === f ? '#111111' : 'transparent',
            color: filter === f ? '#f5f2ee' : '#888880',
            transition: 'all var(--transition)',
          }}>
            {f} <span style={{ opacity: 0.6 }}>({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '13px', color: '#888880' }}>
            no orders
          </div>
        ) : (
          <table className="table-clean">
            <thead>
              <tr style={{ background: 'var(--bg-3)' }}>
                {['id', 'customer', 'product', 'slot', 'priority', 'status', 'actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const customerName = order.profiles?.name || order.profiles?.email?.split('@')[0] || 'Unknown'
                const productName = order.products?.name || 'Unknown'
                const slot = order.time_slots
                  ? `${order.time_slots.slot_start?.slice(0,5)} - ${order.time_slots.slot_end?.slice(0,5)}`
                  : '—'
                const shortId = order.id?.slice(0, 6) || '—'

                return (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#aaa8a4' }}>#{shortId}</td>
                    <td style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: '#111', fontWeight: '500' }}>{customerName}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#555550' }}>{productName}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#888880' }}>{slot}</td>
                    <td>
                      <span className="badge badge-accent" style={{ fontSize: '10px' }}>#{order.rank || '—'}</span>
                    </td>
                    <td>
                      <span className={`badge ${order.status === 'pending' ? 'badge-accent' : order.status === 'cancelled' ? 'badge-accent' : 'badge-neutral'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {['allocated', 'pending', 'cancelled'].filter(s => s !== order.status).map(s => (
                          <button key={s} onClick={() => updateStatus(order.id, s)}
                            className="btn btn-sm" style={{
                              padding: '4px 10px', border: '1px solid #d8d4ce', background: 'transparent',
                              color: '#555550', fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase',
                              letterSpacing: '0.06em', cursor: 'pointer', borderRadius: '4px',
                              transition: 'all var(--transition)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#f5f2ee'; e.currentTarget.style.borderColor = '#111' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555550'; e.currentTarget.style.borderColor = '#d8d4ce' }}>
                            → {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
