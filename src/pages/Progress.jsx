import { useTasks }     from '../hooks/useTasks'
import { useAnalytics } from '../hooks/useAnalytics'
import IslamicPattern   from '../components/IslamicPattern'

const MONTHS = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']

/* ── SVG completion ring ── */
function Ring({ pct, size = 120, stroke = 9 }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color  = pct >= 75 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--bg-s1)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
    </svg>
  )
}

/* ── 7-day bar chart ── */
function WeekChart({ bars }) {
  const max = Math.max(...bars.map(b => b.pct), 1)
  return (
    <div className="flex items-end justify-between gap-1.5" style={{ height: 88 }}>
      {bars.map((b, i) => {
        const barColor = b.isToday
          ? (b.pct >= 75 ? '#10B981' : b.pct >= 40 ? '#F59E0B' : b.pct > 0 ? '#EF4444' : 'var(--bg-s1)')
          : b.hasData
          ? 'rgba(16,185,129,0.3)'
          : 'var(--bg-s1)'
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex flex-col justify-end" style={{ height: 64 }}>
              <div className="w-full rounded-t-lg transition-all duration-700"
                style={{ height: `${Math.max((b.pct / max) * 100, 4)}%`, background: barColor, minHeight: 4 }} />
            </div>
            <span className="text-[10px] font-semibold"
              style={{ color: b.isToday ? '#10B981' : 'var(--text-xmuted)' }}>
              {b.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Prayer dots grid ── */
const PRAYERS = [
  { key: 'Fajr',    icon: '🌙', label: 'Фаджр' },
  { key: 'Dhuhr',   icon: '☀️', label: 'Зухр'  },
  { key: 'Asr',     icon: '🌤️', label: 'Аср'   },
  { key: 'Maghrib', icon: '🌅', label: 'Магриб' },
  { key: 'Isha',    icon: '⭐', label: 'Иша'   },
]

function PrayerGrid() {
  const today = new Date().toISOString().split('T')[0]
  let done = {}
  try { done = JSON.parse(localStorage.getItem(`pd_${today}`) ?? '{}') } catch {}
  const doneCount = PRAYERS.filter(p => done[p.key]).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-xmuted)' }}>
          Намазы сегодня
        </span>
        <span className="text-xs font-bold" style={{ color: '#10B981' }}>{doneCount}/5</span>
      </div>
      <div className="flex gap-1.5">
        {PRAYERS.map(p => (
          <div key={p.key} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl"
            style={{
              background: done[p.key] ? 'rgba(16,185,129,0.12)' : 'var(--bg-s1)',
              border: done[p.key] ? '1px solid rgba(16,185,129,0.25)' : '1px solid var(--card-border)',
            }}>
            <span className="text-base leading-none">{p.icon}</span>
            <span className="text-[9px] font-semibold"
              style={{ color: done[p.key] ? '#10B981' : 'var(--text-xmuted)' }}>
              {p.label}
            </span>
            {done[p.key] && (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 4.5l2 2 4-4" stroke="#10B981" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Single insight pill ── */
function InsightCard({ insight }) {
  const STYLES = {
    positive: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
    warning:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
    neutral:  { bg: 'var(--bg-s1)',            border: 'var(--card-border)'    },
  }
  const s = STYLES[insight.type] ?? STYLES.neutral
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <span className="text-xl leading-none flex-shrink-0 mt-0.5">{insight.icon}</span>
      <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-body)' }}>
        {insight.text}
      </p>
    </div>
  )
}

/* ── Upgrade / registration banner ── */
function UpgradeBanner() {
  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(16,185,129,0.08) 100%)',
        border: '1px solid rgba(245,158,11,0.28)',
      }}>
      <div className="p-5 flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: 'rgba(245,158,11,0.15)' }}>
          ☁️
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-h)' }}>
            Не потеряй свой прогресс
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
            Зарегистрируйся чтобы не потерять данные и получить месячную аналитику
          </p>
          <button
            className="w-full py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ background: '#F59E0B', color: '#FFFFFF' }}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton loader ── */
function Skeleton({ h = 16, w = '100%', rounded = '12px' }) {
  return (
    <div className="animate-pulse" style={{ height: h, width: w, borderRadius: rounded, background: 'var(--bg-s1)' }} />
  )
}

/* ── Main screen ── */
export default function Progress() {
  const { tasks, stats, loading } = useTasks()
  const analytics = useAnalytics()

  const now = new Date()
  const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]}`

  function motivational(pct) {
    if (pct === 100) return { text: 'Маша Аллах! Всё выполнено 🌟', color: '#10B981' }
    if (pct >= 75)   return { text: 'Отличный прогресс! 💪',         color: '#10B981' }
    if (pct >= 50)   return { text: 'Ты на полпути 🚀',               color: '#F59E0B' }
    if (pct >= 25)   return { text: 'Продолжай двигаться вперёд 🌱',  color: '#F59E0B' }
    if (pct > 0)     return { text: 'Начало положено ✨',              color: 'var(--text-muted)' }
    return             { text: 'Добавь задачи и начни день',           color: 'var(--text-xmuted)' }
  }
  const { text: motText, color: motColor } = motivational(stats.pct)

  return (
    <div className="page-enter min-h-full" style={{ background: 'var(--bg-page)' }}>

      {/* ── Header ── */}
      <div className="relative overflow-hidden pt-12 pb-8 px-5"
        style={{ background: 'linear-gradient(160deg, var(--header-from) 0%, var(--header-to) 100%)' }}>
        <IslamicPattern />
        <div className="relative z-10">
          <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{dateStr}</p>
          <h1 className="text-2xl font-black text-white">Аналитика</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* ── Today's score ── */}
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-xmuted)' }}>
            Сегодня
          </p>
          {loading ? (
            <div className="flex items-center gap-5">
              <div className="w-[120px] h-[120px] rounded-full animate-pulse" style={{ background: 'var(--bg-s1)' }} />
              <div className="flex-1 space-y-2">
                <Skeleton h={28} w="55%" rounded="8px" />
                <Skeleton h={16} w="75%" rounded="8px" />
                <Skeleton h={16} w="60%" rounded="8px" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <Ring pct={stats.pct} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-h)' }}>{stats.pct}%</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-xmuted)' }}>готово</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-3xl font-black leading-none mb-1" style={{ color: 'var(--text-h)' }}>
                  {stats.done}/{stats.total}
                </p>
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>задач выполнено</p>
                <p className="text-sm font-semibold" style={{ color: motColor }}>{motText}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Priority breakdown ── */}
        {!loading && tasks.length > 0 && (
          <div className="glass rounded-3xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-xmuted)' }}>
              По приоритетам
            </p>
            <div className="space-y-3">
              {[
                { id: 'high',   label: 'Высокий', color: '#EF4444' },
                { id: 'medium', label: 'Средний', color: '#F59E0B' },
                { id: 'low',    label: 'Низкий',  color: '#10B981' },
              ].map(p => {
                const grp  = tasks.filter(t => t.priority === p.id)
                if (!grp.length) return null
                const done = grp.filter(t => t.done).length
                const pct  = Math.round(done / grp.length * 100)
                return (
                  <div key={p.id}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-body)' }}>{p.label}</span>
                      <span className="text-xs" style={{ color: 'var(--text-xmuted)' }}>{done}/{grp.length}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-s1)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: p.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 7-day trend ── */}
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-xmuted)' }}>
              За 7 дней
            </p>
            {analytics.avg7 > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: analytics.trendDelta >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color:      analytics.trendDelta >= 0 ? '#10B981' : '#EF4444',
                }}>
                {analytics.trendDelta >= 0 ? '+' : ''}{analytics.trendDelta}% к пред. неделе
              </span>
            )}
          </div>
          <WeekChart bars={analytics.weekBars} />
        </div>

        {/* ── Prayers ── */}
        <div className="glass rounded-3xl p-5">
          <PrayerGrid />
          {analytics.prayerStreak >= 2 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-2xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <span className="text-base leading-none">🔥</span>
              <span className="text-xs font-semibold" style={{ color: '#10B981' }}>
                Стрик {analytics.prayerStreak}{' '}
                {analytics.prayerStreak === 1 ? 'день' : analytics.prayerStreak < 5 ? 'дня' : 'дней'} подряд
              </span>
            </div>
          )}
        </div>

        {/* ── Insights ── */}
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-xmuted)' }}>
            Инсайты
          </p>
          <div className="space-y-2.5">
            {analytics.insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>
        </div>

        {/* ── Upgrade banner (7+ days of data) ── */}
        {analytics.showUpgradeBanner && <UpgradeBanner />}

      </div>
    </div>
  )
}
