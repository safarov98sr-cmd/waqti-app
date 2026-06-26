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

async function handleUpdate() {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations()
    for (const reg of regs) await reg.unregister()
  }
  window.location.reload(true)
}

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
  const [page,            setPage]            = useState('home')
  const [showAuth,        setShowAuth]        = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  const skipped   = typeof localStorage !== 'undefined' && localStorage.getItem(SKIP_KEY) === 'true'
  const needsAuth = !!supabase && !loading && !user && !skipped

  // Detect new SW version
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing
        sw?.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true)
          }
        })
      })
    })
  }, [])

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

      {/* Update banner */}
      {updateAvailable && (
        <div
          className="fixed left-1/2 -translate-x-1/2 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
          style={{
            bottom: 88,
            width: 'min(calc(100% - 32px), 398px)',
            background: 'linear-gradient(135deg,#10B981,#059669)',
            boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
            zIndex: 99998,
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
            </svg>
            <span className="text-white text-sm font-semibold">Доступно обновление!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUpdateAvailable(false)}
              className="text-white/60 text-xs px-2 py-1 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.15)' }}>
              Позже
            </button>
            <button
              onClick={handleUpdate}
              className="text-sm font-bold px-3 py-1.5 rounded-xl"
              style={{ background: 'white', color: '#059669' }}>
              Обновить
            </button>
          </div>
        </div>
      )}
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
