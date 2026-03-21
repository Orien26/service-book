import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Cpu } from 'lucide-react'
import { EQUIPMENT_OPTIONS } from '../../components/EquipmentBadge'

export default function NewDevice() {
  const { locationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [location, setLocation] = useState(null)
  const [form, setForm] = useState({
    equipment_type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    installed_date: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('locations').select('*, clients(id,full_name)').eq('id', locationId).single()
      .then(({ data }) => setLocation(data))
  }, [locationId])

  function update(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const payload = { ...form, location_id: locationId, created_by: user.id }
    if (!payload.installed_date) delete payload.installed_date
    const { error: err } = await supabase.from('devices').insert(payload)
    if (err) { setError(err.message); setLoading(false); return }
    navigate(`/admin/clients/${location?.clients?.id}`)
  }

  return (
    <AdminLayout
      title="Add device"
      breadcrumbs={[
        { label: 'Clients', href: '/admin' },
        { label: location?.clients?.full_name || '…', href: `/admin/clients/${location?.clients?.id}` },
        { label: 'Add device' },
      ]}
    >
      <div className="card p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Cpu size={18} className="text-slate-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">New device</p>
            <p className="text-sm text-slate-500">{location?.address}</p>
          </div>
        </div>

        {error && <div className="form-error mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Equipment type *</label>
            <select className="input" value={form.equipment_type} onChange={update('equipment_type')} required>
              <option value="">Select type…</option>
              {EQUIPMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Manufacturer</label>
              <input type="text" className="input" placeholder="e.g. LG, Viessmann, Worcester" value={form.manufacturer} onChange={update('manufacturer')} />
            </div>
            <div>
              <label className="label">Model</label>
              <input type="text" className="input" placeholder="e.g. Therma V R32" value={form.model} onChange={update('model')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Serial number <span className="label-hint">(optional)</span></label>
              <input type="text" className="input" placeholder="S/N…" value={form.serial_number} onChange={update('serial_number')} />
            </div>
            <div>
              <label className="label">Installed date <span className="label-hint">(optional)</span></label>
              <input type="date" className="input" value={form.installed_date} onChange={update('installed_date')} />
            </div>
          </div>

          <div>
            <label className="label">Notes <span className="label-hint">(optional)</span></label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Location in building, known issues, access requirements…"
              value={form.notes}
              onChange={update('notes')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save device'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(`/admin/clients/${location?.clients?.id}`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
