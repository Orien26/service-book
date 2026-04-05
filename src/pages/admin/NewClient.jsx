import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Copy, Check, Link as LinkIcon } from 'lucide-react'
import { EQUIPMENT_OPTIONS } from '../../components/EquipmentBadge'

export default function NewClient() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    property_address: '', city: '', equipment_type: '', property_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const payload = { ...form, created_by: user.id }
    if (!payload.equipment_type) delete payload.equipment_type
    const { data, error: err } = await supabase.from('clients').insert(payload).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setCreated(data)
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/register?client=${created.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (created) {
    return (
      <AdminLayout
        title="Kunde hinzugefügt"
        breadcrumbs={[{ label: 'Kunden', href: '/admin' }, { label: 'Neuer Kunde' }]}
      >
        <div className="card p-8 max-w-lg animate-fade-in">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
            <Check size={26} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{created.full_name} hinzugefügt</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Senden Sie dem Kunden den untenstehenden Einladungslink. Er klickt darauf, legt sein Passwort fest und kann seine Servicehistorie einsehen.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 mb-5">
            <LinkIcon size={15} className="text-slate-400 shrink-0" />
            <code className="flex-1 text-xs text-slate-700 truncate">
              {window.location.origin}/register?client={created.id}
            </code>
            <button onClick={copyLink} className="btn-secondary btn-sm shrink-0">
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate(`/admin/clients/${created.id}`)} className="btn-primary">
              Kunde anzeigen
            </button>
            <button
              onClick={() => { setCreated(null); setForm({ full_name: '', email: '', phone: '', property_address: '', city: '', equipment_type: '', property_notes: '' }) }}
              className="btn-secondary"
            >
              Weiteren hinzufügen
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Neuen Kunden hinzufügen"
      breadcrumbs={[{ label: 'Kunden', href: '/admin' }, { label: 'Neuer Kunde' }]}
    >
      <div className="card p-6 max-w-xl">
        {error && <div className="form-error mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="label">Vollständiger Name *</label>
            <input type="text" className="input" placeholder="z.B. Max Mustermann" value={form.full_name} onChange={update('full_name')} required />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">E-Mail</label>
              <input type="email" className="input" placeholder="kunde@email.de" value={form.email} onChange={update('email')} />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input type="tel" className="input" placeholder="+49 170 000 0000" value={form.phone} onChange={update('phone')} />
            </div>
          </div>

          {/* Primary address */}
          <div>
            <label className="label">Hauptadresse *</label>
            <input type="text" className="input" placeholder="Musterstraße 12, Berlin" value={form.property_address} onChange={update('property_address')} required />
            <p className="text-xs text-slate-400 mt-1.5">Sie können nach der Erstellung weitere Standorte hinzufügen.</p>
          </div>

          {/* City + Equipment type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stadt</label>
              <input type="text" className="input" placeholder="Berlin" value={form.city} onChange={update('city')} />
            </div>
            <div>
              <label className="label">Hauptanlage <span className="label-hint">(optional)</span></label>
              <select className="input" value={form.equipment_type} onChange={update('equipment_type')}>
                <option value="">Typ auswählen…</option>
                {EQUIPMENT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Anmerkungen <span className="label-hint">(optional)</span></label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Zugangsinformationen, Codes, besondere Hinweise…"
              value={form.property_notes}
              onChange={update('property_notes')}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Speichern…' : 'Kunden speichern'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin')}>
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
