import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function NewJob() {
  // clientId comes from /admin/clients/:clientId/jobs/new
  // deviceId comes from /admin/devices/:deviceId/jobs/new
  const params = useParams()
  const clientId = params.clientId
  const deviceId = params.deviceId
  const { user } = useAuth()
  const navigate = useNavigate()

  const [client, setClient]     = useState(null)
  const [device, setDevice]     = useState(null)
  const [locations, setLocations] = useState([])
  const [devices, setDevices]   = useState([])
  const [resolvedClientId, setResolvedClientId] = useState(clientId || null)

  const [form, setForm] = useState({
    title: '',
    issue_description: '',
    work_done: '',
    parts_replaced: '',
    service_date: new Date().toISOString().split('T')[0],
    next_service_date: '',
    total_amount: '',
    currency: 'EUR',
    status: 'in_progress',
    location_id: '',
    device_id: deviceId || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      if (deviceId) {
        const { data: dev } = await supabase
          .from('devices')
          .select('*, locations(*, clients(*))')
          .eq('id', deviceId)
          .single()
        setDevice(dev)
        if (dev) {
          setClient(dev.locations?.clients)
          setResolvedClientId(dev.locations?.clients?.id)
          setForm(f => ({
            ...f,
            device_id: deviceId,
            location_id: dev.location_id,
          }))
        }
      } else if (clientId) {
        const [{ data: c }, { data: locs }] = await Promise.all([
          supabase.from('clients').select('*').eq('id', clientId).single(),
          supabase.from('locations').select('*').eq('client_id', clientId).order('is_primary', { ascending: false }),
        ])
        setClient(c)
        setLocations(locs || [])
      }
    }
    load()
  }, [clientId, deviceId])

  // Load devices for selected location
  useEffect(() => {
    if (!form.location_id) { setDevices([]); return }
    supabase.from('devices').select('*').eq('location_id', form.location_id)
      .then(({ data }) => setDevices(data || []))
  }, [form.location_id])

  function update(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...form,
      client_id: resolvedClientId,
      created_by: user.id,
      total_amount: form.total_amount ? Number(form.total_amount) : null,
      next_service_date: form.next_service_date || null,
      location_id: form.location_id || null,
      device_id: form.device_id || null,
    }

    const { data, error: err } = await supabase.from('jobs').insert(payload).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    navigate(`/admin/jobs/${data.id}`)
  }

  const backHref = resolvedClientId ? `/admin/clients/${resolvedClientId}` : '/admin'

  return (
    <AdminLayout
      title="New service job"
      breadcrumbs={[
        { label: 'Clients', href: '/admin' },
        { label: client?.full_name || '…', href: backHref },
        { label: 'New job' },
      ]}
    >
      <div className="card p-6 max-w-2xl">
        {/* Context bar */}
        {(client || device) && (
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-blue-700 font-bold text-sm">{client?.full_name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{client?.full_name}</p>
              {device && (
                <p className="text-xs text-slate-500">
                  {device.manufacturer} {device.model} · {device.locations?.address}
                </p>
              )}
            </div>
          </div>
        )}

        {error && <div className="form-error mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Job title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Annual heat pump service, Oil boiler repair"
              value={form.title}
              onChange={update('title')}
              required
            />
          </div>

          {/* Location & Device (only if coming from client, not device) */}
          {!deviceId && locations.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Location <span className="label-hint">(optional)</span></label>
                <select className="input" value={form.location_id} onChange={update('location_id')}>
                  <option value="">No specific location</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.address}{l.city ? `, ${l.city}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Device <span className="label-hint">(optional)</span></label>
                <select className="input" value={form.device_id} onChange={update('device_id')} disabled={!form.location_id}>
                  <option value="">No specific device</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.manufacturer ? `${d.manufacturer} ${d.model || ''}`.trim() : d.model || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="label">Issue description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What was reported or found broken? What were the symptoms?"
              value={form.issue_description}
              onChange={update('issue_description')}
            />
          </div>

          <div>
            <label className="label">Work done</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What was repaired, replaced, or serviced?"
              value={form.work_done}
              onChange={update('work_done')}
            />
          </div>

          <div>
            <label className="label">Parts / materials replaced</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="e.g. Heat exchanger, refrigerant top-up, filter, 2x pipe fittings…"
              value={form.parts_replaced}
              onChange={update('parts_replaced')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Service date *</label>
              <input type="date" className="input" value={form.service_date} onChange={update('service_date')} required />
            </div>
            <div>
              <label className="label">Next service date <span className="label-hint">(optional)</span></label>
              <input type="date" className="input" value={form.next_service_date} onChange={update('next_service_date')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="label">Invoice amount <span className="label-hint">(optional)</span></label>
              <input
                type="number"
                className="input"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.total_amount}
                onChange={update('total_amount')}
              />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={update('currency')}>
                <option value="EUR">EUR €</option>
                <option value="GBP">GBP £</option>
                <option value="USD">USD $</option>
                <option value="NGN">NGN ₦</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={update('status')}>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create job'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(backHref)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
