import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

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
    } else if (!data && (error === null || error?.code === 'PGRST116')) {
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

  async function signUp(email, password, fullName, phone) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName, phone } : {},
      },
    })
    if (error) throw error
    return data
  }

  // Called explicitly after signUp when registering via invite link.
  // Uses a SECURITY DEFINER RPC to bypass RLS on the clients table.
  async function linkClient(clientToken) {
    const { error } = await supabase.rpc('link_client_to_profile', { client_id: clientToken })
    if (error) throw error

    // Sync client's name into profile so the header displays it correctly
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return

    const { data: clientData } = await supabase
      .from('clients')
      .select('full_name')
      .eq('id', clientToken)
      .single()

    if (clientData?.full_name) {
      const { data: updated } = await supabase
        .from('profiles')
        .update({ full_name: clientData.full_name })
        .eq('id', currentUser.id)
        .select()
        .single()
      if (updated) setProfile(updated)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const isAdmin = profile?.role === 'admin'
  const isClient = profile?.role === 'client'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isClient, signIn, signUp, linkClient, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
