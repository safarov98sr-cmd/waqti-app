import { useState, useEffect } from 'react'
import { ThemeProvider }          from './ThemeContext'
import { AuthProvider, useAuth }  from './lib/AuthContext'
import { supabase }               from './lib/supabase'
import Auth     from './pages/Auth'
import Home     from './pages/Home'
import Tasks    from './pages/Tasks'
import Progress from './pages/Progress'
import BottomNav from './components/BottomNav'

const SKIP_KEY = 'waqti-auth-skipped'

/* ── Coach placeholder (also shows account info) ── */
function CoachPlaceholder() {
  const { user, signOut } = useAuth()
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 text-center pb-28"
      style={{ background: 'var(--bg-page)' }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.2)' }}>
        ✦
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-h)' }}>ИИ-коуч</h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Персональный помощник скоро появится здесь. Он будет понимать твой ритм жизни и помогать расти.
      </p>
      <span className="mt-4 text-xs font-bold px-4 py-2 rounded-full"
        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
        Скоро · Q3 2026
      </span>

      {/* Account section */}
      <div className="mt-10 w-full max-w-xs space-y-3">
        {user ? (
          <>
            <div className="rounded-2xl px-4 py-3 text-left"
              style={{ background: 'var(--bg-s1)', border: '1px solid var(--card-border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                style={{ color: 'var(--text-xmuted)' }}>Аккаунт</p>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-h)' }}>
                {user.email}
              </p>
            </div>
            <button onClick={signOut}
              className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.18)' }}>
              Выйти из аккаунта
            </button>
          </>
        ) : (
          <button onClick={() => window.dispatchEvent(new CustomEvent('waqti:show-auth'))}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
            Войти / Зарегистрироваться
          </button>
        )}
      </div>
    </div>
  )
}

const PAGES = { home: Home, tasks: Tasks, progress: Progress, coach: CoachPlaceholder }

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
