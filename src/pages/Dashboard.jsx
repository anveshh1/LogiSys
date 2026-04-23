import { mockOrders, mockSlots } from '../data/mockData'
import StatCard from '../components/StatCard'
import PageHeader from '../components/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const chartData = mockSlots.map(s => ({
  name: s.slot_start,
  used: s.current_capacity,
  free: s.max_capacity - s.current_capacity,
}))

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
  const total = mockOrders.length
  const allocated = mockOrders.filter(o => o.status === 'allocated').length
  const pending = mockOrders.filter(o => o.status === 'pending').length
  const full = mockSlots.filter(s => s.current_capacity >= s.max_capacity).length

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <PageHeader title="Distribution Dashboard" subtitle="Overview of order allocation and capacity" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <StatCard label="total_orders" value={total} sub="all time" />
        <StatCard label="allocated" value={allocated} sub="assigned to slot" />
        <StatCard label="pending" value={pending} sub="awaiting slot" accent />
        <StatCard label="slots_full" value={full} sub={`of ${mockSlots.length} windows`} />
      </div>

      {/* Chart */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
          capacity_utilization
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: '#555550', marginBottom: '20px' }}>
          Orders per time window
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={3}>
            <XAxis dataKey="name" tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="used" name="used" fill="#111111" radius={[4, 4, 0, 0]} />
            <Bar dataKey="free" name="free" fill="#d8d4ce" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
            {mockOrders.length} total
          </div>
        </div>
        {mockOrders.slice(0, 5).map((order, i) => (
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
              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#aaa8a4', width: '36px' }}>
                #{order.id}
              </span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: '14px', color: '#111111', fontWeight: '500' }}>
                {order.customer_name}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#666660' }}>
                {order.product}
              </span>
            </div>
            <span className={`badge ${order.status === 'pending' ? 'badge-accent' : 'badge-neutral'}`}>
              {order.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
