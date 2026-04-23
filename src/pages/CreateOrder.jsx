import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

export default function CreateOrder() {
  const { user } = useAuth()
  const location = useLocation()

  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (location.state?.product) {
      const p = location.state.product
      setSelectedProduct(p)
      setCategory(p.category) // 🔥 KEY FIX
    }
  }, [location.state])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')

    setProducts(data || [])
  }

  // ✅ FILTER USING REAL CATEGORY
  const filteredProducts =
    category === 'All'
      ? products
      : products.filter(p => p.category === category)

  async function handleOrder() {
    setMessage('')
    setMessageType('')

    if (!selectedProduct) {
      setMessage('Select a product')
      setMessageType('error')
      return
    }

    if (quantity <= 0) {
      setMessage('Invalid quantity')
      setMessageType('error')
      return
    }

    if (quantity > selectedProduct.available_quantity) {
      setMessage('Not enough stock')
      setMessageType('error')
      return
    }

    setLoading(true)

    // 🔥 GET NEXT RANK
    const { data: maxRank } = await supabase
      .from('orders')
      .select('rank')
      .order('rank', { ascending: false })
      .limit(1)

    const newRank = (maxRank?.[0]?.rank || 0) + 1

    const { error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: selectedProduct.id,
        quantity,
        rank: newRank,
        status: 'pending'
      })

    if (error) {
      console.error(error)
      setMessage('Failed to place order')
      setMessageType('error')
    } else {
      setMessage('Order placed successfully!')
      setMessageType('success')
      setQuantity(1)
      // Refresh stock so UI shows updated available_quantity
      await fetchProducts()
      // Update selected product with fresh data
      if (selectedProduct) {
        const { data: freshProduct } = await supabase
          .from('products').select('*').eq('id', selectedProduct.id).single()
        if (freshProduct) setSelectedProduct(freshProduct)
      }
    }

    setLoading(false)
  }

  return (
    <div className="fade-up" style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader title="Create Order" subtitle="Select a product and quantity to place your order" />

      <div className="card-dark" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

        {/* CATEGORY */}
        <div>
          <label className="label-dark">CATEGORY</label>
          <select
            value={category}
            onChange={e => {
              setCategory(e.target.value)
              setSelectedProduct(null)
            }}
            className="input-dark"
          >
            <option value="All">All</option>
            {[...new Set(products.map(p => p.category).filter(Boolean))].sort().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* PRODUCT */}
        <div>
          <label className="label-dark">PRODUCT</label>
          <select
            value={selectedProduct?.id || ''}
            onChange={e => {
              const p = filteredProducts.find(
                x => x.id == e.target.value
              )
              setSelectedProduct(p)
            }}
            className="input-dark"
          >
            <option value="">Select product</option>
            {filteredProducts.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT INFO */}
        {selectedProduct && (
          <div style={{
            padding: '14px 16px',
            border: '1px solid var(--border-dark)',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: '600', color: '#f0f0f0' }}>
              {selectedProduct.name}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#777' }}>
              Available: {selectedProduct.available_quantity}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#777' }}>
              Category: {selectedProduct.category}
            </div>
          </div>
        )}

        {/* QUANTITY */}
        <div>
          <label className="label-dark">QUANTITY</label>
          <input
            type="number"
            value={quantity}
            min="1"
            max={selectedProduct?.available_quantity || 1}
            onChange={e => setQuantity(Number(e.target.value))}
            className="input-dark"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleOrder}
          disabled={loading}
          className="btn btn-cream"
          style={{ width: '100%', padding: '13px', fontSize: '14px' }}
        >
          {loading ? <><span className="spinner" style={{ borderTopColor: '#111' }} /> PLACING...</> : 'PLACE ORDER →'}
        </button>

        {/* MESSAGE */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            lineHeight: '1.5',
            border: `1px solid ${messageType === 'success' ? 'rgba(0,200,83,0.3)' : 'rgba(255,60,60,0.3)'}`,
            background: messageType === 'success' ? 'rgba(0,200,83,0.06)' : 'rgba(255,60,60,0.06)',
            color: messageType === 'success' ? '#00c853' : '#ff3c3c',
            animation: 'fadeUp 0.3s ease',
          }}>
            {messageType === 'success' ? '✓ ' : '✕ '}{message}
          </div>
        )}
      </div>
    </div>
  )
}