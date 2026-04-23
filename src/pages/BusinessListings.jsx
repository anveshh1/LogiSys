import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function BusinessListings() {
  const { user, profile } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', category: '', total_quantity: 0, available_quantity: 0 })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { if (user) fetchListings() }, [user])

  async function fetchListings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
    if (error) console.error('Fetch error:', error)
    setListings(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditingId(null)
    setForm({ name: '', description: '', category: '', total_quantity: 0, available_quantity: 0 })
    setShowForm(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      total_quantity: item.total_quantity || 0,
      available_quantity: item.available_quantity ?? item.total_quantity ?? 0,
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { showToast('Product name is required', 'error'); return }
    if (form.total_quantity < 0) { showToast('Quantity cannot be negative', 'error'); return }

    setSaving(true)

    if (editingId) {
      // UPDATE
      const { error } = await supabase
        .from('products')
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          total_quantity: form.total_quantity,
          available_quantity: form.available_quantity,
        })
        .eq('id', editingId)
        .eq('created_by', user.id) // security: only own products

      if (error) { console.error(error); showToast('Update failed', 'error') }
      else { showToast('Product updated', 'success'); setShowForm(false); fetchListings() }
    } else {
      // INSERT
      const { error } = await supabase
        .from('products')
        .insert({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          total_quantity: form.total_quantity,
          available_quantity: form.available_quantity,
          created_by: user.id,
          status: 'active',
        })

      if (error) { console.error(error); showToast('Failed to add product', 'error') }
      else { showToast('Product added!', 'success'); setShowForm(false); fetchListings() }
    }

    setSaving(false)
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('products').delete().eq('id', id).eq('created_by', user.id)
    if (!error) {
      setListings(listings.filter(l => l.id !== id))
      setConfirmDelete(null)
      showToast('Product deleted', 'success')
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const businessId = profile?.business_id || profile?.id?.slice(0, 8)

  // ── Form Modal ──
  const formModal = showForm && (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={() => setShowForm(false)}>
      <div className="card" style={{ padding: '28px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '18px' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '18px', fontWeight: '600', color: '#111' }}>
          {editingId ? 'Edit Product' : 'Add New Product'}
        </div>

        {[
          { label: 'PRODUCT NAME', key: 'name', type: 'text', placeholder: 'e.g. DDR5 32GB RAM' },
          { label: 'DESCRIPTION', key: 'description', type: 'text', placeholder: 'Brief description' },
          { label: 'CATEGORY', key: 'category', type: 'text', placeholder: 'e.g. RAM, Shoes, Tickets' },
        ].map(f => (
          <div key={f.key}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#888880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
              {f.label}
            </label>
            <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              className="input-dark" style={{ width: '100%', background: '#f5f2ee', border: '1px solid #d8d4ce', color: '#111' }} />
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#888880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
              TOTAL QUANTITY
            </label>
            <input type="number" min="0" value={form.total_quantity}
              onChange={e => {
                const val = Number(e.target.value)
                setForm({ ...form, total_quantity: val, available_quantity: editingId ? form.available_quantity : val })
              }}
              className="input-dark" style={{ width: '100%', background: '#f5f2ee', border: '1px solid #d8d4ce', color: '#111' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#888880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
              AVAILABLE
            </label>
            <input type="number" min="0" value={form.available_quantity}
              onChange={e => setForm({ ...form, available_quantity: Number(e.target.value) })}
              className="input-dark" style={{ width: '100%', background: '#f5f2ee', border: '1px solid #d8d4ce', color: '#111' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm"
            style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {saving ? 'SAVING...' : editingId ? 'UPDATE' : 'ADD PRODUCT'}
          </button>
          <button onClick={() => setShowForm(false)} className="btn btn-sm"
            style={{ fontFamily: 'var(--mono)', fontSize: '11px', border: '1px solid #d8d4ce', background: 'transparent', color: '#888', cursor: 'pointer' }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader title="My Business Listings" subtitle="Manage your product listings" accent>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {businessId && <span className="badge badge-accent">BIZ-{businessId}</span>}
          <button onClick={openAdd} className="btn btn-primary btn-sm"
            style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            + ADD PRODUCT
          </button>
        </div>
      </PageHeader>

      {loading && <LoadingSkeleton type="cards" count={6} />}

      {!loading && listings.length === 0 && (
        <EmptyState
          icon="▣"
          title="No listings yet"
          description="You haven't created any product listings. Add your first product to start receiving orders."
          action={<button onClick={openAdd} className="btn btn-outline btn-sm">+ Add Product</button>}
        />
      )}

      {!loading && listings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {listings.map((item, i) => (
            <div key={item.id} className="card" style={{
              padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px',
              animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '15px', fontWeight: '600', color: '#111' }}>{item.name}</div>
                  {item.description && (
                    <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#888880', marginTop: '4px', lineHeight: '1.5' }}>
                      {item.description}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '14px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: '300', color: item.available_quantity === 0 ? '#ff3c3c' : '#111', lineHeight: 1 }}>
                    {item.available_quantity ?? item.total_quantity ?? 0}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#aaa8a4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>stock</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-neutral">{item.category || 'Uncategorized'}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#aaa8a4' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(item)} className="btn btn-sm" style={{
                  flex: 1, fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '0.06em', border: '1px solid #d8d4ce', background: 'transparent',
                  color: '#555550', cursor: 'pointer', transition: 'all var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#f5f2ee'; e.currentTarget.style.borderColor = '#111' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555550'; e.currentTarget.style.borderColor = '#d8d4ce' }}>
                  edit
                </button>

                {confirmDelete === item.id ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-accent btn-sm" style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase' }}>
                      confirm
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="btn btn-sm" style={{ border: '1px solid #d8d4ce', background: 'transparent', color: '#888', fontFamily: 'var(--mono)', fontSize: '11px', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(item.id)} className="btn btn-danger btn-sm" style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {formModal}

      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px',
          borderRadius: 'var(--radius-sm)', fontFamily: 'var(--mono)', fontSize: '12px', zIndex: 2000,
          border: `1px solid ${toast.type === 'success' ? 'rgba(0,200,83,0.3)' : 'rgba(255,60,60,0.3)'}`,
          background: toast.type === 'success' ? 'rgba(0,200,83,0.08)' : 'rgba(255,60,60,0.08)',
          color: toast.type === 'success' ? '#00c853' : '#ff3c3c',
          animation: 'fadeUp 0.3s ease',
        }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
