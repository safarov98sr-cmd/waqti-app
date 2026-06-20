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

export function useTasks(date = today()) {
  const { user }  = useAuth()
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const deviceId = getDeviceId()

  // Load tasks — migrate guest localStorage tasks to Supabase on first login
  useEffect(() => {
    if (!supabase) {
      setTasks(lsLoad(date))
      setLoading(false)
      return
    }

    setLoading(true)

    if (user) {
      const run = async () => {
        console.log('[useTasks] Loading for user:', user.id, 'date:', date)

        // Migrate any guest tasks that don't have a user_id yet
        const localTasks = lsLoad(date)
        const guestTasks = localTasks.filter(t => !t.user_id)
        if (guestTasks.length) {
          console.log('[useTasks] Migrating guest tasks:', guestTasks.length)
          const { error } = await supabase.from('tasks').upsert(
            guestTasks.map(t => ({ ...t, user_id: user.id })),
            { onConflict: 'id', ignoreDuplicates: true }
          )
          if (error) console.error('[useTasks] migrate error:', error.message)
        }

        // Load merged result from Supabase
        const { data, error } = await supabase
          .from('tasks').select('*').eq('date', date).eq('user_id', user.id).order('created_at')
        console.log('[useTasks] Supabase load result:', { data, error })
        const result = error ? lsLoad(date) : (data ?? [])
        setTasks(result)
        if (!error) lsSave(date, result)
        setLoading(false)
      }
      run()
    } else {
      supabase.from('tasks').select('*').eq('date', date).eq('device_id', deviceId).order('created_at')
        .then(({ data, error }) => {
          const result = error ? lsLoad(date) : (data ?? [])
          setTasks(result)
          if (!error) lsSave(date, result)
          setLoading(false)
        })
    }
  }, [date, user, deviceId])

  // Add
  const addTask = useCallback(async (title, priority = 'medium', prayerBlock = null) => {
    if (!title.trim()) return
    const task = {
      id: crypto.randomUUID(),
      device_id: deviceId,
      ...(user && { user_id: user.id }),
      title: title.trim(),
      priority,
      prayerBlock,
      done: false,
      date,
      created_at: new Date().toISOString(),
    }
    console.log('[useTasks] Adding task:', task)
    setTasks(prev => {
      const u = [...prev, task]
      lsSave(date, u)
      window.dispatchEvent(new CustomEvent('waqti:updated'))
      return u
    })
    if (supabase) {
      const { data, error } = await supabase.from('tasks').insert(task).select().single()
      if (error) {
        console.error('[useTasks] addTask Supabase error:', error.message, error.details, error.hint)
      } else {
        console.log('[useTasks] addTask saved to Supabase:', data)
        if (data) setTasks(prev => prev.map(t => t.id === task.id ? data : t))
      }
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
        .from('tasks')
        .update({ done: newDone, done_at: newDone ? now : null })
        .eq('id', id)
      if (error) console.error('[useTasks] toggleDone:', error.message)
    }
  }, [tasks, date])

  // Move to tomorrow
  const moveToTomorrow = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    setTasks(prev => {
      const u = prev.filter(t => t.id !== id)
      lsSave(date, u)
      window.dispatchEvent(new CustomEvent('waqti:updated'))
      return u
    })

    const tmr      = tomorrow()
    const tmrTasks = lsLoad(tmr)
    lsSave(tmr, [...tmrTasks, { ...task, date: tmr, done: false, moved_at: new Date().toISOString() }])

    if (supabase) {
      const { error } = await supabase
        .from('tasks')
        .update({ date: tmr, done: false })
        .eq('id', id)
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
