import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function Products() {
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')

    setProducts(data || [])
    setLoading(false)
  }

  const categories = ['All', 'Shoes', 'RAM', 'Tickets']
  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory)

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader title="Products" subtitle="Browse available products and place orders" />

      {/* CATEGORY BAR */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn btn-sm ${activeCategory === cat ? 'btn-accent' : 'btn-ghost'}`}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && <LoadingSkeleton type="cards" count={6} />}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon="◻"
          title="No products found"
          description={activeCategory !== 'All' ? `No products in "${activeCategory}" category.` : 'No products available yet.'}
        />
      )}

      {/* PRODUCT GRID */}
      {!loading && filtered.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '14px',
        }}>
          {filtered.map((p, i) => (
            <div key={p.id} className="card-dark" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
            }}>
              <div style={{
                fontFamily: 'var(--sans)',
                fontSize: '15px',
                fontWeight: '600',
                color: '#f0f0f0',
              }}>
                {p.name}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  color: '#777',
                  letterSpacing: '0.06em',
                }}>
                  STOCK: {p.available_quantity}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  color: '#777',
                  letterSpacing: '0.06em',
                }}>
                  CATEGORY: {p.category || 'N/A'}
                </div>
              </div>

              <button
                className="btn btn-outline btn-sm"
                style={{
                  width: '100%',
                  marginTop: 'auto',
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                }}
                onClick={() =>
                  navigate('/app/create-order', {
                    state: { product: p }
                  })
                }
              >
                ORDER →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}