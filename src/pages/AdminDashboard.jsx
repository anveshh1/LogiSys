import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { runAllocation } from '../services/orderService'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [allocating, setAllocating] = useState(null)
  const [toast, setToast] = useState(null) // { msg, type }

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (!error) setProducts(data || [])
  }, [])

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products!orders_product_id_fkey(name)')
      .order('rank', { ascending: true })
      .order('created_at', { ascending: true })
    if (!error) setOrders(data || [])
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchOrders()])
      setLoading(false)
    }
    init()
  }, [fetchProducts, fetchOrders])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleAllocation(productId) {
    setAllocating(productId)
    try {
      const result = await runAllocation(productId)
      showToast(
        result.allocated > 0
          ? `${result.allocated} order${result.allocated !== 1 ? 's' : ''} allocated successfully`
          : (result.message || 'No pending orders to allocate'),
        'success'
      )
      await Promise.all([fetchProducts(), fetchOrders()])
    } catch (err) {
      console.error(err)
      showToast('Allocation failed: ' + (err.message || 'Unknown error'), 'error')
    } finally {
      setAllocating(null)
    }
  }

  const pending = orders.filter(o => o.status === 'pending').length
  const allocated = orders.filter(o => o.status === 'allocated').length

  if (loading) return <LoadingSkeleton type="stat" count={4} />

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <PageHeader title="Admin Control" subtitle="Manage products and run order allocations" accent>
        <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--mono)', fontSize: '12px', color: '#555' }}>
          <span><span style={{ color: '#ff3c3c', fontSize: '16px', fontWeight: '300' }}>{pending}</span> pending</span>
          <span><span style={{ color: '#f0f0f0', fontSize: '16px', fontWeight: '300' }}>{allocated}</span> allocated</span>
        </div>
      </PageHeader>

      {/* Products */}
      <div>
        <h3 style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
          PRODUCTS
        </h3>
        {products.length === 0 ? (
          <EmptyState icon="◻" title="No products" description="Add products from the Listings page." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {products.map(p => (
              <div key={p.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: '600', color: '#111' }}>{p.name}</span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: '300',
                    color: p.available_quantity === 0 ? '#ff3c3c' : '#111',
                  }}>
                    {p.available_quantity}
                  </span>
                </div>
                <button
                  onClick={() => handleAllocation(p.id)}
                  disabled={allocating === p.id || p.available_quantity === 0}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.06em' }}
                  title={p.available_quantity === 0 ? 'Out of stock' : 'Run FIFO allocation'}
                >
                  {allocating === p.id
                    ? <><span className="spinner" style={{ borderTopColor: '#f5f2ee' }} /> RUNNING...</>
                    : 'RUN ALLOCATION →'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      <div>
        <h3 style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
          ALL ORDERS (FIFO)
        </h3>
        {orders.length === 0 ? (
          <EmptyState icon="≡" title="No orders yet" description="Orders placed by customers will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orders.map((order, i) => (
              <div key={order.id} className="card" style={{
                padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                animation: `fadeUp 0.3s ease ${i * 0.03}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#aaa8a4', width: '32px' }}>
                    #{order.rank ?? '—'}
                  </span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: '500', color: '#111' }}>
                    {order.products?.name ?? 'Unknown'}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#888' }}>
                    qty: {order.quantity}
                  </span>
                </div>
                <span className={`badge ${
                  order.status === 'pending' ? 'badge-accent'
                  : order.status === 'allocated' ? 'badge-neutral'
                  : order.status === 'cancelled' ? 'badge-cancelled'
                  : 'badge-success'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          padding: '14px 20px', borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--mono)', fontSize: '12px',
          border: `1px solid ${toast.type === 'success' ? 'rgba(0,200,83,0.3)' : 'rgba(255,60,60,0.3)'}`,
          background: toast.type === 'success' ? 'rgba(0,200,83,0.08)' : 'rgba(255,60,60,0.08)',
          color: toast.type === 'success' ? '#00c853' : '#ff3c3c',
          animation: 'fadeUp 0.3s ease',
          maxWidth: '360px',
        }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
