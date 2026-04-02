import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Flame, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { signUp, linkClient } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clientToken = searchParams.get('client')
  const isInvite = Boolean(clientToken)

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError(null)
    try {
      await signUp(
        form.email.trim(),
        form.password,
        isInvite ? null : form.fullName.trim(),
        isInvite ? null : form.phone.trim(),
      )
      if (clientToken) await linkClient(clientToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow">
            <Flame size={18} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">Service Book</p>
            <p className="text-xs text-slate-500">Heating Systems</p>
          </div>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900">
            {isInvite ? 'Access your service records' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isInvite
              ? 'Your records are ready. Enter your email and choose a password to get started.'
              : 'Set your password to access your service records'}
          </p>
        </div>

        {error && <div className="form-error mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isInvite && (
            <>
              <div>
                <label className="label">Full name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" className="input pl-10" placeholder="Your full name" value={form.fullName} onChange={update('fullName')} required />
                </div>
              </div>
              <div>
                <label className="label">Phone <span className="label-hint">(optional)</span></label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" className="input pl-10" placeholder="+353 87 000 0000" value={form.phone} onChange={update('phone')} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" className="input pl-10" placeholder="you@example.com" value={form.email} onChange={update('email')} required autoComplete="email" />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                className="input pl-10 pr-11"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={update('password')}
                required
                autoComplete="new-password"
              />
              <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Confirm password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" className="input pl-10" placeholder="Repeat your password" value={form.confirm} onChange={update('confirm')} required autoComplete="new-password" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isInvite ? 'Setting up…' : 'Creating account…'}
              </span>
            ) : (isInvite ? 'Access my records' : 'Create account')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
