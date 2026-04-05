import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { MapPin } from 'lucide-react'

export default function NewLocation() {
  const { clientId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [form, setForm] = useState({ address: '', city: '', is_primary: false, notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('clients').select('full_name').eq('id', clientId).single()
      .then(({ data }) => setClient(data))
  }, [clientId])

  function update(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.from('locations').insert({
      ...form,
      client_id: clientId,
      created_by: user.id,
    })
    if (err) { setError(err.message); setLoading(false); return }
    navigate(`/admin/clients/${clientId}`)
  }

  return (
    <AdminLayout
      title="Standort hinzufügen"
      breadcrumbs={[
        { label: 'Kunden', href: '/admin' },
        { label: client?.full_name || '…', href: `/admin/clients/${clientId}` },
        { label: 'Standort hinzufügen' },
      ]}
    >
      <div className="card p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <MapPin size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Neuer Standort</p>
            <p className="text-sm text-slate-500">{client?.full_name}</p>
          </div>
        </div>

        {error && <div className="form-error mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Adresse *</label>
            <input type="text" className="input" placeholder="Musterstraße 15, Berlin" value={form.address} onChange={update('address')} required />
          </div>

          <div>
            <label className="label">Stadt</label>
            <input type="text" className="input" placeholder="Berlin" value={form.city} onChange={update('city')} />
          </div>

          <div>
            <label className="label">Anmerkungen <span className="label-hint">(optional)</span></label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Zugangsinformationen, Code, Lage im Gebäude…"
              value={form.notes}
              onChange={update('notes')}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={form.is_primary}
              onChange={update('is_primary')}
            />
            <div>
              <span className="text-sm font-semibold text-slate-700">Als Hauptadresse markieren</span>
              <p className="text-xs text-slate-400">Wird zuerst im Kundenprofil angezeigt</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Speichern…' : 'Standort speichern'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(`/admin/clients/${clientId}`)}>
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
