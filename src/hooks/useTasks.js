import { useState, useEffect, useCallback } from 'react'
import { supabase }    from '../lib/supabase'
import { useAuth }     from '../lib/AuthContext'
import { getDeviceId } from '../lib/deviceId'

const fmtDate = (d) => d.toISOString().split('T')[0]
const today    = () => fmtDate(new Date())
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return fmtDate(d) }

const lsKey  = (date) => `tasks_${date}`
const lsLoad = (date) => { try { return JSON.parse(localStorage.getItem(lsKey(date)) ?? '[]') } catch { return [] } }
const lsSave = (date, tasks) => localStorage.setItem(lsKey(date), JSON.stringify(tasks))

// Normalize Supabase row to local format (table uses "completed", not "done")
const normalize = (row, localMap = new Map()) => {
  const local = localMap.get(row.id) ?? {}
  return {
    ...row,
    done:        row.completed ?? row.done ?? false,
    priority:    row.priority    ?? local.priority    ?? 'medium',
    prayerBlock: row.prayerBlock ?? row.prayer_block  ?? local.prayerBlock ?? null,
  }
}

// Only send columns that exist in the Supabase tasks table
const toRow = (task, userId) => ({
  id:         task.id,
  user_id:    userId,
  device_id:  task.device_id,
  title:      task.title,
  completed:  task.done ?? false,
  date:       task.date,
  created_at: task.created_at,
})

export function useTasks(date = today()) {
  const { user }  = useAuth()
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const deviceId = getDeviceId()

  useEffect(() => {
    // 1. Show localStorage tasks immediately — never leave user staring at empty screen
    const local = lsLoad(date)
    setTasks(local)
    setLoading(false)

    // 2. Sync with Supabase in background
    if (!supabase) return

    const sync = async () => {
      if (user) {
        // Migrate any local guest tasks (no user_id) to Supabase
        const guests = local.filter(t => !t.user_id)
        if (guests.length) {
          await supabase.from('tasks').upsert(
            guests.map(t => toRow(t, user.id)),
            { onConflict: 'id', ignoreDuplicates: true }
          )
        }

        // Fetch synced tasks from Supabase
        const { data, error } = await supabase
          .from('tasks').select('*').eq('date', date).eq('user_id', user.id).order('created_at')
        if (error) { console.error('[useTasks] sync error:', error.message); return }

        const localMap = new Map(local.map(t => [t.id, t]))
        const sbTasks  = (data ?? []).map(r => normalize(r, localMap))
        const sbIds    = new Set(sbTasks.map(t => t.id))

        // Keep unsynced local tasks visible
        const unsynced = local.filter(t => !sbIds.has(t.id))

        // Push unsynced tasks to Supabase
        if (unsynced.length) {
          supabase.from('tasks').upsert(
            unsynced.map(t => toRow({ ...t, user_id: user.id }, user.id)),
            { onConflict: 'id', ignoreDuplicates: true }
          ).then(({ error: e }) => { if (e) console.error('[useTasks] re-sync:', e.message) })
        }

        const result = [...sbTasks, ...unsynced].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )
        setTasks(result)
        lsSave(date, result)
      } else {
        // Guest: load from Supabase by device_id (update local if Supabase has more)
        const { data, error } = await supabase
          .from('tasks').select('*').eq('date', date).eq('device_id', deviceId).order('created_at')
        if (error) { console.error('[useTasks] sync error:', error.message); return }
        if (data?.length) {
          const result = data.map(r => normalize(r))
          setTasks(result)
          lsSave(date, result)
        }
      }
    }

    sync()
  }, [date, user, deviceId])

  // Add
  const addTask = useCallback(async (title, priority = 'medium', prayerBlock = null) => {
    if (!title.trim()) return
    const task = {
      id:          crypto.randomUUID(),
      device_id:   deviceId,
      user_id:     user?.id ?? null,
      title:       title.trim(),
      priority,
      prayerBlock,
      done:        false,
      date,
      created_at:  new Date().toISOString(),
    }
    setTasks(prev => {
      const u = [...prev, task]
      lsSave(date, u)
      window.dispatchEvent(new CustomEvent('waqti:updated'))
      return u
    })
    if (supabase) {
      const row = toRow(task, user?.id ?? task.device_id)
      const { error } = await supabase.from('tasks').insert(
        user ? row : { ...row, user_id: undefined }
      )
      if (error) console.error('[useTasks] addTask:', error.message, '| hint:', error.hint)
    }
  }, [date, deviceId, user])

  // Toggle done
  const toggleDone = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newDone = !task.done
    const now     = new Date().toISOString()

    setTasks(prev => {
      const u = prev.map(t =>
        t.id !== id ? t : { ...t, done: newDone, done_at: newDone ? now : null }
      )
      lsSave(date, u)
      window.dispatchEvent(new CustomEvent('waqti:updated'))
      return u
    })

    if (supabase) {
      const { error } = await supabase
        .from('tasks').update({ completed: newDone }).eq('id', id)
      if (error) console.error('[useTasks] toggleDone:', error.message)
    }
  }, [tasks, date])

  // Move to tomorrow
  const moveToTomorrow = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const tmr = tomorrow()

    setTasks(prev => {
      const u = prev.filter(t => t.id !== id)
      lsSave(date, u)
      window.dispatchEvent(new CustomEvent('waqti:updated'))
      return u
    })

    const tmrTasks = lsLoad(tmr)
    lsSave(tmr, [...tmrTasks, { ...task, date: tmr, done: false }])

    if (supabase) {
      const { error } = await supabase
        .from('tasks').update({ date: tmr, completed: false }).eq('id', id)
      if (error) console.error('[useTasks] moveToTomorrow:', error.message)
    }
  }, [tasks, date])

  // Delete
  const deleteTask = useCallback(async (id) => {
    setTasks(prev => {
      const u = prev.filter(t => t.id !== id)
      lsSave(date, u)
      window.dispatchEvent(new CustomEvent('waqti:updated'))
      return u
    })
    if (supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) console.error('[useTasks] deleteTask:', error.message)
    }
  }, [date])

  const stats = {
    total: tasks.length,
    done:  tasks.filter(t => t.done).length,
    pct:   tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0,
  }

  return { tasks, loading, addTask, toggleDone, moveToTomorrow, deleteTask, stats }
}
