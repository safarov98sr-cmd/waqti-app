import { useState, useEffect, useRef } from 'react'
import { useTheme }            from '../ThemeContext'
import { useAuth }             from '../lib/AuthContext'
import { usePrayerTimes }      from '../hooks/usePrayerTimes'
import { usePrayerLog }        from '../hooks/usePrayerLog'
import IslamicPattern          from '../components/IslamicPattern'

const WEEKDAYS = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
const MONTHS   = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']

function greeting() {
  const h = new Date().getHours()
  if (h < 5)  return { text: 'Доброй ночи',  icon: '🌙' }
  if (h < 12) return { text: 'Доброе утро',   icon: '☀️' }
  if (h < 17) return { text: 'Добрый день',   icon: '🌤️' }
  if (h < 21) return { text: 'Добрый вечер',  icon: '🌅' }
  return              { text: 'Доброй ночи',  icon: '⭐' }
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

/* ── Sun / Moon toggle ── */
function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all active:scale-90"
      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

/* ── Account button + dropdown menu ── */
function AccountDropdown() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const [open,    setOpen]    = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open])

  const handleSignIn = async () => {
    setSigningIn(true)
    await signInWithGoogle()
    setSigningIn(false)
    setOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
  }

  // Calculate dropdown position from button rect
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    setOpen(o => !o)
  }

  return (
    <>
      {/* Circle button */}
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label="Аккаунт"
        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
        style={{
          background: open ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {user ? (
          <span className="text-white text-sm font-black leading-none">
            {(user.email?.[0] ?? '?').toUpperCase()}
          </span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        )}
      </button>

      {/* Dropdown — fixed so it's not clipped by overflow:hidden parents */}
      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: pos.top,
            right: pos.right,
            zIndex: 9999,
            width: 220,
            borderRadius: 20,
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
            padding: '12px',
            backdropFilter: 'blur(20px)',
          }}
        >
          {user ? (
            <>
              {/* Email row */}
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-black"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                  {(user.email?.[0] ?? '?').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-h)' }}>
                    {user.email}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-xmuted)' }}>Аккаунт</p>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--card-border)', margin: '0 4px 8px' }} />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{
                  color: '#EF4444',
                  background: 'rgba(239,68,68,0.06)',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Выйти
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold px-2 mb-3" style={{ color: 'var(--text-muted)' }}>
                Войди чтобы синхронизировать данные
              </p>
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg,#10B981,#059669)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {signingIn
                  ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <GoogleIcon />}
                {signingIn ? 'Перенаправление...' : 'Войти через Google'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}

/* ── PWA install pill (mobile only) ── */
function InstallButton() {
  const [prompt,     setPrompt]     = useState(null)
  const [showIOSTip, setShowIOSTip] = useState(false)

  useEffect(() => {
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent)
    if (!isMobile) return

    // Android / Chrome: native install prompt
    const handler = (e) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari: no beforeinstallprompt — show manual tip instead
    const isIOS        = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    if (isIOS && !isStandalone) setShowIOSTip(true)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const pillCls = 'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95'
  const pillStyle = {
    background: 'rgba(16,185,129,0.25)',
    color: '#10B981',
    border: '1px solid rgba(16,185,129,0.4)',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
  }

  if (prompt) {
    const install = async () => {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') setPrompt(null)
    }
    return (
      <button onClick={install} className={pillCls} style={pillStyle}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12M8 11l4 4 4-4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
        </svg>
        Установить
      </button>
    )
  }

  if (showIOSTip) {
    return (
      <button
        onClick={() => alert('Чтобы установить Waqti:\nНажми «Поделиться» → «Добавить на экран «Домой»»')}
        className={pillCls}
        style={pillStyle}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-3M15 3h6m0 0v6m0-6L10 14"/>
        </svg>
        На экран
      </button>
    )
  }

  return null
}

/* ── SVG ring countdown ── */
function PrayerRing({ pct, icon }) {
  const R = 44, CX = 52, CY = 52
  const circ = 2 * Math.PI * R
  const offset = circ * (1 - pct)
  return (
    <div className="relative w-[104px] h-[104px] flex-shrink-0">
      <svg viewBox="0 0 104 104" className="w-full h-full ring-glow" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="rgba(16,185,129,0.15)" strokeWidth="7" />
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="#10B981" strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-2xl leading-none">{icon}</span>
        <span className="text-[11px] font-bold" style={{ color: '#10B981' }}>
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  )
}

/* ── Next prayer hero card ── */
function NextPrayerCard({ nextPrayer, countdown, ringPct }) {
  if (!nextPrayer) return null
  return (
    <div className="mx-4 -mt-4 mb-5 rounded-3xl overflow-hidden glass-emerald relative"
      style={{ boxShadow: '0 8px 40px rgba(16,185,129,0.18)' }}>
      <IslamicPattern className="opacity-50" />

      <div className="relative z-10 p-5 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: '#10B981', opacity: 0.8 }}>
            Следующий намаз
          </p>
          <h2 className="text-3xl font-black leading-tight mb-1" style={{ color: 'var(--text-h)' }}>
            {nextPrayer.icon} {nextPrayer.ru}
          </h2>
          <p className="text-base font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            {nextPrayer.time}
          </p>
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-xmuted)' }}>через</p>
            <p className="text-2xl font-black tabular-nums gold-glow" style={{ color: '#F59E0B' }}>
              {countdown}
            </p>
          </div>
        </div>

        <PrayerRing pct={ringPct} icon={nextPrayer.icon} />
      </div>
    </div>
  )
}

/* ── Single prayer row ── */
function PrayerRow({ prayer, isNext, isDone, isPast, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="prayer-item w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.97] text-left"
      style={{
        background: isNext ? 'rgba(16,185,129,0.1)' : 'var(--card-bg)',
        border: isNext ? '1.5px solid rgba(16,185,129,0.35)' : '1.5px solid var(--card-border)',
        boxShadow: isNext ? '0 2px 16px rgba(16,185,129,0.12)' : 'none',
        opacity: isPast && !isNext && !isDone ? 0.55 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{
            background: isNext
              ? 'rgba(16,185,129,0.15)'
              : isDone
              ? 'rgba(16,185,129,0.08)'
              : 'var(--bg-s1)',
          }}>
          {prayer.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={{
              color: isNext ? '#10B981' : isDone ? 'var(--text-xmuted)' : 'var(--text-h)',
              textDecoration: isDone && !isNext ? 'line-through' : 'none',
            }}>
              {prayer.ru}
            </span>
            {isNext && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#10B981', color: '#FFFFFF' }}>
                Сейчас
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-xmuted)' }}>{prayer.time}</p>
        </div>
      </div>

      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 ${isDone ? 'check-pop' : ''}`}
        style={{
          background: isDone ? '#10B981' : 'transparent',
          borderColor: isDone ? '#10B981' : isNext ? '#10B981' : 'var(--card-border)',
        }}
      >
        {isDone ? (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2.5 6.5l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : isNext ? (
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#10B981' }} />
        ) : null}
      </div>
    </button>
  )
}

/* ── Time block progress bar ── */
function TimeBlock({ block, nowMins }) {
  const isActive = nowMins >= block.from.mins && nowMins < block.to.mins
  const isPast   = nowMins >= block.to.mins
  const pct = isActive
    ? Math.round(((nowMins - block.from.mins) / block.diffMins) * 100)
    : isPast ? 100 : 0

  return (
    <div className="rounded-2xl px-4 py-3 glass"
      style={{ boxShadow: isActive ? '0 2px 12px rgba(16,185,129,0.1)' : 'none' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-body)' }}>
          {block.from.icon} {block.from.ru} — {block.to.icon} {block.to.ru}
        </span>
        <span className="text-xs font-bold" style={{ color: isActive ? '#10B981' : 'var(--text-xmuted)' }}>
          {isActive ? `${pct}%` : block.dur}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-s1)' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: isActive
              ? 'linear-gradient(to right,#10B981,#34D399)'
              : isPast
              ? 'rgba(16,185,129,0.3)'
              : 'transparent',
          }} />
      </div>
    </div>
  )
}

/* ── Main Home screen ── */
export default function Home() {
  const {
    prayers, loading, locError,
    nextPrayer, countdown, ringPct,
    timeBlocks, cityName,
  } = usePrayerTimes()

  const { donePrayers, togglePrayer } = usePrayerLog()

  const now    = new Date()
  const nowM   = now.getHours() * 60 + now.getMinutes()
  const { text: greetText, icon: greetIcon } = greeting()
  const dateStr = `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`
  const donePrayerCount = Object.values(donePrayers).filter(Boolean).length

  return (
    <div className="page-enter min-h-full" style={{ background: 'var(--bg-page)' }}>

      {/* ── Header (gradient) ── */}
      <div className="relative overflow-hidden pt-12 pb-10 px-5"
        style={{ background: 'linear-gradient(160deg, var(--header-from) 0%, var(--header-to) 100%)' }}>
        <IslamicPattern />

        {/* Top row: date + account + theme toggle */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs font-medium">
              {dateStr}{cityName ? ` · ${cityName}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AccountDropdown />
            <ThemeToggle />
          </div>
        </div>

        {/* Greeting */}
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-0.5">
            {greetText} {greetIcon}
          </p>
          <h1 className="text-white text-2xl font-black mb-4">
            Ас-саламу алейкум
          </h1>

          {/* Stats pills + optional install button */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/15 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {loading ? '—/5' : `${donePrayerCount}/5`} намазов ✅
            </span>
            {locError && (
              <span className="bg-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full">
                📍 {locError}
              </span>
            )}
            <InstallButton />
          </div>
        </div>
      </div>

      {/* ── Next prayer card (floats up over gradient) ── */}
      {loading ? (
        <div className="mx-4 -mt-4 mb-5 h-32 rounded-3xl animate-pulse"
          style={{ background: 'var(--bg-s1)' }} />
      ) : (
        <NextPrayerCard
          nextPrayer={nextPrayer}
          countdown={countdown}
          ringPct={ringPct}
        />
      )}

      {/* ── Body ── */}
      <div className="px-4 space-y-5 pb-28">

        {/* Prayers list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-xmuted)' }}>
              Намазы сегодня
            </h2>
            <span className="text-xs font-semibold" style={{ color: '#10B981' }}>
              {donePrayerCount}/5
            </span>
          </div>

          <div className="space-y-2.5">
            {loading
              ? [1,2,3,4,5].map(i => (
                  <div key={i} className="h-[62px] rounded-2xl animate-pulse"
                    style={{ background: 'var(--bg-s1)' }} />
                ))
              : prayers.map(p => (
                  <PrayerRow
                    key={p.key}
                    prayer={p}
                    isNext={nextPrayer?.key === p.key}
                    isDone={!!donePrayers[p.key]}
                    isPast={p.mins < nowM}
                    onToggle={() => togglePrayer(p.key)}
                  />
                ))
            }
          </div>
        </section>

        {/* Time blocks */}
        {loading ? (
          <section>
            <div className="h-3 w-20 rounded-full mb-3 animate-pulse" style={{ background: 'var(--bg-s1)' }} />
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[62px] rounded-2xl animate-pulse" style={{ background: 'var(--bg-s1)' }} />
              ))}
            </div>
          </section>
        ) : timeBlocks.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-xmuted)' }}>
              Тайм-блоки
            </h2>
            <div className="space-y-2.5">
              {timeBlocks.map((b, i) => (
                <TimeBlock key={i} block={b} nowMins={nowM} />
              ))}
            </div>
          </section>
        )}
      </div>

    </div>
  )
}
