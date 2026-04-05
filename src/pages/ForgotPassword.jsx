import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Mail, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow">
            <Flame size={18} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">Service Book</p>
            <p className="text-xs text-slate-500">Heizsysteme</p>
          </div>
        </div>

        {done ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={26} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">E-Mail überprüfen</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Wir haben einen Link zum Zurücksetzen des Passworts gesendet an <strong className="text-slate-700">{email}</strong>.
            </p>
            <Link to="/login" className="btn-primary mt-6 w-full justify-center">
              Zurück zur Anmeldung
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900">Passwort zurücksetzen</h1>
              <p className="text-sm text-slate-500 mt-1">Geben Sie Ihre E-Mail-Adresse ein, wir senden Ihnen einen Link.</p>
            </div>

            {error && <div className="form-error mb-5">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">E-Mail-Adresse</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Senden…
                  </span>
                ) : 'Link senden'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Zurück zur Anmeldung</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
