import { mockOrders, mockSlots } from '../data/mockData'

// Fix: normalize slot format for matching
const grouped = mockSlots.map(slot => ({
  ...slot,
  orders: mockOrders.filter(o => {
    // Match "09:00 - 10:00" or "09:00–10:00" or "09:00 – 10:00"
    const normalized = o.slot.replace(/\s*[–-]\s*/g, ' - ')
    const slotKey = `${slot.slot_start} - ${slot.slot_end}`
    return normalized === slotKey
  }),
}))

const statusColor = (s) => s === 'allocated' ? '#111111' : s === 'pending' ? '#ff3c3c' : '#888880'

export default function AllocationMonitor() {
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ borderBottom: '1px solid #242424', paddingBottom: '20px' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: '700', color: '#f0f0f0' }}>Allocation Monitor</h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#555555', marginTop: '6px' }}>Orders grouped by assigned time slot</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {grouped.map(slot => {
          const pct = Math.round((slot.current_capacity / slot.max_capacity) * 100)
          const isFull = slot.current_capacity >= slot.max_capacity
          return (
            <div key={slot.id} style={{ border: `1px solid ${isFull ? 'rgba(255,60,60,0.25)' : '#d8d4ce'}`, borderRadius: '4px', overflow: 'hidden', background: '#f5f2ee' }}>
              {/* Slot header */}
              <div style={{ padding: '14px 20px', borderBottom: slot.orders.length > 0 ? '1px solid #d8d4ce' : 'none', background: '#edeae5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', color: '#111111', fontWeight: '500' }}>
                    {slot.slot_start} – {slot.slot_end}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#888880' }}>
                    {slot.orders.length} order{slot.orders.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Mini progress */}
                  <div style={{ width: '80px', height: '3px', background: '#d8d4ce', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isFull ? '#ff3c3c' : '#111111', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: isFull ? '#ff3c3c' : '#888880' }}>
                    {slot.current_capacity}/{slot.max_capacity}
                  </span>
                </div>
              </div>

              {/* Orders in this slot */}
              {slot.orders.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {slot.orders.map((order, i) => (
                      <tr key={order.id} style={{ borderBottom: i < slot.orders.length - 1 ? '1px solid #e8e4de' : 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#edeae5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 20px', width: '40px' }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#ff3c3c', border: '1px solid rgba(255,60,60,0.3)', padding: '2px 7px', borderRadius: '2px' }}>#{order.priority_rank}</span>
                        </td>
                        <td style={{ padding: '12px 20px', fontFamily: "'Syne', sans-serif", fontSize: '14px', color: '#111111', fontWeight: '500' }}>{order.customer_name}</td>
                        <td style={{ padding: '12px 20px', fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#555550' }}>{order.product}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor(order.status) }}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '18px 20px', fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#aaa8a4' }}>
                  no orders allocated to this slot
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
