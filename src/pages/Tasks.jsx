import { useState, useRef } from 'react'
import { useTasks } from '../hooks/useTasks'
import IslamicPattern from '../components/IslamicPattern'

const PRIORITIES = [
  { id: 'high',   label: 'Высокий', color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
  { id: 'medium', label: 'Средний', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  { id: 'low',    label: 'Низкий',  color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
]

const PRAYER_BLOCKS = [
  { id: 'fajr_dhuhr',   label: 'Фаджр — Зухр',  short: 'Ф—З', icon: '🌙' },
  { id: 'dhuhr_asr',    label: 'Зухр — Аср',     short: 'З—А', icon: '☀️' },
  { id: 'asr_maghrib',  label: 'Аср — Магриб',   short: 'А—М', icon: '🌤️' },
  { id: 'maghrib_isha', label: 'Магриб — Иша',   short: 'М—И', icon: '🌅' },
]

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function pMeta(id) { return PRIORITIES.find(p => p.id === id) ?? PRIORITIES[1] }
function bMeta(id) { return PRAYER_BLOCKS.find(b => b.id === id) ?? null }

/* ── Single task card ── */
function TaskCard({ task, onToggle, onMove, onDelete }) {
  const [open, setOpen] = useState(false)
  const p = pMeta(task.priority)
  const b = bMeta(task.prayerBlock)

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--card-bg)',
        border: `1.5px solid ${task.done ? 'var(--card-border)' : 'var(--card-border)'}`,
        boxShadow: task.done ? 'none' : '0 1px 8px rgba(0,0,0,0.04)',
        opacity: task.done ? 0.65 : 1,
      }}>

      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{
            background: task.done ? '#10B981' : 'transparent',
            borderColor: task.done ? '#10B981' : 'var(--card-border)',
          }}>
          {task.done && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Title + meta */}
        <div className="flex-1 min-w-0" onClick={() => setOpen(o => !o)}>
          <p className="text-sm font-medium truncate"
            style={{
              color: task.done ? 'var(--text-xmuted)' : 'var(--text-h)',
              textDecoration: task.done ? 'line-through' : 'none',
            }}>
            {task.title}
          </p>
          {(b || task.time) && (
            <div className="flex items-center gap-2 mt-0.5">
              {task.time && (
                <span className="text-[10px] font-semibold" style={{ color: '#10B981' }}>
                  ⏰ {task.time}
                </span>
              )}
              {b && (
                <span className="text-[10px]" style={{ color: 'var(--text-xmuted)' }}>
                  {b.icon} {b.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Priority dot */}
        <span className="flex-shrink-0 w-2 h-2 rounded-full"
          style={{ background: p.color }} />

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-xl transition-all active:scale-90"
          style={{
            color: 'var(--text-xmuted)',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 3.5h11M6 3.5V2.5h3v1M5.5 3.5l.5 8M9.5 3.5l-.5 8"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Expanded actions */}
      {open && (
        <div className="flex border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button
            onClick={() => { onMove(task.id); setOpen(false) }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors"
            style={{ color: '#F59E0B' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            На завтра
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Prayer block section ── */
function BlockSection({ block, tasks, onToggle, onMove, onDelete }) {
  const pending = tasks.filter(t => !t.done)
  const done    = tasks.filter(t => t.done)

  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-base leading-none">{block?.icon ?? '📋'}</span>
        <span className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--text-xmuted)' }}>
          {block?.label ?? 'Без блока'}
        </span>
        <span className="text-xs font-semibold ml-auto" style={{ color: '#10B981' }}>
          {done.length}/{tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {[...pending, ...done].map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  )
}

/* ── Main screen ── */
export default function Tasks() {
  const { tasks, loading, addTask, toggleDone, moveToTomorrow, deleteTask, stats } = useTasks()
  const [input,       setInput]       = useState('')
  const [priority,    setPriority]    = useState('medium')
  const [prayerBlock, setPrayerBlock] = useState(null)
  const [taskTime,       setTaskTime]       = useState('')
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [adding,         setAdding]         = useState(false)
  const inputRef = useRef(null)

  const now     = new Date()
  const dateStr = `${now.getDate()} ${['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'][now.getMonth()]}`

  const handleAdd = async () => {
    if (!input.trim()) return
    setAdding(true)
    await addTask(input.trim(), priority, prayerBlock, taskTime || null)
    setInput('')
    setTaskTime('')
    setShowTimePicker(false)
    setAdding(false)
    inputRef.current?.focus()
  }

  // Group tasks by prayer block
  const grouped = PRAYER_BLOCKS.map(block => ({
    block,
    tasks: tasks.filter(t => t.prayerBlock === block.id)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
  })).filter(g => g.tasks.length > 0)

  const unassigned = tasks
    .filter(t => !t.prayerBlock)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const isEmpty = !loading && tasks.length === 0

  return (
    <div className="page-enter min-h-full" style={{ background: 'var(--bg-page)' }}>

      {/* ── Header ── */}
      <div className="relative overflow-hidden pt-12 pb-8 px-5"
        style={{ background: 'linear-gradient(160deg, var(--header-from) 0%, var(--header-to) 100%)' }}>
        <IslamicPattern />
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {dateStr}
            </p>
            <h1 className="text-2xl font-black text-white">Планировщик</h1>
          </div>
          {tasks.length > 0 && (
            <span className="text-sm font-bold px-3 py-1.5 rounded-full mb-0.5"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              {stats.done}/{stats.total} · {stats.pct}%
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 pb-28">

        {/* ── Add task form ── */}
        <div className="glass rounded-3xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Добавить задачу..."
              className="flex-1 text-sm outline-none bg-transparent task-input"
              style={{ color: 'var(--text-h)' }}
            />
            <button
              onClick={handleAdd}
              disabled={!input.trim() || adding}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
              style={{ background: '#10B981' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Time picker */}
          <div className="px-4 pb-2">
            {!showTimePicker ? (
              <button
                onClick={() => setShowTimePicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={{
                  border: '1.5px solid var(--card-border)',
                  color: taskTime ? '#10B981' : 'var(--text-xmuted)',
                  background: taskTime ? 'rgba(16,185,129,0.08)' : 'transparent',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}>
                ⏰ {taskTime || 'Добавить время'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={taskTime}
                  onChange={e => setTaskTime(e.target.value)}
                  autoFocus
                  className="text-sm outline-none bg-transparent"
                  style={{ color: 'var(--text-h)', colorScheme: 'dark' }}
                />
                <button
                  onClick={() => { setTaskTime(''); setShowTimePicker(false) }}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: 'var(--text-xmuted)', background: 'var(--bg-s1)' }}>
                  Убрать
                </button>
                {taskTime && (
                  <button
                    onClick={() => setShowTimePicker(false)}
                    className="text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)' }}>
                    ОК
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Priority chips */}
          <div className="flex gap-1.5 px-4 pb-2">
            {PRIORITIES.map(p => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={priority === p.id
                  ? { background: p.bg, color: p.color, border: `1.5px solid ${p.color}40` }
                  : { background: 'var(--bg-s1)', color: 'var(--text-xmuted)', border: '1.5px solid transparent' }
                }>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: priority === p.id ? p.color : 'var(--text-xmuted)' }} />
                {p.label}
              </button>
            ))}
          </div>

          {/* Prayer block chips */}
          <div className="flex gap-1.5 px-4 pb-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setPrayerBlock(null)}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={prayerBlock === null
                ? { background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1.5px solid rgba(16,185,129,0.3)' }
                : { background: 'var(--bg-s1)', color: 'var(--text-xmuted)', border: '1.5px solid transparent' }
              }>
              Без блока
            </button>
            {PRAYER_BLOCKS.map(b => (
              <button
                key={b.id}
                onClick={() => setPrayerBlock(b.id)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={prayerBlock === b.id
                  ? { background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1.5px solid rgba(16,185,129,0.3)' }
                  : { background: 'var(--bg-s1)', color: 'var(--text-xmuted)', border: '1.5px solid transparent' }
                }>
                <span>{b.icon}</span>
                <span>{b.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: 'var(--bg-s1)' }} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {isEmpty && (
          <div className="text-center py-14">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ background: 'var(--bg-s1)' }}>
              ✅
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-h)' }}>Нет задач на сегодня</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-xmuted)' }}>Добавь первую задачу выше</p>
          </div>
        )}

        {/* ── Prayer block groups ── */}
        {!loading && grouped.map(g => (
          <BlockSection
            key={g.block.id}
            block={g.block}
            tasks={g.tasks}
            onToggle={toggleDone}
            onMove={moveToTomorrow}
            onDelete={deleteTask}
          />
        ))}

        {/* ── Unassigned tasks ── */}
        {!loading && unassigned.length > 0 && (
          <BlockSection
            block={null}
            tasks={unassigned}
            onToggle={toggleDone}
            onMove={moveToTomorrow}
            onDelete={deleteTask}
          />
        )}

      </div>
    </div>
  )
}
