import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getDeviceId } from '../lib/deviceId'

const fmtDate = (d) => d.toISOString().split('T')[0]
const today    = () => fmtDate(new Date())
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return fmtDate(d) }

const lsKey  = (date) => `tasks_${date}`
const lsLoad = (date) => { try { return JSON.parse(localStorage.getItem(lsKey(date)) ?? '[]') } catch { return [] } }
const lsSave = (date, tasks) => localStorage.setItem(lsKey(date), JSON.stringify(tasks))

export function useTasks(date = today()) {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const deviceId = getDeviceId()

  // Load
  useEffect(() => {
    setLoading(true)
    if (supabase) {
      supabase
        .from('tasks')
        .select('*')
        .eq('device_id', deviceId)
        .eq('date', date)
        .order('created_at')
        .then(({ data, error }) => {
          const result = error ? lsLoad(date) : (data ?? [])
          setTasks(result)
          if (!error) lsSave(date, result)
          setLoading(false)
        })
    } else {
      setTasks(lsLoad(date))
      setLoading(false)
    }
  }, [date, deviceId])

  // Add
  const addTask = useCallback(async (title, priority = 'medium') => {
    if (!title.trim()) return
    const task = {
      id: crypto.randomUUID(),
      device_id: deviceId,
      title: title.trim(),
      priority,
      done: false,
      date,
      created_at: new Date().toISOString(),
    }
    const optimistic = (prev) => {
      const u = [...prev, task]
      lsSave(date, u)
      return u
    }
    setTasks(optimistic)
    if (supabase) {
      const { data } = await supabase.from('tasks').insert(task).select().single()
      if (data) setTasks(prev => prev.map(t => t.id === task.id ? data : t))
    }
  }, [date, deviceId])

  // Toggle done
  const toggleDone = useCallback(async (id) => {
    setTasks(prev => {
      const u = prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
      lsSave(date, u)
      return u
    })
    if (supabase) {
      const task = tasks.find(t => t.id === id)
      if (task) await supabase.from('tasks').update({ done: !task.done }).eq('id', id)
    }
  }, [tasks, date])

  // Move to tomorrow
  const moveToTomorrow = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    // Optimistically remove from today
    setTasks(prev => {
      const u = prev.filter(t => t.id !== id)
      lsSave(date, u)
      return u
    })
    // Add to tomorrow in localStorage
    const tmr = tomorrow()
    const tmrTasks = lsLoad(tmr)
    lsSave(tmr, [...tmrTasks, { ...task, date: tmr, done: false }])
    if (supabase) {
      await supabase.from('tasks').update({ date: tmr, done: false }).eq('id', id)
    }
  }, [tasks, date])

  // Delete
  const deleteTask = useCallback(async (id) => {
    setTasks(prev => {
      const u = prev.filter(t => t.id !== id)
      lsSave(date, u)
      return u
    })
    if (supabase) {
      await supabase.from('tasks').delete().eq('id', id)
    }
  }, [date])

  const stats = {
    total: tasks.length,
    done:  tasks.filter(t => t.done).length,
    pct:   tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0,
  }

  return { tasks, loading, addTask, toggleDone, moveToTomorrow, deleteTask, stats }
}
