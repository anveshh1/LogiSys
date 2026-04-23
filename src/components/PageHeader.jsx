export default function PageHeader({ title, subtitle, accent = false, children }) {
  return (
    <div className="fade-up" style={{
      borderBottom: '1px solid var(--border-dark)',
      paddingBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {accent && (
          <div style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: 'var(--accent)',
            flexShrink: 0,
          }} />
        )}
        <div>
          <h1 style={{
            fontFamily: 'var(--sans)',
            fontSize: '26px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              color: 'var(--text-dark-muted)',
              marginTop: '4px',
              letterSpacing: '0.02em',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {children}
        </div>
      )}
    </div>
  )
}
