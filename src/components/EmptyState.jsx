export default function EmptyState({ icon = '○', title = 'Nothing here yet', description = '', action }) {
  return (
    <div className="fade-up" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: '1px solid var(--border-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        color: '#444',
        marginBottom: '18px',
      }}>
        {icon}
      </div>

      <h3 style={{
        fontFamily: 'var(--sans)',
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '6px',
      }}>
        {title}
      </h3>

      {description && (
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: '#666',
          maxWidth: '320px',
          lineHeight: '1.6',
        }}>
          {description}
        </p>
      )}

      {action && (
        <div style={{ marginTop: '20px' }}>
          {action}
        </div>
      )}
    </div>
  )
}
