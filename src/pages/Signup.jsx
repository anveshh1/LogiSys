import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [accountType, setAccountType] = useState('customer') // 'customer' | 'business'
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    businessName: '', businessDescription: '', businessCategory: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signUp(
      form.email,
      form.password,
      form.name,
      accountType,                           // 'customer' or 'business'
      isBusiness ? form.businessName : ''    // business name only for business accounts
    )
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
  }

  const isBusiness = accountType === 'business'

  // Success screen
  if (success) return (
    <div className="dot-grid" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: '400px', padding: '0 20px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', color: '#00c853',
          }}>✓</div>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: '20px', fontWeight: '700', color: '#111111', marginBottom: '10px' }}>Check your email</h2>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#666660', lineHeight: '1.7' }}>
            Confirmation sent to<br /><span style={{ color: '#333330', fontWeight: '500' }}>{form.email}</span>
          </p>
          {isBusiness && (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', marginTop: '12px', lineHeight: '1.6' }}>
              Your business account will be reviewed and activated shortly.
            </p>
          )}
          <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ marginTop: '24px', fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            back to login
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="dot-grid" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: '460px', padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', justifyContent: 'center' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            border: '1.5px solid #ff3c3c', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: '500', color: '#ff3c3c'
          }}>LS</div>
          <span style={{ fontFamily: 'var(--sans)', fontSize: '16px', fontWeight: '700', color: '#f0f0f0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>LogiSys</span>
        </div>

        <div className="card" style={{ padding: '36px' }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '22px', fontWeight: '700', color: '#111111', marginBottom: '8px' }}>Create account</h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888880', marginBottom: '24px', letterSpacing: '0.02em' }}>
            Choose how you want to use the platform
          </p>

          {/* === ACCOUNT TYPE TOGGLE === */}
          <div style={{
            display: 'flex',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px',
            marginBottom: '28px',
            background: 'var(--bg-3)',
          }}>
            {[
              { key: 'customer', label: 'Customer', icon: '◉' },
              { key: 'business', label: 'Business Account', icon: '▣' },
            ].map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setAccountType(opt.key)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  fontSize: '13px',
                  fontWeight: accountType === opt.key ? '600' : '400',
                  background: accountType === opt.key ? '#111111' : 'transparent',
                  color: accountType === opt.key ? '#f5f2ee' : '#888880',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Common fields */}
            <div>
              <label className="label">full_name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" required className="input" />
            </div>
            <div>
              <label className="label">email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label className="label">password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required className="input" />
            </div>

            {/* Business-specific fields with animation */}
            <div style={{
              maxHeight: isBusiness ? '300px' : '0px',
              opacity: isBusiness ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '6px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#888880', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  business_details
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <div>
                <label className="label">business_name</label>
                <input type="text" value={form.businessName}
                  onChange={e => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Your Business Inc." className="input"
                  tabIndex={isBusiness ? 0 : -1}
                />
              </div>

              <div>
                <label className="label">description <span style={{ color: '#bbb', fontWeight: '400' }}>(optional)</span></label>
                <textarea
                  value={form.businessDescription}
                  onChange={e => setForm({ ...form, businessDescription: e.target.value })}
                  placeholder="Brief description of your business..."
                  rows={3}
                  className="input"
                  style={{ resize: 'vertical', minHeight: '70px', lineHeight: '1.5' }}
                  tabIndex={isBusiness ? 0 : -1}
                />
              </div>

              <div>
                <label className="label">category <span style={{ color: '#bbb', fontWeight: '400' }}>(optional)</span></label>
                <select
                  value={form.businessCategory}
                  onChange={e => setForm({ ...form, businessCategory: e.target.value })}
                  className="input"
                  tabIndex={isBusiness ? 0 : -1}
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                fontFamily: 'var(--mono)', fontSize: '12px', color: '#ff3c3c',
                padding: '12px 14px', border: '1px solid rgba(255,60,60,0.3)',
                borderRadius: 'var(--radius-sm)', background: 'rgba(255,60,60,0.06)',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '4px' }}>
              {loading
                ? <><span className="spinner" /> creating...</>
                : isBusiness
                  ? 'Create Business Account →'
                  : 'Create Account →'
              }
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: '#888880' }}>
            have an account? <Link to="/login" style={{ color: '#333330', textDecoration: 'none', fontWeight: '500' }}>sign in →</Link>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '10px', color: '#444', letterSpacing: '0.1em' }}>
          PRIORITY-BASED ORDER DISTRIBUTION SYSTEM
        </div>
      </div>
    </div>
  )
}
