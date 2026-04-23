import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmRemove, setConfirmRemove] = useState(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles!products_created_by_fkey(name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch products error:', error)
      // Fallback: fetch without join if FK doesn't exist yet
      const { data: fallback } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      setProducts(fallback || [])
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) console.error('Toggle error:', error)
    else fetchProducts()
  }

  async function removeProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      setProducts(products.filter(p => p.id !== id))
      setConfirmRemove(null)
    }
  }

  if (loading) return <LoadingSkeleton type="cards" count={6} />

  const active = products.filter(p => (p.status || 'active') === 'active').length
  const inactive = products.filter(p => p.status === 'inactive' || p.available_quantity === 0).length

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader title="Product Listings" subtitle="Manage product inventory and status" accent>
        <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--mono)', fontSize: '12px', color: '#555' }}>
          <span><span style={{ color: '#f0f0f0', fontSize: '16px', fontWeight: '300' }}>{active}</span> active</span>
          <span><span style={{ color: '#ff3c3c', fontSize: '16px', fontWeight: '300' }}>{inactive}</span> inactive</span>
        </div>
      </PageHeader>

      {products.length === 0 && (
        <EmptyState icon="◻" title="No products listed" description="Add products to see them here." />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
        {products.map((p, i) => {
          const seller = p.profiles?.name || p.profiles?.email?.split('@')[0] || '—'
          const status = p.status || 'active'
          const stock = p.available_quantity ?? p.total_quantity ?? 0

          return (
            <div key={p.id} className="card" style={{
              padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px',
              borderColor: status === 'inactive' ? 'rgba(255,60,60,0.2)' : undefined,
              background: status === 'inactive' ? 'rgba(255,60,60,0.02)' : undefined,
              animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: '600', color: status === 'active' ? '#111' : '#888' }}>{p.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#888880', marginTop: '3px' }}>{seller}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '24px', fontWeight: '300', color: stock === 0 ? '#ff3c3c' : '#111', lineHeight: 1 }}>{stock}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#aaa8a4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>units</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge ${status === 'active' ? 'badge-neutral' : 'badge-accent'}`}>{status}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#aaa8a4' }}>
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '7px' }}>
                <button onClick={() => toggleStatus(p.id, status)} className="btn btn-sm" style={{
                  flex: 1, fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '0.06em', border: '1px solid #d8d4ce', background: 'transparent',
                  color: '#555550', cursor: 'pointer', transition: 'all var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#f5f2ee'; e.currentTarget.style.borderColor = '#111' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555550'; e.currentTarget.style.borderColor = '#d8d4ce' }}>
                  {status === 'active' ? 'deactivate' : 'activate'}
                </button>

                {confirmRemove === p.id ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => removeProduct(p.id)} className="btn btn-accent btn-sm" style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>confirm</button>
                    <button onClick={() => setConfirmRemove(null)} className="btn btn-sm" style={{ border: '1px solid #d8d4ce', background: 'transparent', color: '#888', fontFamily: 'var(--mono)', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmRemove(p.id)} className="btn btn-danger btn-sm" style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>remove</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
