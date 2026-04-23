import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit mode state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', message }

  useEffect(() => { if (user) init() }, [user])

  async function init() {
    setLoading(true)
    await Promise.all([fetchProfile(), fetchOrders()])
    setLoading(false)
  }

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    // Fallback: use auth metadata for display, but NEVER fabricate a role
    const profileData = data || {
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      email: user.email || '',
      role: user.user_metadata?.role || null,  // preserve actual role from auth metadata
    }
    setProfile(profileData)
    setEditForm({ name: profileData.name || '', email: profileData.email || '' })
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select(`id, quantity, status, created_at, products!orders_product_id_fkey(name)`)
      .eq('user_id', user.id).order('created_at', { ascending: false })
    setOrders(data || [])
  }

  function startEdit() {
    setEditForm({ name: profile?.name || '', email: profile?.email || '' })
    setEditing(true)
  }

  function cancelEdit() {
    setEditForm({ name: profile?.name || '', email: profile?.email || '' })
    setEditing(false)
  }

  async function saveProfile() {
    setSaving(true)
    // UI-only save simulation — keeps backend untouched
    try {
      const { error } = await supabase.from('profiles')
        .update({ name: editForm.name })
        .eq('id', user.id)
      if (error) throw error
      setProfile({ ...profile, name: editForm.name })
      setEditing(false)
      showToast('success', 'Profile updated successfully')
    } catch {
      showToast('error', 'Failed to save changes')
    }
    setSaving(false)
  }

  function showToast(type, message) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const userRole = profile?.role || user?.user_metadata?.role || null
  const isBusiness = userRole === 'business'
  const isAdmin = userRole === 'admin'
  const accountType = isAdmin ? 'Admin' : isBusiness ? 'Business' : 'Customer'
  const businessId = profile?.business_id || profile?.id?.slice(0, 8)
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null

  if (loading) return <LoadingSkeleton type="profile" />

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '720px' }}>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '14px 22px', borderRadius: 'var(--radius)',
          fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: '1.4',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'fadeUp 0.3s ease',
          border: `1px solid ${toast.type === 'success' ? 'rgba(0,200,83,0.3)' : 'rgba(255,60,60,0.3)'}`,
          background: toast.type === 'success' ? '#111' : '#111',
          color: toast.type === 'success' ? '#00c853' : '#ff3c3c',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <span style={{ fontSize: '14px' }}>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}

      <PageHeader title="Profile" subtitle="Manage your account information" />

      {/* ===== PROFILE HEADER CARD ===== */}
      {profile && (
        <div className="card-dark" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Top section: Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Avatar */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff3c3c 0%, #ff6b6b 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: '700', color: '#fff',
              fontFamily: 'var(--sans)', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(255,60,60,0.25)',
            }}>
              {(profile.name || 'U')[0].toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#f0f0f0', fontFamily: 'var(--sans)', letterSpacing: '-0.01em' }}>
                {profile.name || 'Unknown User'}
              </div>
              <div style={{ fontSize: '13px', color: '#666', fontFamily: 'var(--mono)', marginTop: '4px' }}>
                {profile.email || user.email}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                <span className="badge badge-neutral">{accountType.toUpperCase()}</span>
                {isBusiness && <span className="badge badge-accent">BIZ-{businessId}</span>}
                {memberSince && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#555' }}>
                    Member since {memberSince}
                  </span>
                )}
              </div>
            </div>

            {/* Edit button (visible when NOT editing) */}
            {!editing && (
              <button onClick={startEdit} className="btn btn-outline btn-sm" style={{
                fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase',
                letterSpacing: '0.06em', alignSelf: 'flex-start', flexShrink: 0,
              }}>
                ✎ EDIT
              </button>
            )}
          </div>

          {/* Business ID section */}
          {isBusiness && (
            <div style={{
              padding: '14px 18px', borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255,60,60,0.2)', background: 'rgba(255,60,60,0.04)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ fontSize: '16px', color: '#ff3c3c' }}>●</span>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>
                  BUSINESS ID
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: '#ff3c3c', fontWeight: '500', letterSpacing: '0.04em' }}>
                  BIZ-{businessId}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== EDIT PROFILE CARD ===== */}
      <div className="card-dark" style={{
        overflow: 'hidden',
        maxHeight: editing ? '400px' : '0px',
        opacity: editing ? 1 : 0,
        padding: editing ? '28px' : '0 28px',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease, padding 0.3s ease',
        border: editing ? undefined : '1px solid transparent',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
          EDIT_PROFILE
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="label-dark">NAME</label>
            <input
              type="text"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              className="input-dark"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="label-dark">EMAIL</label>
            <input
              type="email"
              value={editForm.email}
              className="input-dark"
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
              title="Email cannot be changed"
            />
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#555', marginTop: '6px', letterSpacing: '0.04em' }}>
              Email cannot be modified
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={saveProfile}
              disabled={saving || editForm.name === profile?.name}
              className="btn btn-accent btn-sm"
              style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 20px' }}
            >
              {saving ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> SAVING...</> : '✓ SAVE CHANGES'}
            </button>
            <button
              onClick={cancelEdit}
              className="btn btn-ghost btn-sm"
              style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 20px' }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>

      {/* ===== QUICK STATS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Orders', value: orders.length, color: '#f0f0f0' },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#ff3c3c' },
          { label: 'Allocated', value: orders.filter(o => o.status === 'allocated').length, color: '#f0f0f0' },
          { label: 'Fulfilled', value: orders.filter(o => o.status === 'fulfilled').length, color: '#00c853' },
        ].map((stat, i) => (
          <div key={i} className="card-dark" style={{
            padding: '18px', textAlign: 'center',
            animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: '300', color: stat.color, lineHeight: 1 }}>
              {String(stat.value).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      {/* ===== RECENT ACTIVITY / ORDER HISTORY ===== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            your_activity
          </span>
          <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
        </div>

        {orders.length === 0 ? (
          <EmptyState icon="≡" title="No activity yet" description="Your recent orders and interactions will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orders.slice(0, 6).map((o, i) => (
              <div key={o.id} className="card-dark" style={{
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  {/* Order icon */}
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: o.status === 'pending' ? 'rgba(255,60,60,0.08)' : o.status === 'fulfilled' ? 'rgba(0,200,83,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${o.status === 'pending' ? 'rgba(255,60,60,0.2)' : o.status === 'fulfilled' ? 'rgba(0,200,83,0.2)' : '#222'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: '12px', flexShrink: 0,
                    color: o.status === 'pending' ? '#ff3c3c' : o.status === 'fulfilled' ? '#00c853' : '#888',
                  }}>
                    ≡
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: '500', color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.products?.name || 'Unknown Product'}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#555', marginTop: '2px' }}>
                      Qty: {o.quantity} · {new Date(o.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <span className={`badge ${o.status === 'pending' ? 'badge-accent' : o.status === 'fulfilled' ? 'badge-success' : 'badge-neutral'}`}>
                  {o.status}
                </span>
              </div>
            ))}

            {orders.length > 6 && (
              <div style={{ textAlign: 'center', padding: '8px', fontFamily: 'var(--mono)', fontSize: '11px', color: '#555' }}>
                + {orders.length - 6} more orders
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}