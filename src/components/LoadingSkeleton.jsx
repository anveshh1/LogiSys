export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', gap: '16px', padding: '14px 18px',
            animation: `fadeIn 0.3s ease ${i * 0.05}s both`
          }}>
            <div className="skeleton" style={{ width: '60px', height: '14px' }} />
            <div className="skeleton" style={{ width: '120px', height: '14px' }} />
            <div className="skeleton" style={{ width: '80px', height: '14px' }} />
            <div className="skeleton" style={{ width: '60px', height: '14px' }} />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'cards') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card" style={{
            padding: '22px',
            display: 'flex', flexDirection: 'column', gap: '14px',
            animation: `fadeIn 0.3s ease ${i * 0.08}s both`
          }}>
            <div className="skeleton-cream" style={{ width: '70%', height: '14px' }} />
            <div className="skeleton-cream" style={{ width: '40%', height: '28px' }} />
            <div className="skeleton-cream" style={{ width: '55%', height: '12px' }} />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'stat') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '14px'
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card" style={{
            padding: '22px',
            display: 'flex', flexDirection: 'column', gap: '12px',
            animation: `fadeIn 0.3s ease ${i * 0.08}s both`
          }}>
            <div className="skeleton-cream" style={{ width: '60%', height: '10px' }} />
            <div className="skeleton-cream" style={{ width: '35%', height: '32px' }} />
            <div className="skeleton-cream" style={{ width: '50%', height: '12px' }} />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'profile') {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton" style={{ width: '140px', height: '16px' }} />
            <div className="skeleton" style={{ width: '200px', height: '12px' }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: '100%', height: '1px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '100%', height: '40px' }} />
          ))}
        </div>
      </div>
    )
  }

  // Default: page-level skeleton
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="skeleton" style={{ width: '200px', height: '28px' }} />
      <div style={{ display: 'flex', gap: '14px' }}>
        {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: '100px', borderRadius: 'var(--radius)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius)' }} />
    </div>
  )
}
