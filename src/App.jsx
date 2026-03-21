import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'

import AdminDashboard    from './pages/admin/Dashboard'
import AdminNewClient    from './pages/admin/NewClient'
import AdminClientDetail from './pages/admin/ClientDetail'
import AdminNewJob       from './pages/admin/NewJob'
import AdminJobDetail    from './pages/admin/JobDetail'
import AdminNewLocation  from './pages/admin/NewLocation'
import AdminNewDevice    from './pages/admin/NewDevice'

import ClientDashboard from './pages/client/Dashboard'
import ClientJobDetail from './pages/client/JobDetail'

export default function App() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={!user ? <Login />    : <Navigate to={profile?.role === 'admin' ? '/admin' : '/dashboard'} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

      {/* Admin */}
      <Route path="/admin"                                          element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/clients/new"                             element={<ProtectedRoute role="admin"><AdminNewClient /></ProtectedRoute>} />
      <Route path="/admin/clients/:clientId"                       element={<ProtectedRoute role="admin"><AdminClientDetail /></ProtectedRoute>} />
      <Route path="/admin/clients/:clientId/jobs/new"              element={<ProtectedRoute role="admin"><AdminNewJob /></ProtectedRoute>} />
      <Route path="/admin/clients/:clientId/locations/new"         element={<ProtectedRoute role="admin"><AdminNewLocation /></ProtectedRoute>} />
      <Route path="/admin/locations/:locationId/devices/new"       element={<ProtectedRoute role="admin"><AdminNewDevice /></ProtectedRoute>} />
      <Route path="/admin/devices/:deviceId/jobs/new"              element={<ProtectedRoute role="admin"><AdminNewJob /></ProtectedRoute>} />
      <Route path="/admin/jobs/:jobId"                             element={<ProtectedRoute role="admin"><AdminJobDetail /></ProtectedRoute>} />

      {/* Client */}
      <Route path="/dashboard"              element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/jobs/:jobId"  element={<ProtectedRoute role="client"><ClientJobDetail /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> :
        profile?.role === 'admin' ? <Navigate to="/admin" replace /> :
        <Navigate to="/dashboard" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
