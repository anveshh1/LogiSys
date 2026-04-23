import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'

const userLinks = [
  { to: '/app/products', label: 'Products', icon: '◻' },
  { to: '/app/create-order', label: 'New Order', icon: '+' },
  { to: '/app/orders', label: 'My Orders', icon: '≡' },
  { to: '/app/profile', label: 'Profile', icon: '◉' },
]

const adminLinks = [
  { to: '/app/admin', label: 'Control', icon: '⬡' },
  { to: '/app/admin/overview', label: 'Product Overview', icon: '◈' },
  { to: '/app/admin/orders', label: 'All Orders', icon: '≡' },
  { to: '/app/admin/products', label: 'Listings', icon: '◻' },
  { to: '/app/admin/slots', label: 'Time Slots', icon: '◷' },
  { to: '/app/profile', label: 'Profile', icon: '◉' },
]

const businessLinks = [
  { to: '/app/dashboard', label: 'Overview', icon: '○' },
  { to: '/app/products', label: 'Products', icon: '◻' },
  { to: '/app/business-listings', label: 'My Listings', icon: '▣' },
  { to: '/app/create-order', label: 'New Order', icon: '+' },
  { to: '/app/orders', label: 'My Orders', icon: '≡' },
  { to: '/app/profile', label: 'Profile', icon: '◉' },
]

export default function Sidebar({ isAdmin, isBusiness, businessId, onSignOut, userEmail, userName }) {
  const [collapsed, setCollapsed] = useState(false)

  const links = isAdmin ? adminLinks : isBusiness ? businessLinks : userLinks

  return (
    <aside style={{
      width: collapsed ? '68px' : '240px',
      minHeight: '100vh',
      background: '#0d0d0d',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      flexShrink: 0,
    }}>

      {/* LOGO → LANDING PAGE */}
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#111'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            border: '1.5px solid #ff3c3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "var(--mono)",
            fontSize: '11px',
            fontWeight: '500',
            color: '#ff3c3c',
            flexShrink: 0,
          }}>
            LS
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#f0f0f0',
                fontFamily: 'var(--sans)',
                whiteSpace: 'nowrap',
              }}>
                LogiSys
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* NAV */}
      <nav style={{
        flex: 1,
        padding: '16px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>

        {!collapsed && (
          <div style={{
            fontSize: '10px',
            color: '#444',
            letterSpacing: '0.15em',
            padding: '6px 10px 12px',
            fontFamily: 'var(--mono)',
          }}>
            {isAdmin ? '// ADMIN' : isBusiness ? '// BUSINESS' : '// WORKSPACE'}
          </div>
        )}

        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/app/dashboard' || link.to === '/app/admin'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '11px 14px' : '10px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontFamily: 'var(--sans)',
              fontSize: '13px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#f5f2ee' : '#777',
              background: isActive ? '#1c1c1c' : 'transparent',
              borderLeft: isActive ? '2.5px solid #ff3c3c' : '2.5px solid transparent',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.color = '#ccc'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes('1c1c1c')) {
                e.currentTarget.style.color = '#777'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: '14px',
              flexShrink: 0,
              width: '20px',
              textAlign: 'center',
            }}>
              {link.icon}
            </span>

            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div style={{
        padding: '14px 10px',
        borderTop: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>

        {!collapsed && (
          <div style={{ padding: '6px 10px' }}>
            <div style={{
              fontSize: '13px',
              color: '#bbb',
              marginBottom: '3px',
              fontWeight: '500',
              fontFamily: 'var(--sans)',
            }}>
              {userName}
            </div>

            <div style={{
              fontSize: '11px',
              color: '#555',
              fontFamily: 'var(--mono)',
            }}>
              {userEmail}
            </div>

            {/* Business ID badge */}
            {businessId && (
              <div style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                fontFamily: 'var(--mono)',
                color: '#ff3c3c',
                border: '1px solid rgba(255,60,60,0.25)',
                background: 'rgba(255,60,60,0.06)',
                padding: '4px 8px',
                borderRadius: '4px',
                letterSpacing: '0.06em',
              }}>
                ● BIZ-{businessId}
              </div>
            )}
          </div>
        )}

        {/* SIGN OUT BUTTON */}
        <button
          onClick={onSignOut}
          className="btn btn-danger btn-sm"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '11px',
            letterSpacing: '0.08em',
            fontFamily: 'var(--mono)',
            textTransform: 'uppercase',
          }}
        >
          {collapsed ? '←' : 'SIGN OUT'}
        </button>

        {/* COLLAPSE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost btn-sm"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '11px',
            fontFamily: 'var(--mono)',
          }}
        >
          {collapsed ? '→' : '← collapse'}
        </button>

      </div>
    </aside>
  )
}