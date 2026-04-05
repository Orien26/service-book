import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, MapPin, Phone, Mail, ChevronRight, Users, Flame } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from '../../components/Layout'
import EquipmentBadge from '../../components/EquipmentBadge'
import HelpTip from '../../components/HelpTip'

const TABS = [
  { key: 'all',        label: 'Alle Kunden' },
  { key: 'heat_pump',  label: 'Wärmepumpen' },
  { key: 'oil_boiler', label: 'Ölheizungen' },
  { key: 'gas_boiler', label: 'Gasheizungen' },
  { key: 'other',      label: 'Sonstiges' },
]

export default function AdminDashboard() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    supabase
      .from('clients')
      .select('*, jobs(count)')
      .order('full_name', { ascending: true })
      .then(({ data }) => { setClients(data || []); setLoading(false) })
  }, [])

  const cities = [...new Set(clients.map(c => c.city).filter(Boolean))].sort()

  const filtered = clients.filter((c) => {
    const matchTab  = activeTab === 'all' || c.equipment_type === activeTab
    const matchCity = !cityFilter || c.city === cityFilter
    const matchText = !search || [c.full_name, c.email, c.phone, c.property_address, c.city]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchTab && matchCity && matchText
  })

  // Stats
  const total     = clients.length
  const heatPumps  = clients.filter(c => c.equipment_type === 'heat_pump').length
  const oilBoilers = clients.filter(c => c.equipment_type === 'oil_boiler').length
  const gasBoilers = clients.filter(c => c.equipment_type === 'gas_boiler').length

  return (
    <AdminLayout title="Kunden">
      {total === 0 && (
        <div className="mb-5">
          <HelpTip>
            Willkommen! Klicken Sie auf <strong>Kunde hinzufügen</strong>, um Ihren ersten Kunden anzulegen. Anschließend können Sie Standorte, Geräte und Serviceaufträge erfassen. Sobald ein Auftrag erstellt wurde, senden Sie dem Kunden den Einladungslink, damit er seine Unterlagen online einsehen kann.
          </HelpTip>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard value={total}      label="Kunden gesamt"  color="blue"   />
        <StatCard value={heatPumps}  label="Wärmepumpen"    color="teal"   />
        <StatCard value={oilBoilers} label="Ölheizungen"    color="amber"  />
        <StatCard value={gasBoilers} label="Gasheizungen"   color="orange" />
      </div>

      {/* Filters bar */}
      <div className="card p-4 mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Suche nach Name, Stadt, Adresse, E-Mail, Telefon…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {cities.length > 0 && (
            <select
              className="input sm:w-48 shrink-0"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">Alle Städte</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          )}

          <Link to="/admin/clients/new" className="btn-primary shrink-0">
            <Plus size={16} /> Kunde hinzufügen
          </Link>
        </div>

        {/* Equipment type tabs */}
        <div className="flex gap-1 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className={`ml-1.5 ${activeTab === tab.key ? 'text-slate-300' : 'text-slate-400'}`}>
                  {clients.filter(c => c.equipment_type === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Client list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700 mb-1">
            {search || cityFilter || activeTab !== 'all' ? 'Keine Kunden entsprechen Ihren Filtern' : 'Noch keine Kunden'}
          </p>
          <p className="text-sm text-slate-400 mb-5">
            {search || cityFilter || activeTab !== 'all' ? 'Passen Sie Ihre Suche oder Filter an.' : 'Fügen Sie Ihren ersten Kunden hinzu, um zu beginnen.'}
          </p>
          {!search && !cityFilter && activeTab === 'all' && (
            <Link to="/admin/clients/new" className="btn-primary inline-flex">
              <Plus size={15} /> Ersten Kunden hinzufügen
            </Link>
          )}
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((client) => (
            <Link
              key={client.id}
              to={`/admin/clients/${client.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white font-bold text-sm">
                  {client.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900">{client.full_name}</p>
                  {client.equipment_type && <EquipmentBadge type={client.equipment_type} />}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  {client.city && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={11} /> {client.city}
                    </span>
                  )}
                  {client.phone && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone size={11} /> {client.phone}
                    </span>
                  )}
                  {client.email && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail size={11} /> {client.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="badge-slate">{client.jobs?.[0]?.count ?? 0} Aufträge</span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right mt-3">
          {filtered.length} von {clients.length} Kunden
        </p>
      )}
    </AdminLayout>
  )
}

function StatCard({ value, label, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    teal:   'bg-teal-50 text-teal-700',
    amber:  'bg-amber-50 text-amber-700',
    orange: 'bg-orange-50 text-orange-700',
  }
  return (
    <div className="card p-4">
      <p className={`text-2xl font-bold ${colors[color]?.split(' ')[1]}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
    </div>
  )
}
