import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signIn, isDemoMode }  = useAuth()
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) { setError(error.message); setLoading(false) }
    else navigate("/app/dashboard")
  }

  function fillDemo(role) {
    if (role === 'admin') { setEmail('admin@logisys.dev'); setPassword('admin123') }
    else                  { setEmail('user@logisys.dev');  setPassword('user123') }
    setError('')
  }

  return (
    <div className="dot-grid" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: '420px', padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', justifyContent: 'center' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            border: '1.5px solid #ff3c3c', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: '500', color: '#ff3c3c'
          }}>LS</div>
          <span style={{ fontFamily: 'var(--sans)', fontSize: '16px', fontWeight: '700', color: '#f0f0f0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>LogiSys</span>
        </div>

        {/* Demo mode banner */}
        {isDemoMode && (
          <div style={{ marginBottom: '16px', border: '1px solid rgba(255,60,60,0.25)', borderRadius: 'var(--radius)', padding: '16px', background: 'rgba(255,60,60,0.04)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#ff3c3c', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
              demo_mode — no supabase configured
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => fillDemo('user')} className="btn btn-cream btn-sm" style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ↙ use as user
              </button>
              <button onClick={() => fillDemo('admin')} className="btn btn-danger btn-sm" style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ↙ use as admin
              </button>
            </div>
          </div>
        )}

        {/* Login card */}
        <div className="card" style={{ padding: '36px' }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '22px', fontWeight: '700', color: '#111111', marginBottom: '28px' }}>Welcome back</h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label">email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label className="label">password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="off" placeholder="••••••••" required className="input" />
            </div>

            {error && (
              <div style={{
                fontFamily: 'var(--mono)', fontSize: '12px', color: '#ff3c3c',
                padding: '12px 14px', border: '1px solid rgba(255,60,60,0.3)',
                borderRadius: 'var(--radius-sm)', background: 'rgba(255,60,60,0.06)',
                lineHeight: '1.5',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '4px' }}>
              {loading ? <><span className="spinner" /> signing in...</> : 'Sign in →'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: '#888880' }}>
            no account? <Link to="/signup" style={{ color: '#333330', textDecoration: 'none', fontWeight: '500' }}>register →</Link>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '10px', color: '#444', letterSpacing: '0.1em' }}>
          PRIORITY-BASED ORDER DISTRIBUTION SYSTEM
        </div>
      </div>
    </div>
  )
}
