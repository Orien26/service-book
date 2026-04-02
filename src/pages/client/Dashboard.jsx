import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, CheckCircle, Clock, MapPin, Cpu, Archive, ChevronRight, Edit2, Save, X, Phone, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ClientLayout } from '../../components/Layout'
import EquipmentBadge from '../../components/EquipmentBadge'
import HelpTip from '../../components/HelpTip'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [client, setClient]     = useState(null)
  const [jobs, setJobs]         = useState([])
  const [locations, setLocations] = useState([])
  const [devices, setDevices]   = useState({})
  const [loading, setLoading]   = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase
        .from('clients')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (!c) { setLoading(false); return }
      setClient(c)

      const [{ data: j }, { data: locs }] = await Promise.all([
        supabase.from('jobs').select('*, devices(model, equipment_type, manufacturer)').eq('client_id', c.id).order('service_date', { ascending: false }),
        supabase.from('locations').select('*').eq('client_id', c.id).order('is_primary', { ascending: false }),
      ])

      setJobs(j || [])
      setLocations(locs || [])

      if (locs?.length) {
        const { data: devs } = await supabase
          .from('devices')
          .select('*')
          .in('location_id', locs.map(l => l.id))
        const byLoc = {}
        for (const d of devs || []) {
          if (!byLoc[d.location_id]) byLoc[d.location_id] = []
          byLoc[d.location_id].push(d)
        }
        setDevices(byLoc)
      }

      setLoading(false)
    }
    load()
  }, [user.id])

  async function saveProfile() {
    setSaving(true)
    const { data } = await supabase
      .from('clients')
      .update({ full_name: editForm.full_name, phone: editForm.phone })
      .eq('id', client.id)
      .select()
      .single()
    if (data) {
      setClient(data)
      await supabase.from('profiles').update({ full_name: data.full_name }).eq('id', user.id)
    }
    setSaving(false)
    setEditing(false)
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </ClientLayout>
    )
  }

  if (!client) {
    return (
      <ClientLayout title="Your service records">
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench size={22} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-900 mb-1">Account not linked</p>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Contact your service provider — they'll send you an invite link to connect your account to your property records.
          </p>
        </div>
      </ClientLayout>
    )
  }

  const activeJobs   = jobs.filter(j => !j.is_archived)
  const archivedJobs = jobs.filter(j => j.is_archived)
  const visibleJobs  = showArchived ? jobs : activeJobs

  return (
    <ClientLayout title="Your service records">

      <div className="mb-5">
        <HelpTip>
          Here you can see all your heating service records. Click on any job to view details, photos, invoices, and messages from your technician. Use the <strong>Schedule Service</strong> button to book your next appointment.
        </HelpTip>
      </div>

      {/* Property info */}
      <div className="card p-4 mb-5">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveProfile} disabled={saving} className="btn-primary btn-sm">
                <Save size={13} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary btn-sm">
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900">{client.full_name}</p>
              {client.phone && <p className="text-sm text-slate-500">{client.phone}</p>}
              <p className="text-sm text-slate-500 truncate">{client.property_address}</p>
              {client.city && <p className="text-xs text-slate-400 mt-0.5">{client.city}</p>}
              {client.equipment_type && <div className="mt-2"><EquipmentBadge type={client.equipment_type} /></div>}
            </div>
            <button
              onClick={() => { setEditForm({ full_name: client.full_name || '', phone: client.phone || '' }); setEditing(true) }}
              className="btn-ghost btn-sm shrink-0"
            >
              <Edit2 size={13} /> Edit
            </button>
          </div>
        )}
      </div>

      {/* Locations & Devices (if set up) */}
      {locations.length > 0 && (
        <div className="mb-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">Your properties</h2>
          {locations.map(loc => {
            const locDevices = devices[loc.id] || []
            return (
              <div key={loc.id} className="card overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{loc.address}</p>
                    {loc.city && <p className="text-xs text-slate-400">{loc.city}</p>}
                  </div>
                </div>
                {locDevices.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                    <Cpu size={14} /> No equipment records yet
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {locDevices.map(dev => (
                      <div key={dev.id} className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <Cpu size={14} className="text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {dev.manufacturer ? `${dev.manufacturer} ${dev.model || ''}`.trim() : (dev.model || 'Equipment')}
                          </p>
                          <EquipmentBadge type={dev.equipment_type} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Service history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">
            Service history
          </h2>
          {archivedJobs.length > 0 && (
            <button
              onClick={() => setShowArchived(s => !s)}
              className="btn-ghost btn-sm text-xs"
            >
              <Archive size={13} />
              {showArchived ? 'Hide archived' : `Show archived (${archivedJobs.length})`}
            </button>
          )}
        </div>

        {visibleJobs.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench size={20} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No service records yet. Your service provider will add jobs here.</p>
          </div>
        ) : (
          <div className="card divide-y divide-slate-100">
            {visibleJobs.map((job) => (
              <Link
                key={job.id}
                to={`/dashboard/jobs/${job.id}`}
                className={`flex items-start gap-3.5 px-4 py-4 hover:bg-slate-50/80 transition-colors group ${job.is_archived ? 'archived-row' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Wrench size={15} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors ${job.is_archived ? 'archived-title' : ''}`}>
                    {job.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-400">{formatDate(job.service_date)}</span>
                    {job.devices?.equipment_type && (
                      <EquipmentBadge type={job.devices.equipment_type} />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {job.is_archived ? (
                    <span className="badge-slate"><Archive size={10} /> Archived</span>
                  ) : job.status === 'completed' ? (
                    <span className="badge-green"><CheckCircle size={10} /> Done</span>
                  ) : (
                    <span className="badge-yellow"><Clock size={10} /> In progress</span>
                  )}
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  )
}
