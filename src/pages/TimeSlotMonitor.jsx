import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'

function getStatus(slot) {
  const pct = slot.current_capacity / slot.max_capacity
  if (pct >= 1) return 'full'
  if (pct >= 0.7) return 'critical'
  return 'open'
}

export default function TimeSlotMonitor() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSlots() }, [])

  async function fetchSlots() {
    setLoading(true)
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('slot_start', { ascending: true })

    if (error) console.error('Fetch slots error:', error)
    else setSlots(data || [])
    setLoading(false)
  }

  if (loading) return <LoadingSkeleton type="cards" count={5} />

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <PageHeader title="Time Slots" subtitle="Monitor capacity utilization across time windows" />

      {/* Slot cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {slots.map((slot, i) => {
          const status = getStatus(slot)
          const pct = Math.round((slot.current_capacity / slot.max_capacity) * 100)
          const remaining = slot.max_capacity - slot.current_capacity
          const accentColor = status === 'full' ? '#ff3c3c' : status === 'critical' ? '#e08000' : '#111111'
          const borderColor = status === 'full' ? 'rgba(255,60,60,0.3)' : '#d8d4ce'

          return (
            <div key={slot.id} className="card" style={{
              padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px',
              borderColor, animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: '#111', letterSpacing: '0.04em', fontWeight: '500' }}>
                  {slot.slot_start?.slice(0,5)}–{slot.slot_end?.slice(0,5)}
                </span>
                <span className="badge" style={{
                  color: accentColor, borderColor: `${accentColor}44`,
                }}>{status}</span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '4px', background: '#d8d4ce', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: accentColor, transition: 'width 0.5s ease', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[['used', slot.current_capacity, '#111'], ['max', slot.max_capacity, '#888880'], ['left', remaining, accentColor]].map(([label, val, color]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: '300', color, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#888880', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #d8d4ce', background: 'var(--bg-3)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', letterSpacing: '0.15em', textTransform: 'uppercase' }}>slot_summary</div>
        </div>
        <table className="table-clean">
          <thead>
            <tr>
              {['window', 'max', 'used', 'remaining', '%', 'status'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => {
              const status = getStatus(slot)
              const pct = Math.round((slot.current_capacity / slot.max_capacity) * 100)
              const accentColor = status === 'full' ? '#ff3c3c' : status === 'critical' ? '#e08000' : '#111'
              return (
                <tr key={slot.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: '500', color: '#111' }}>{slot.slot_start?.slice(0,5)}–{slot.slot_end?.slice(0,5)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: '#888880' }}>{slot.max_capacity}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: '#555550' }}>{slot.current_capacity}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: accentColor, fontWeight: '500' }}>{slot.max_capacity - slot.current_capacity}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: '#888880' }}>{pct}%</td>
                  <td><span className="badge" style={{ color: accentColor, borderColor: `${accentColor}44` }}>{status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
