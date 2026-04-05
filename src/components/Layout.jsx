import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Flame, LayoutDashboard, LogOut, ChevronRight, Bell, Menu, X } from 'lucide-react'
import { useState } from 'react'
import ScheduleButton from './ScheduleButton'

// ─── Admin Layout ─────────────────────────────────────────────────────────────
export function AdminLayout({ children, title, breadcrumbs = [] }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
            <Flame size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Service Book</p>
            <p className="text-[11px] text-slate-400 leading-tight">Heizsysteme</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="section-title px-3 py-2 text-slate-500">Navigation</p>
        <NavItem
          to="/admin"
          icon={<LayoutDashboard size={16} />}
          label="Alle Kunden"
          active={location.pathname.startsWith('/admin')}
          onClick={() => setMobileOpen(false)}
        />
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-[11px] text-slate-400">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <LogOut size={15} />
          Abmelden
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 shrink-0 flex-col">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col z-50">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu size={18} />
            </button>
            {breadcrumbs.length > 0 ? (
              <nav className="flex items-center gap-1.5 text-sm text-slate-500 min-w-0">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5 min-w-0">
                    {i > 0 && <ChevronRight size={13} className="shrink-0 text-slate-300" />}
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-slate-900 transition-colors truncate">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-900 font-semibold truncate">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            ) : (
              title && <h1 className="text-base font-bold text-slate-900">{title}</h1>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-6">
          {breadcrumbs.length > 0 && title && (
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>
          )}
          {!breadcrumbs.length && title && (
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>

      <ScheduleButton />
    </div>
  )
}

// ─── Client Layout ────────────────────────────────────────────────────────────
export function ClientLayout({ children, title, breadcrumbs = [] }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow">
              <Flame size={15} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Service Book</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">Heizsysteme</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-medium text-slate-600">{profile?.full_name}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={13} className="text-slate-300" />}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-slate-900 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-900 font-semibold">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {title && <h1 className="text-xl font-bold text-slate-900 mb-5">{title}</h1>}
        {children}
      </main>

      <ScheduleButton />
    </div>
  )
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function NavItem({ to, icon, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-white/15 text-white'
          : 'text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
