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

const QUOTES = [
  { text: 'Поистине, вместе с трудностью — облегчение.', source: 'Коран, 94:6' },
  { text: 'Аллах не возлагает на человека сверх его возможностей.', source: 'Коран, 2:286' },
  { text: 'Кто уповает на Аллаха, тому Он достаточен.', source: 'Коран, 65:3' },
  { text: 'Не теряй надежды на милость Аллаха — Он прощает все грехи.', source: 'Коран, 39:53' },
  { text: 'Терпеливым Аллах воздаёт без счёта.', source: 'Коран, 39:10' },
  { text: 'Поистине, Аллах с терпеливыми.', source: 'Коран, 2:153' },
  { text: 'Стремись к тому, что приносит тебе пользу, и не ленись.', source: 'Хадис (Муслим)' },
  { text: 'Лучший из людей — тот, кто приносит пользу другим.', source: 'Хадис (ат-Табарани)' },
  { text: 'Начинай каждое дело с именем Аллаха — и оно будет благословенным.', source: 'Хадис (Абу Дауд)' },
  { text: 'Намерение верующего лучше, чем его дело.', source: 'Хадис (ат-Табарани)' },
  { text: 'Кто встаёт на молитву Фаджр — тот под защитой Аллаха весь день.', source: 'Хадис (Муслим)' },
  { text: 'Два намаза, которые тяжелы для лицемеров: Фаджр и Иша. Если бы они знали их достоинство — пришли бы.', source: 'Хадис (аль-Бухари)' },
  { text: 'Дело, которое нравится Аллаху больше всего — то, которое делается постоянно, даже если оно мало.', source: 'Хадис (аль-Бухари, Муслим)' },
  { text: 'Не говори "завтра" — скажи "сейчас".', source: 'Мудрость предков' },
  { text: 'Время — как меч: если ты не разрежешь его, оно разрежет тебя.', source: 'Имам аш-Шафии' },
  { text: 'Пять вещей нельзя вернуть: прожитый день, сказанное слово, упущенное время, прошедшая молодость.', source: 'Имам аль-Газали' },
  { text: 'Продуктивность — это делать правильные вещи, а не делать много вещей.', source: 'Мудрость' },
  { text: 'Тот, кто знает себя, знает своего Господа.', source: 'Хадис (слабый, но известный)' },
  { text: 'Ищи знания от колыбели до могилы.', source: 'Хадис' },
  { text: 'Самое тяжёлое испытание — для самых стойких людей. Аллах даёт его тем, кого любит.', source: 'Хадис (ат-Тирмизи)' },
]

/* ── Coach tab with motivational quotes ── */
function CoachPlaceholder() {
  const { user, signOut } = useAuth()
  const [quote,    setQuote]    = useState(null)
  const [animKey,  setAnimKey]  = useState(0)

  const showQuote = () => {
    const pool    = quote ? QUOTES.filter((_, i) => QUOTES[i] !== quote) : QUOTES
    const next    = pool[Math.floor(Math.random() * pool.length)]
    setQuote(next)
    setAnimKey(k => k + 1)
  }

  return (
    <div className="min-h-full flex flex-col items-center px-5 pt-14 pb-28 page-enter"
      style={{ background: 'var(--bg-page)' }}>

      {/* Header */}
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.2)' }}>
        ✦
      </div>
      <h2 className="text-xl font-black mb-1 text-center" style={{ color: 'var(--text-h)' }}>ИИ-коуч</h2>
      <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
        Персональный помощник · <span style={{ color: '#10B981' }}>Q3 2026</span>
      </p>

      {/* Quote card */}
      {quote ? (
        <div key={animKey} className="w-full max-w-xs mb-5 page-enter"
          style={{
            background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.03))',
            border: '1.5px solid rgba(16,185,129,0.2)',
            borderRadius: '24px',
            padding: '20px',
          }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: '#10B981' }}>Мотивация дня</p>
          <p className="text-base font-semibold leading-relaxed mb-4"
            style={{ color: 'var(--text-h)' }}>
            «{quote.text}»
          </p>
          <p className="text-xs font-medium" style={{ color: 'var(--text-xmuted)' }}>
            — {quote.source}
          </p>
        </div>
      ) : (
        <div className="w-full max-w-xs mb-5 rounded-3xl flex flex-col items-center justify-center py-10"
          style={{ background: 'var(--bg-s1)', border: '1.5px dashed var(--card-border)' }}>
          <span className="text-3xl mb-2">🕌</span>
          <p className="text-sm font-medium" style={{ color: 'var(--text-xmuted)' }}>
            Нажми кнопку ниже
          </p>
        </div>
      )}

      {/* Motivate button */}
      <button
        onClick={showQuote}
        className="w-full max-w-xs py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 mb-3"
        style={{
          background: 'linear-gradient(135deg,#10B981,#059669)',
          color: 'white',
          boxShadow: '0 6px 24px rgba(16,185,129,0.35)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}>
        {quote ? '✨ Ещё мотивацию' : '✨ Мотивируй меня'}
      </button>

      {/* Account section */}
      <div className="w-full max-w-xs space-y-3 mt-4">
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
              style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.18)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
              Выйти из аккаунта
            </button>
          </>
        ) : (
          <button onClick={() => window.dispatchEvent(new CustomEvent('waqti:show-auth'))}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
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
