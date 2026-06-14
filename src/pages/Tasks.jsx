import { useState, useRef } from 'react'
import { useTasks } from '../hooks/useTasks'

const PRIORITIES = [
  { id: 'high',   label: 'Высокий', color: '#EF4444', bg: '#FEE2E2' },
  { id: 'medium', label: 'Средний', color: '#EF9F27', bg: '#FFF8ED' },
  { id: 'low',    label: 'Низкий',  color: '#0F6E56', bg: '#E1F5EE' },
]

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function priorityMeta(id) {
  return PRIORITIES.find(p => p.id === id) ?? PRIORITIES[1]
}

function TaskItem({ task, onToggle, onMove, onDelete }) {
  const [showActions, setShowActions] = useState(false)
  const p = priorityMeta(task.priority)

  return (
    <div
      className={`bg-white rounded-2xl border transition-all ${
        task.done ? 'border-gray-100 opacity-60' : 'border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
            task.done ? 'bg-primary border-primary' : 'border-gray-300 hover:border-primary'
          }`}
        >
          {task.done && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </p>
        </div>

        {/* Priority dot */}
        <span
          className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: p.color, background: p.bg }}
        >
          {p.label}
        </span>

        {/* More button */}
        <button
          onClick={() => setShowActions(s => !s)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex border-t border-gray-100">
          <button
            onClick={() => { onMove(task.id); setShowActions(false) }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gold hover:bg-gold-lt transition-colors rounded-bl-2xl"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            На завтра
          </button>
          <div className="w-px bg-gray-100"/>
          <button
            onClick={() => { onDelete(task.id); setShowActions(false) }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-danger hover:bg-red-50 transition-colors rounded-br-2xl"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Удалить
          </button>
        </div>
      )}
    </div>
  )
}

export default function Tasks() {
  const { tasks, loading, addTask, toggleDone, moveToTomorrow, deleteTask, stats } = useTasks()
  const [input,    setInput]    = useState('')
  const [priority, setPriority] = useState('medium')
  const [adding,   setAdding]   = useState(false)
  const inputRef = useRef(null)

  const handleAdd = async () => {
    if (!input.trim()) return
    setAdding(true)
    await addTask(input, priority)
    setInput('')
    setAdding(false)
    inputRef.current?.focus()
  }

  const sorted = [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
  const pending = sorted.filter(t => !t.done)
  const done    = sorted.filter(t => t.done)

  const now = new Date()
  const dateStr = `${now.getDate()} ${['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'][now.getMonth()]}`

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="px-4 pt-12 pb-5" style={{ background: 'linear-gradient(160deg,#085041,#0F6E56)' }}>
        <p className="text-white/60 text-sm mb-0.5">{dateStr}</p>
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-bold">Задачи</h1>
          {tasks.length > 0 && (
            <span className="text-white/70 text-sm bg-white/15 px-3 py-1 rounded-full font-semibold">
              {stats.done}/{stats.total} · {stats.pct}%
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Add task form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Добавить задачу..."
              className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={!input.trim() || adding}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 transition-all active:scale-90"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Priority selector */}
          <div className="flex gap-1.5 px-4 pb-3">
            {PRIORITIES.map(p => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={
                  priority === p.id
                    ? { background: p.bg, color: p.color, border: `1.5px solid ${p.color}40` }
                    : { background: '#F9FAFB', color: '#9CA3AF', border: '1.5px solid transparent' }
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: priority === p.id ? p.color : '#D1D5DB' }}
                />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-200 rounded-2xl animate-pulse"/>)}
          </div>
        )}

        {/* Empty state */}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500 font-medium">Нет задач на сегодня</p>
            <p className="text-gray-400 text-sm mt-1">Добавь первую задачу выше</p>
          </div>
        )}

        {/* Pending tasks */}
        {pending.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              К выполнению · {pending.length}
            </h2>
            <div className="space-y-2">
              {pending.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleDone}
                  onMove={moveToTomorrow}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </section>
        )}

        {/* Done tasks */}
        {done.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Выполнено · {done.length}
            </h2>
            <div className="space-y-2">
              {done.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleDone}
                  onMove={moveToTomorrow}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
