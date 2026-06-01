import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import StatCard from '../components/StatCard'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#f5f2ee', border: '1px solid #d8d4ce', borderRadius: 'var(--radius-sm)',
      padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ color: '#888880', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.dataKey === 'used' ? '#111111' : '#bbb8b2', marginBottom: '2px' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)

    // Fetch real orders from Supabase
    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders')
      .select(`
        id, quantity, status, rank, created_at,
        profiles!orders_user_id_fkey(name, email),
        products!orders_product_id_fkey(name)
      `)
      .order('created_at', { ascending: false })

    if (ordersErr) console.error('Orders fetch error:', ordersErr)

    // Fetch real time slots from Supabase
    const { data: slotsData, error: slotsErr } = await supabase
      .from('time_slots')
      .select('*')
      .order('slot_start', { ascending: true })

    if (slotsErr) console.error('Slots fetch error:', slotsErr)

    setOrders(ordersData || [])
    setSlots(slotsData || [])
    setLoading(false)
  }

  const total = orders.length
  const allocated = orders.filter(o => o.status === 'allocated').length
  const pending = orders.filter(o => o.status === 'pending').length
  const full = slots.filter(s => s.current_capacity >= s.max_capacity).length

  const chartData = slots.map(s => ({
    name: s.slot_start?.slice(0, 5),
    used: s.current_capacity,
    free: s.max_capacity - s.current_capacity,
  }))

  if (loading) return <LoadingSkeleton type="stat" count={4} />

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <PageHeader title="Distribution Dashboard" subtitle="Overview of order allocation and capacity" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <StatCard label="total_orders" value={total} sub="all time" />
        <StatCard label="allocated" value={allocated} sub="assigned to slot" />
        <StatCard label="pending" value={pending} sub="awaiting slot" accent />
        <StatCard label="slots_full" value={full} sub={`of ${slots.length} windows`} />
      </div>

      {/* Chart */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
          capacity_utilization
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: '#555550', marginBottom: '20px' }}>
          Orders per time window
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={3}>
              <XAxis dataKey="name" tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="used" name="used" fill="#111111" radius={[4, 4, 0, 0]} />
              <Bar dataKey="free" name="free" fill="#d8d4ce" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: '#aaa8a4' }}>
            No time slots configured yet
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #d8d4ce',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            recent_orders
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#aaa8a4' }}>
            {orders.length} total
          </div>
        </div>
        {orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '13px', color: '#aaa8a4' }}>
            No orders placed yet
          </div>
        ) : (
          orders.slice(0, 5).map((order, i) => {
            const customerName = order.profiles?.name || order.profiles?.email?.split('@')[0] || 'Unknown'
            const productName = order.products?.name || 'Unknown'
            const shortId = order.id?.slice(0, 6) || '—'

            return (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: i < 4 ? '1px solid #e8e4de' : 'none',
                transition: 'background var(--transition)',
                cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#edeae5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#aaa8a4', width: '54px' }}>
                    #{shortId}
                  </span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: '#111111', fontWeight: '500' }}>
                    {customerName}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#666660' }}>
                    {productName}
                  </span>
                </div>
                <span className={`badge ${order.status === 'pending' ? 'badge-accent' : 'badge-neutral'}`}>
                  {order.status}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
