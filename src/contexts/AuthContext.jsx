import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (data) {
      setProfile(data)
      setLoading(false)
      return
    }

    // No profile row yet (trigger may not have fired) — create one
    if (!data && (error === null || error?.code === 'PGRST116')) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: userId, role: 'client' })
        .select()
        .single()
      setProfile(created ?? null)
    } else {
      setProfile(null)
    }
    setLoading(false)
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, fullName, phone, clientToken) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    })
    if (error) throw error

    // If client signed up via invite link, link their profile to the client record
    if (clientToken && data.user) {
      await supabase
        .from('clients')
        .update({ profile_id: data.user.id })
        .eq('id', clientToken)
    }

    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const isAdmin = profile?.role === 'admin'
  const isClient = profile?.role === 'client'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isClient, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
