import { useTasks }     from '../hooks/useTasks'
import { useAnalytics } from '../hooks/useAnalytics'
import IslamicPattern   from '../components/IslamicPattern'

const MONTHS = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']

/* ── Mini SVG ring ── */
function Ring({ pct, size = 96, stroke = 8, color = '#10B981' }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--bg-s1)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  )
}

/* ── Today dual stat cards ── */
function TodayStats({ todayPrayers, todayTasks }) {
  const prayerPct = Math.round(todayPrayers / 5 * 100)
  const taskPct   = todayTasks.total > 0
    ? Math.round(todayTasks.done / todayTasks.total * 100)
    : 0
  const taskColor = taskPct >= 75 ? '#10B981' : taskPct >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Prayer card */}
      <div className="glass rounded-3xl p-4 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider self-start"
          style={{ color: 'var(--text-xmuted)' }}>Намазы</p>
        <div className="relative">
          <Ring pct={prayerPct} color="#10B981" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black leading-none" style={{ color: 'var(--text-h)' }}>
              {todayPrayers}/5
            </span>
            <span className="text-[9px]" style={{ color: 'var(--text-xmuted)' }}>{prayerPct}%</span>
          </div>
        </div>
        <p className="text-xs font-semibold text-center"
          style={{ color: todayPrayers === 5 ? '#10B981' : todayPrayers >= 3 ? '#F59E0B' : 'var(--text-muted)' }}>
          {todayPrayers === 5 ? 'Маша Аллах! 🌟' : todayPrayers >= 3 ? 'Хорошо! 💪' : 'Не забудь намаз'}
        </p>
      </div>

      {/* Tasks card */}
      <div className="glass rounded-3xl p-4 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider self-start"
          style={{ color: 'var(--text-xmuted)' }}>Задачи</p>
        <div className="relative">
          <Ring pct={taskPct} color={taskColor} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black leading-none" style={{ color: 'var(--text-h)' }}>
              {todayTasks.done}/{todayTasks.total || '—'}
            </span>
            <span className="text-[9px]" style={{ color: 'var(--text-xmuted)' }}>
              {todayTasks.total > 0 ? `${taskPct}%` : '—'}
            </span>
          </div>
        </div>
        <p className="text-xs font-semibold text-center"
          style={{ color: taskPct === 100 ? '#10B981' : taskPct >= 50 ? '#F59E0B' : 'var(--text-muted)' }}>
          {taskPct === 100 ? 'Всё сделано! 🎯' : todayTasks.total === 0 ? 'Добавь задачи' : `${todayTasks.total - todayTasks.done} осталось`}
        </p>
      </div>
    </div>
  )
}

/* ── 7-day prayer calendar ── */
function PrayerCalendar({ calendar, streak }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-xmuted)' }}>
          Намазы за 7 дней
        </p>
        {streak >= 2 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            🔥 {streak} {streak < 5 ? 'дня' : 'дней'}
          </span>
        )}
      </div>

      {/* Bars */}
      <div className="flex items-end justify-between gap-1.5" style={{ height: 80 }}>
        {calendar.map((d, i) => {
          const pct     = (d.done / 5) * 100
          const barColor = d.done === 5
            ? '#10B981'
            : d.done >= 3
            ? '#F59E0B'
            : d.done >= 1
            ? 'rgba(245,158,11,0.45)'
            : 'var(--bg-s1)'
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex flex-col justify-end" style={{ height: 52 }}>
                <div className="w-full rounded-t-lg transition-all duration-700"
                  style={{ height: `${Math.max(pct, 5)}%`, background: barColor, minHeight: 4 }} />
              </div>
              <span className="text-[10px] font-bold"
                style={{ color: d.isToday ? '#10B981' : 'var(--text-xmuted)' }}>
                {d.label}
              </span>
              <span className="text-[9px]" style={{ color: 'var(--text-xmuted)' }}>
                {d.done}/5
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Task week bars ── */
function TaskWeekChart({ bars, trendDelta, avg7 }) {
  const max = Math.max(...bars.map(b => b.pct), 1)
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-xmuted)' }}>
          Задачи за 7 дней
        </p>
        {avg7 > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: trendDelta >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color:      trendDelta >= 0 ? '#10B981' : '#EF4444',
            }}>
            {trendDelta >= 0 ? '+' : ''}{trendDelta}% к пред. неделе
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-1.5" style={{ height: 80 }}>
        {bars.map((b, i) => {
          const color = b.isToday
            ? (b.pct >= 75 ? '#10B981' : b.pct >= 40 ? '#F59E0B' : b.pct > 0 ? '#EF4444' : 'var(--bg-s1)')
            : b.hasData ? 'rgba(16,185,129,0.3)' : 'var(--bg-s1)'
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex flex-col justify-end" style={{ height: 56 }}>
                <div className="w-full rounded-t-lg transition-all duration-700"
                  style={{ height: `${Math.max((b.pct / max) * 100, 4)}%`, background: color, minHeight: 4 }} />
              </div>
              <span className="text-[10px] font-semibold"
                style={{ color: b.isToday ? '#10B981' : 'var(--text-xmuted)' }}>
                {b.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Best prayer block ── */
function BestBlock({ block, count }) {
  if (!block) return null
  return (
    <div className="glass-emerald rounded-3xl p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: 'rgba(245,158,11,0.15)' }}>
        {block.icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
          style={{ color: '#F59E0B' }}>
          Твой лучший блок
        </p>
        <p className="text-base font-black" style={{ color: 'var(--text-h)' }}>
          {block.label}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {count} {count === 1 ? 'задача' : count < 5 ? 'задачи' : 'задач'} выполнено
        </p>
      </div>
      <span className="text-2xl">🏆</span>
    </div>
  )
}

/* ── Insight card ── */
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

/* ── Upgrade banner ── */
function UpgradeBanner() {
  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(16,185,129,0.08) 100%)',
        border: '1px solid rgba(245,158,11,0.28)',
      }}>
      <div className="p-5 flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: 'rgba(245,158,11,0.15)' }}>☁️</div>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-h)' }}>
            Не потеряй свой прогресс
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
            Зарегистрируйся чтобы не потерять данные и получить месячную аналитику
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('waqti:show-auth'))}
            className="w-full py-2.5 rounded-2xl text-sm font-bold active:scale-95 transition-all"
            style={{ background: '#F59E0B', color: '#FFFFFF' }}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
        style={{ background: 'var(--bg-s1)' }}>
        📊
      </div>
      <h2 className="text-lg font-black mb-2" style={{ color: 'var(--text-h)' }}>
        Пока нет данных
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Начни отмечать намазы и задачи — и мы покажем твою статистику здесь
      </p>
      <div className="mt-6 flex gap-3">
        <span className="text-xs font-semibold px-4 py-2 rounded-full"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
          🕌 Намазы → Главная
        </span>
        <span className="text-xs font-semibold px-4 py-2 rounded-full"
          style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
          ✅ Задачи → Планировщик
        </span>
      </div>
    </div>
  )
}

/* ── Main screen ── */
export default function Progress() {
  const { tasks } = useTasks()
  const a = useAnalytics()

  const now     = new Date()
  const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]}`

  return (
    <div className="page-enter min-h-full" style={{ background: 'var(--bg-page)' }}>

      {/* Header */}
      <div className="relative overflow-hidden pt-12 pb-8 px-5"
        style={{ background: 'linear-gradient(160deg, var(--header-from) 0%, var(--header-to) 100%)' }}>
        <IslamicPattern />
        <div className="relative z-10">
          <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{dateStr}</p>
          <h1 className="text-2xl font-black text-white">Аналитика</h1>
        </div>
      </div>

      {a.isEmpty ? (
        <EmptyState />
      ) : (
        <div className="px-4 py-5 space-y-4 pb-28">

          {/* Today: prayer + task rings */}
          <TodayStats todayPrayers={a.todayPrayers} todayTasks={a.todayTasks} />

          {/* 7-day prayer calendar + streak */}
          <PrayerCalendar calendar={a.prayerCalendar} streak={a.prayerStreak} />

          {/* Best prayer time block */}
          {a.bestBlock && <BestBlock block={a.bestBlock} count={a.bestBlockCount} />}

          {/* 7-day task chart */}
          {a.avg7 > 0 && (
            <TaskWeekChart bars={a.taskWeekBars} trendDelta={a.trendDelta} avg7={a.avg7} />
          )}

          {/* Insights */}
          {a.insights.length > 0 && (
            <div className="glass rounded-3xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-xmuted)' }}>Инсайты</p>
              <div className="space-y-2.5">
                {a.insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
              </div>
            </div>
          )}

          {/* Upgrade banner after 7+ days */}
          {a.showUpgradeBanner && <UpgradeBanner />}

        </div>
      )}
    </div>
  )
}
