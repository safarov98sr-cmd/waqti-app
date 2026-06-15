import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthCtx = createContext({
  user: null, loading: true,
  signIn:  async () => ({ error: null }),
  signUp:  async () => ({ error: null }),
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn  = (email, password) =>
    supabase?.auth.signInWithPassword({ email, password })
    ?? Promise.resolve({ error: { message: 'Supabase не настроен' } })

  const signUp  = (email, password) =>
    supabase?.auth.signUp({ email, password })
    ?? Promise.resolve({ error: { message: 'Supabase не настроен' } })

  const signOut = () => supabase?.auth.signOut()

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}
