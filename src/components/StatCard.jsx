export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card fade-up" style={{
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Accent top line */}
      {accent && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #ff3c3c, #ff6b6b)',
          borderRadius: '10px 10px 0 0',
        }} />
      )}

      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: '#888880',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>

      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '36px',
        fontWeight: '300',
        color: accent ? '#ff3c3c' : '#111111',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {String(value).padStart(2, '0')}
      </div>

      {sub && (
        <div style={{
          fontFamily: 'var(--sans)',
          fontSize: '13px',
          color: '#888880',
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}
