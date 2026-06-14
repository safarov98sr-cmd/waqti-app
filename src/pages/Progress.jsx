import { useTasks } from '../hooks/useTasks'

const MONTHS = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']
const WEEKDAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота']

/* SVG circle progress */
function CircleProgress({ pct, size = 140, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E1F5EE" strokeWidth={stroke}/>
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={pct >= 75 ? '#0F6E56' : pct >= 40 ? '#EF9F27' : '#EF4444'}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

/* Simple bar chart for 7 days */
function WeekChart() {
  const bars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayKey = d.toISOString().split('T')[0]
    const stored = localStorage.getItem(`tasks_${dayKey}`)
    let pct = 0
    if (stored) {
      try {
        const tasks = JSON.parse(stored)
        if (tasks.length > 0) pct = Math.round(tasks.filter(t => t.done).length / tasks.length * 100)
      } catch {}
    }
    const label = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d.getDay()]
    const isToday = i === 6
    return { pct, label, isToday }
  })

  return (
    <div className="flex items-end justify-between gap-1.5 h-24">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: `${Math.max(b.pct, 4)}%`,
                background: b.isToday
                  ? (b.pct >= 75 ? '#0F6E56' : b.pct >= 40 ? '#EF9F27' : '#EF4444')
                  : '#D1FAE5',
                minHeight: '4px',
              }}
            />
          </div>
          <span className={`text-[10px] font-semibold ${b.isToday ? 'text-primary' : 'text-gray-400'}`}>
            {b.label}
          </span>
        </div>
      ))}
    </div>
  )
}

/* Prayer progress */
function PrayerStats() {
  const today = new Date().toISOString().split('T')[0]
  let done = 0
  try {
    const stored = JSON.parse(localStorage.getItem(`pd_${today}`) ?? '{}')
    done = Object.values(stored).filter(Boolean).length
  } catch {}

  const PRAYERS = [
    { key: 'Fajr', icon: '🌙', label: 'Фаджр' },
    { key: 'Dhuhr', icon: '☀️', label: 'Зухр' },
    { key: 'Asr', icon: '🌤️', label: 'Аср' },
    { key: 'Maghrib', icon: '🌅', label: 'Магриб' },
    { key: 'Isha', icon: '⭐', label: 'Иша' },
  ]

  let donePrayers = {}
  try { donePrayers = JSON.parse(localStorage.getItem(`pd_${today}`) ?? '{}') } catch {}

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Намазы</span>
        <span className="text-xs font-bold text-primary">{done}/5</span>
      </div>
      <div className="flex gap-2">
        {PRAYERS.map(p => (
          <div
            key={p.key}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl"
            style={{ background: donePrayers[p.key] ? '#E1F5EE' : '#F9FAFB' }}
          >
            <span className="text-base">{p.icon}</span>
            <span className={`text-[9px] font-semibold ${donePrayers[p.key] ? 'text-primary' : 'text-gray-400'}`}>
              {p.label}
            </span>
            {donePrayers[p.key] && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5l3 3 4-4" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function motivational(pct) {
  if (pct === 100) return { text: 'Маша Аллах! Все задачи выполнены 🌟', color: 'text-primary' }
  if (pct >= 75)  return { text: 'Отличный прогресс! Осталось совсем немного 💪', color: 'text-primary' }
  if (pct >= 50)  return { text: 'Хорошая работа! Ты на полпути 🚀', color: 'text-gold' }
  if (pct >= 25)  return { text: 'Продолжай в том же духе! 🌱', color: 'text-gold' }
  if (pct > 0)    return { text: 'Начало положено. Двигайся вперёд! ✨', color: 'text-gray-500' }
  return           { text: 'Добавь задачи и начни продуктивный день 🗓️', color: 'text-gray-400' }
}

export default function Progress() {
  const { tasks, stats, loading } = useTasks()
  const now = new Date()
  const dateStr = `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`
  const mot = motivational(stats.pct)

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="px-4 pt-12 pb-5" style={{ background: 'linear-gradient(160deg,#085041,#0F6E56)' }}>
        <p className="text-white/60 text-sm mb-0.5">{dateStr}</p>
        <h1 className="text-white text-xl font-bold">Прогресс</h1>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Main circle */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6 flex flex-col items-center">
          {loading ? (
            <div className="w-36 h-36 rounded-full bg-gray-100 animate-pulse"/>
          ) : (
            <div className="relative flex items-center justify-center">
              <CircleProgress pct={stats.pct} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">{stats.pct}%</span>
                <span className="text-xs text-gray-400 font-medium">выполнено</span>
              </div>
            </div>
          )}
          <p className="text-gray-600 text-sm text-center mt-4">
            {stats.done} из {stats.total} задач выполнено
          </p>
          <p className={`text-sm font-semibold text-center mt-1 ${mot.color}`}>
            {mot.text}
          </p>
        </div>

        {/* Task progress bars by priority */}
        {!loading && tasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">По приоритетам</h3>
            {[
              { id: 'high',   label: 'Высокий', color: '#EF4444' },
              { id: 'medium', label: 'Средний', color: '#EF9F27' },
              { id: 'low',    label: 'Низкий',  color: '#0F6E56' },
            ].map(p => {
              const group = tasks.filter(t => t.priority === p.id)
              if (!group.length) return null
              const doneCnt = group.filter(t => t.done).length
              const pct = Math.round(doneCnt / group.length * 100)
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-600">{p.label}</span>
                    <span className="text-xs text-gray-400">{doneCnt}/{group.length}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: p.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Prayer stats */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
          <PrayerStats />
        </div>

        {/* Weekly chart */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
            Выполнение за неделю
          </h3>
          <WeekChart />
        </div>

      </div>
    </div>
  )
}
