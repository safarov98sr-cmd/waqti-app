import { useTheme }      from '../ThemeContext'
import { usePrayerTimes } from '../hooks/usePrayerTimes'
import IslamicPattern     from '../components/IslamicPattern'

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

/* ── SVG ring countdown ── */
function PrayerRing({ pct, icon }) {
  const R = 44, CX = 52, CY = 52
  const circ = 2 * Math.PI * R // 276.5
  const offset = circ * (1 - pct)
  return (
    <div className="relative w-[104px] h-[104px] flex-shrink-0">
      <svg viewBox="0 0 104 104" className="w-full h-full ring-glow" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="rgba(16,185,129,0.15)" strokeWidth="7" />
        {/* Progress */}
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
      {/* subtle pattern inside card */}
      <IslamicPattern className="opacity-50" />

      <div className="relative z-10 p-5 flex items-center gap-4">
        {/* Left */}
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

        {/* Ring */}
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
        background: isNext
          ? 'rgba(16,185,129,0.1)'
          : isDone
          ? 'var(--card-bg)'
          : 'var(--card-bg)',
        border: isNext
          ? '1.5px solid rgba(16,185,129,0.35)'
          : `1.5px solid var(--card-border)`,
        boxShadow: isNext ? '0 2px 16px rgba(16,185,129,0.12)' : 'none',
        opacity: isPast && !isNext && !isDone ? 0.55 : 1,
      }}
    >
      {/* Icon + name + time */}
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

      {/* Checkbox */}
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
    donePrayers, togglePrayer,
    timeBlocks, cityName,
  } = usePrayerTimes()

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

        {/* Top row: date + toggle */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs font-medium">
              {dateStr}{cityName ? ` · ${cityName}` : ''}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Greeting */}
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-0.5">
            {greetText} {greetIcon}
          </p>
          <h1 className="text-white text-2xl font-black mb-4">
            Ас-саламу алейкум
          </h1>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/15 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {loading ? '—/5' : `${donePrayerCount}/5`} намазов ✅
            </span>
            {locError && (
              <span className="bg-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full">
                📍 {locError}
              </span>
            )}
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
        {timeBlocks.length > 0 && !loading && (
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
