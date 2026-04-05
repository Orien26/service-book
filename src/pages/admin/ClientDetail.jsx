import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Plus, Wrench, CheckCircle, Clock, Copy, Check,
  MapPin, Phone, Mail, Send, ChevronRight, Building2,
  Cpu, AlertCircle, Archive
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from '../../components/Layout'
import EquipmentBadge from '../../components/EquipmentBadge'
import HelpTip from '../../components/HelpTip'

function StatusBadge({ status, isArchived }) {
  if (isArchived) return <span className="badge-slate"><Archive size={10} className="mr-0.5" />Archiviert</span>
  return status === 'completed'
    ? <span className="badge-green"><CheckCircle size={10} className="mr-0.5" />Abgeschlossen</span>
    : <span className="badge-yellow"><Clock size={10} className="mr-0.5" />In Bearbeitung</span>
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminClientDetail() {
  const { clientId } = useParams()
  const [client, setClient]       = useState(null)
  const [jobs, setJobs]           = useState([])
  const [locations, setLocations] = useState([])
  const [devices, setDevices]     = useState({}) // keyed by location_id
  const [loading, setLoading]     = useState(true)
  const [copied, setCopied]       = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: j }, { data: locs }] = await Promise.all([
        supabase.from('clients').select('*').eq('id', clientId).single(),
        supabase.from('jobs').select('*, devices(model,equipment_type,locations(address))').eq('client_id', clientId).order('service_date', { ascending: false }),
        supabase.from('locations').select('*').eq('client_id', clientId).order('is_primary', { ascending: false }),
      ])
      setClient(c)
      setJobs(j || [])
      setLocations(locs || [])

      // Load devices per location
      if (locs?.length) {
        const locIds = locs.map(l => l.id)
        const { data: devs } = await supabase
          .from('devices')
          .select('*')
          .in('location_id', locIds)
          .order('equipment_type')
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
  }, [clientId])

  function inviteUrl() {
    return `${window.location.origin}/register?client=${clientId}`
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function mailtoInviteLink() {
    const subject = encodeURIComponent(`Ihr Service Book Zugang – ${client.full_name}`)
    const body = encodeURIComponent(
      `Hallo ${client.full_name},\n\nIhre Heizungsserviceunterlagen sind jetzt online verfügbar.\n\nKlicken Sie auf den folgenden Link, um Ihr Konto zu erstellen und Ihre Servicehistorie, Fotos und Rechnungen einzusehen:\n\n${inviteUrl()}\n\nBei Fragen stehen wir Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüßen`
    )
    return `mailto:${client.email || ''}?subject=${subject}&body=${body}`
  }

  // Jobs NOT linked to a device (legacy or direct)
  const directJobs = jobs.filter(j => !j.device_id)

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  )
  if (!client) return <AdminLayout><p className="text-slate-500">Kunde nicht gefunden.</p></AdminLayout>

  return (
    <AdminLayout
      title={client.full_name}
      breadcrumbs={[{ label: 'Kunden', href: '/admin' }, { label: client.full_name }]}
    >
      <div className="space-y-6">

        {/* Client info card */}
        <div className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {client.equipment_type && <EquipmentBadge type={client.equipment_type} />}
                {client.city && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={12} /> {client.city}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building2 size={14} className="text-slate-400 shrink-0" />
                  {client.property_address}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-400" /> {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-400" /> {client.email}
                  </div>
                )}
                {client.property_notes && (
                  <p className="text-sm text-slate-500 mt-2 max-w-md bg-slate-50 px-3 py-2 rounded-lg">
                    {client.property_notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={copyInviteLink} className="btn-secondary btn-sm">
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copied ? 'Kopiert!' : 'Einladungslink kopieren'}
              </button>
              <a href={mailtoInviteLink()} className="btn-secondary btn-sm">
                <Send size={13} /> Einladung per E-Mail
              </a>
              <Link to={`/admin/clients/${clientId}/locations/new`} className="btn-secondary btn-sm">
                <Plus size={13} /> Standort hinzufügen
              </Link>
              <Link to={`/admin/clients/${clientId}/jobs/new`} className="btn-primary btn-sm">
                <Plus size={13} /> Neuer Auftrag
              </Link>
            </div>
          </div>

          {!client.profile_id && (
            <div className="mt-4">
              <HelpTip>
                Dieser Kunde hat noch kein Konto erstellt. Senden Sie ihm den Einladungslink, damit er sich registrieren und seine Servicehistorie einsehen kann. Der Link ist diesem Kunden eindeutig zugeordnet – nach der Registrierung wird das Konto automatisch verknüpft.
              </HelpTip>
            </div>
          )}
        </div>

        {/* Locations & Devices hierarchy */}
        {locations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Standorte & Geräte</h2>
              <Link to={`/admin/clients/${clientId}/locations/new`} className="btn-ghost btn-sm text-xs">
                <Plus size={13} /> Standort hinzufügen
              </Link>
            </div>

            <div className="space-y-3">
              {locations.map(loc => {
                const locDevices = devices[loc.id] || []
                const locJobs = jobs.filter(j => j.location_id === loc.id || locDevices.some(d => d.id === j.device_id))
                return (
                  <div key={loc.id} className="card overflow-hidden">
                    {/* Location header */}
                    <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MapPin size={15} className="text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{loc.address}</p>
                          {loc.city && <p className="text-xs text-slate-500">{loc.city}</p>}
                        </div>
                        {loc.is_primary && <span className="badge-blue btn-sm shrink-0">Hauptstandort</span>}
                      </div>
                      <Link
                        to={`/admin/locations/${loc.id}/devices/new`}
                        className="btn-secondary btn-sm shrink-0"
                      >
                        <Plus size={12} /> Gerät
                      </Link>
                    </div>

                    {/* Devices */}
                    {locDevices.length === 0 ? (
                      <div className="px-5 py-4 flex items-center gap-2 text-sm text-slate-400">
                        <Cpu size={15} />
                        <span>Noch keine Geräte hinzugefügt.</span>
                        <Link to={`/admin/locations/${loc.id}/devices/new`} className="text-blue-600 hover:underline text-xs font-medium">
                          Hinzufügen
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {locDevices.map(dev => {
                          const devJobs = jobs.filter(j => j.device_id === dev.id)
                          const lastJob = devJobs[0]
                          return (
                            <div key={dev.id} className="px-5 py-3.5">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                  <Cpu size={15} className="text-slate-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-slate-900 text-sm">
                                      {dev.manufacturer ? `${dev.manufacturer} ${dev.model || ''}`.trim() : (dev.model || 'Unbekanntes Gerät')}
                                    </p>
                                    <EquipmentBadge type={dev.equipment_type} />
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    {dev.serial_number && (
                                      <p className="text-xs text-slate-400">S/N: {dev.serial_number}</p>
                                    )}
                                    {lastJob && (
                                      <p className="text-xs text-slate-400">
                                        Letzter Service: {formatDate(lastJob.service_date)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Link
                                  to={`/admin/devices/${dev.id}/jobs/new`}
                                  className="btn-ghost btn-sm shrink-0"
                                  title="Neuer Auftrag für dieses Gerät"
                                >
                                  <Plus size={13} />
                                </Link>
                              </div>

                              {/* Device jobs */}
                              {devJobs.length > 0 && (
                                <div className="mt-3 ml-11 space-y-1">
                                  {devJobs.slice(0, 3).map(job => (
                                    <Link
                                      key={job.id}
                                      to={`/admin/jobs/${job.id}`}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group ${job.is_archived ? 'archived-row' : ''}`}
                                    >
                                      <span className={`text-sm text-slate-700 flex-1 truncate group-hover:text-blue-600 transition-colors ${job.is_archived ? 'archived-title' : ''}`}>
                                        {job.title}
                                      </span>
                                      <span className="text-xs text-slate-400 shrink-0">{formatDate(job.service_date)}</span>
                                      <StatusBadge status={job.status} isArchived={job.is_archived} />
                                    </Link>
                                  ))}
                                  {devJobs.length > 3 && (
                                    <p className="text-xs text-slate-400 px-3">+{devJobs.length - 3} weitere Aufträge</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {loc.notes && (
                      <div className="px-5 py-2.5 bg-slate-50/50 border-t border-slate-100">
                        <p className="text-xs text-slate-500">{loc.notes}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All service history */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">
              Servicehistorie
              <span className="ml-2 text-sm font-normal text-slate-400">({jobs.length} Einträge)</span>
            </h2>
            <Link to={`/admin/clients/${clientId}/jobs/new`} className="btn-primary btn-sm">
              <Plus size={13} /> Neuer Auftrag
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench size={22} className="text-slate-400" />
              </div>
              <p className="font-semibold text-slate-700 mb-1">Noch keine Serviceeinträge</p>
              <p className="text-sm text-slate-400 mb-5">Erstellen Sie den ersten Auftrag für diesen Kunden.</p>
              <Link to={`/admin/clients/${clientId}/jobs/new`} className="btn-primary inline-flex">
                <Plus size={15} /> Ersten Auftrag erstellen
              </Link>
            </div>
          ) : (
            <div className="card divide-y divide-slate-100">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/admin/jobs/${job.id}`}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors group ${job.is_archived ? 'archived-row' : ''}`}
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
                      {job.total_amount && (
                        <span className="text-xs text-slate-500 font-medium">
                          {job.currency} {Number(job.total_amount).toLocaleString('de-DE')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={job.status} isArchived={job.is_archived} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
