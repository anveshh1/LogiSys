import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { runAllocation } from '../services/orderService'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [allocating, setAllocating] = useState(null)

  useEffect(() => { init() }, [])

  async function init() {
    setLoading(true)
    await Promise.all([fetchProducts(), fetchOrders()])
    setLoading(false)
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select(`*, products!orders_product_id_fkey(name)`).order('created_at', { ascending: true })
    setOrders(data || [])
  }

  async function handleAllocation(productId) {
    try {
      setAllocating(productId)
      await runAllocation(productId)
      alert("Allocation complete")
      fetchProducts()
      fetchOrders()
    } catch (err) {
      console.error(err)
      alert("Allocation failed")
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
        <h3 style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>PRODUCTS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {products.map(p => (
            <div key={p.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: '600', color: '#111' }}>{p.name}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: '300', color: p.available_quantity === 0 ? '#ff3c3c' : '#111' }}>{p.available_quantity}</span>
              </div>
              <button onClick={() => handleAllocation(p.id)} disabled={allocating === p.id}
                className="btn btn-primary btn-sm" style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.06em' }}>
                {allocating === p.id ? <><span className="spinner" style={{ borderTopColor: '#f5f2ee' }} /> RUNNING...</> : 'RUN ALLOCATION →'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div>
        <h3 style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>ALL ORDERS (FIFO)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {orders.map((order, i) => (
            <div key={order.id} className="card" style={{
              padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              animation: `fadeUp 0.3s ease ${i * 0.03}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: '500', color: '#111' }}>{order.products?.name}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#888' }}>qty: {order.quantity}</span>
              </div>
              <span className={`badge ${order.status === 'pending' ? 'badge-accent' : order.status === 'allocated' ? 'badge-neutral' : 'badge-success'}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}