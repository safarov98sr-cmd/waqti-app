import { useState, useEffect } from 'react'
import { ThemeProvider }          from './ThemeContext'
import { AuthProvider, useAuth }  from './lib/AuthContext'
import { supabase }               from './lib/supabase'
import Auth     from './pages/Auth'
import Home     from './pages/Home'
import Tasks    from './pages/Tasks'
import Progress from './pages/Progress'
import Coach    from './pages/Coach'
import BottomNav from './components/BottomNav'

const SKIP_KEY = 'waqti-auth-skipped'

const PAGES = { home: Home, tasks: Tasks, progress: Progress, coach: Coach }

/* ── Splash / loading screen ── */
function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg,#060E1A 0%,#0A1628 55%,#064E3B 100%)' }}>
      <div className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl animate-pulse"
        style={{ background: 'rgba(16,185,129,0.18)', border: '1.5px solid rgba(16,185,129,0.35)' }}>
        ✦
      </div>
    </div>
  )
}

/* ── Main app shell ── */
function AppInner() {
  const { user, loading } = useAuth()
  const [page,     setPage]     = useState('home')
  const [showAuth, setShowAuth] = useState(false)

  const skipped   = typeof localStorage !== 'undefined' && localStorage.getItem(SKIP_KEY) === 'true'
  const needsAuth = !!supabase && !loading && !user && !skipped

  // Listen for upgrade-banner / coach button auth trigger
  useEffect(() => {
    const show = () => setShowAuth(true)
    window.addEventListener('waqti:show-auth', show)
    return () => window.removeEventListener('waqti:show-auth', show)
  }, [])

  // Hide auth screen once user logs in
  useEffect(() => { if (user) setShowAuth(false) }, [user])

  if (loading) return <Splash />

  if (needsAuth || showAuth) {
    return (
      <Auth onSkip={() => {
        localStorage.setItem(SKIP_KEY, 'true')
        setShowAuth(false)
      }} />
    )
  }

  const Page = PAGES[page] ?? Home

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--outer-bg)' }}>
      <div className="relative w-full max-w-[430px] h-screen overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scroll-hidden" style={{ background: 'var(--bg-page)' }}>
          <Page key={page} />
        </div>
        <BottomNav active={page} onChange={setPage} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  )
}
