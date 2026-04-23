import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#111111', '#ff3c3c', '#d8d4ce', '#888880', '#555550']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#f5f2ee', border: '1px solid #d8d4ce', borderRadius: 'var(--radius-sm)',
      padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ color: '#888880', marginBottom: '6px' }}>{label || payload[0]?.name}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#111', marginBottom: '2px' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function AdminProductOverview() {
  const [dbProducts, setDbProducts] = useState(null)
  const [dbOrders, setDbOrders] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { init() }, [])

  async function init() {
    setLoading(true)
    try {
      const [prodRes, ordRes] = await Promise.all([
        supabase?.from('products').select('*'),
        supabase?.from('orders').select('*, products!orders_product_id_fkey(name, category)'),
      ])
      if (prodRes?.data) setDbProducts(prodRes.data)
      if (ordRes?.data) setDbOrders(ordRes.data)
    } catch (e) { /* fallback to mock */ }
    setLoading(false)
  }

  const products = dbProducts || []
  const orders = dbOrders || []

  // --- Stats ---
  const totalProducts = products.length
  const activeProducts = products.filter(p =>
    p.status === 'active' || (p.available_quantity !== undefined && p.available_quantity > 0)
  ).length
  const inactiveProducts = products.filter(p =>
    p.status === 'inactive' || p.quantity === 0 || p.available_quantity === 0
  ).length
  const totalOrders = orders.length
  const uniqueSellers = [...new Set(products.map(p => p.created_by).filter(Boolean))]
  const totalBusinesses = uniqueSellers.length

  // Category breakdown
  const categoryMap = {}
  products.forEach(p => {
    const cat = p.category || 'Uncategorized'
    categoryMap[cat] = (categoryMap[cat] || 0) + 1
  })
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
  const topCategory = categoryData.sort((a, b) => b.value - a.value)[0]?.name || '—'

  // Stock distribution for bar chart
  const stockData = products.slice(0, 8).map(p => ({
    name: p.name?.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
    stock: p.available_quantity ?? p.quantity ?? 0,
  }))

  // Order status breakdown
  const statusMap = {}
  orders.forEach(o => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1
  })
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

  if (loading) return <LoadingSkeleton type="stat" count={6} />

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <PageHeader title="Product Overview" subtitle="Admin insights across all products, listings, and orders" accent />

      {/* === STAT CARDS === */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <StatCard label="total_products" value={totalProducts} sub="all listings" />
        <StatCard label="active" value={activeProducts} sub="currently listed" />
        <StatCard label="inactive" value={inactiveProducts} sub="out of stock / off" accent />
        <StatCard label="businesses" value={totalBusinesses} sub="unique sellers" />
        <StatCard label="total_orders" value={totalOrders} sub="all time" />
        <StatCard label="top_category" value={topCategory} sub="most products" />
      </div>

      {/* === CHARTS ROW === */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>

        {/* Stock Distribution Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
            stock_distribution
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: '#555550', marginBottom: '20px' }}>
            Available stock per product
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stockData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#888880', fontSize: 10, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="stock" name="stock" fill="#111111" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
            category_breakdown
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: '#555550', marginBottom: '20px' }}>
            Products by category
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" strokeWidth={2} stroke="#f5f2ee">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {categoryData.map((cat, i) => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#555550', flex: 1 }}>{cat.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#111', fontWeight: '500' }}>{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === ORDER STATUS OVERVIEW === */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
          order_status_overview
        </div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {statusData.map(s => {
            const color = s.name === 'pending' ? '#ff3c3c' : s.name === 'allocated' ? '#111111' : s.name === 'fulfilled' ? '#00c853' : '#888880'
            const pct = totalOrders > 0 ? Math.round((s.value / totalOrders) * 100) : 0
            return (
              <div key={s.name} className="card" style={{ padding: '18px 22px', flex: '1 1 140px', minWidth: '140px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#888880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {s.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: '300', color, lineHeight: 1 }}>
                    {s.value}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#aaa8a4' }}>
                    {pct}%
                  </span>
                </div>
                {/* Mini bar */}
                <div style={{ marginTop: '10px', height: '3px', background: '#d8d4ce', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* === RECENT LISTINGS TABLE === */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #d8d4ce',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-3)',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            recent_listings
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#aaa8a4' }}>
            {products.length} total
          </div>
        </div>
        <table className="table-clean">
          <thead>
            <tr>
              <th>product</th>
              <th>seller</th>
              <th>stock</th>
              <th>category</th>
              <th>status</th>
              <th>created</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 10).map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'var(--sans)', fontWeight: '500', color: '#111' }}>{p.name}</td>
                <td style={{ fontFamily: 'var(--mono)', color: '#888880' }}>{p.created_by?.slice(0, 8) || '—'}</td>
                <td style={{ fontFamily: 'var(--mono)', color: (p.available_quantity ?? p.quantity) === 0 ? '#ff3c3c' : '#555550', fontWeight: '500' }}>
                  {p.available_quantity ?? p.quantity ?? 0}
                </td>
                <td><span className="badge badge-neutral">{p.category || 'N/A'}</span></td>
                <td>
                  <span className={`badge ${p.status === 'active' ? 'badge-neutral' : 'badge-accent'}`}>
                    {p.status || 'active'}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#aaa8a4' }}>
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
