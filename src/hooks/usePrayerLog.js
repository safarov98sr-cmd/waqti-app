import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth }  from '../lib/AuthContext'

const todayKey = () => new Date().toISOString().split('T')[0]
const lsKey    = (date) => `pd_${date}`

function lsRead(date) {
  try { return JSON.parse(localStorage.getItem(lsKey(date)) ?? '{}') } catch { return {} }
}
function lsWrite(date, done) {
  localStorage.setItem(lsKey(date), JSON.stringify(done))
}

export function usePrayerLog(date = todayKey()) {
  const { user } = useAuth()
  const [donePrayers, setDonePrayers] = useState({})

  // Load on mount / when auth changes
  useEffect(() => {
    if (user && supabase) {
      supabase
        .from('prayer_logs')
        .select('prayer_name, completed')
        .eq('user_id', user.id)
        .eq('prayer_date', date)
        .then(({ data, error }) => {
          if (error) {
            console.error('[usePrayerLog] load:', error.message)
            setDonePrayers(lsRead(date))
            return
          }
          const done = {}
          data?.forEach(r => { done[r.prayer_name] = !!r.completed })
          setDonePrayers(done)
          lsWrite(date, done) // keep localStorage in sync for analytics
        })
    } else {
      setDonePrayers(lsRead(date))
    }
  }, [user, date])

  const togglePrayer = useCallback(async (prayerName) => {
    const prev    = donePrayers
    const newVal  = !prev[prayerName]
    const newDone = { ...prev, [prayerName]: newVal }

    // Optimistic UI update + always write localStorage (analytics reads it)
    setDonePrayers(newDone)
    lsWrite(date, newDone)
    window.dispatchEvent(new CustomEvent('waqti:updated'))

    if (user && supabase) {
      const { error } = await supabase
        .from('prayer_logs')
        .upsert(
          {
            user_id:      user.id,
            prayer_name:  prayerName,
            prayer_date:  date,
            completed:    newVal,
            completed_at: newVal ? new Date().toISOString() : null,
          },
          { onConflict: 'user_id,prayer_name,prayer_date' }
        )

      if (error) {
        console.error('[usePrayerLog] upsert:', error.message)
        // Roll back on failure and re-sync analytics
        setDonePrayers(prev)
        lsWrite(date, prev)
        window.dispatchEvent(new CustomEvent('waqti:updated'))
      }
    }
  }, [user, date, donePrayers])

  return { donePrayers, togglePrayer }
}
