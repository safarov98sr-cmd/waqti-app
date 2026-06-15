import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthCtx = createContext({
  user: null, loading: true,
  signInWithGoogle: async () => ({ error: null }),
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

  const signInWithGoogle = () =>
    supabase?.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://app.waqtiai.app' },
    }) ?? Promise.resolve({ error: { message: 'Supabase не настроен' } })

  const signOut = () => supabase?.auth.signOut()

  return (
    <AuthCtx.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}
