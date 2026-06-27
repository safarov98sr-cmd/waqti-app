import { useState, useEffect } from 'react'
import { supabase }    from '../lib/supabase'
import { useAuth }     from '../lib/AuthContext'
import { getDeviceId } from '../lib/deviceId'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlB64ToUint8Array(b64) {
  const pad = '='.repeat((4 - b64.length % 4) % 4)
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

function prayerToUTC(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export function usePushNotifications(prayers) {
  const { user }  = useAuth()
  const deviceId  = getDeviceId()
  const [permission, setPermission] = useState(
    () => 'Notification' in window ? Notification.permission : 'unsupported'
  )

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') return

    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      if (supabase) {
        await supabase.from('push_subscriptions').upsert(
          { user_id: user?.id ?? null, device_id: deviceId, subscription: JSON.stringify(sub) },
          { onConflict: 'device_id' }
        )
      }
    } catch (e) {
      console.error('[push] subscribe:', e)
    }
  }

  // Save today's prayer UTC timestamps for server-side scheduling
  useEffect(() => {
    if (!prayers.length || !supabase) return
    const today = new Date().toISOString().split('T')[0]
    supabase.from('user_prayer_times').upsert(
      {
        user_id:     user?.id ?? null,
        device_id:   deviceId,
        prayer_date: today,
        fajr_utc:    prayerToUTC(prayers.find(p => p.key === 'Fajr')?.time),
        dhuhr_utc:   prayerToUTC(prayers.find(p => p.key === 'Dhuhr')?.time),
        asr_utc:     prayerToUTC(prayers.find(p => p.key === 'Asr')?.time),
        maghrib_utc: prayerToUTC(prayers.find(p => p.key === 'Maghrib')?.time),
        isha_utc:    prayerToUTC(prayers.find(p => p.key === 'Isha')?.time),
      },
      { onConflict: 'device_id,prayer_date' }
    )
  }, [prayers, user, deviceId])

  return { permission, subscribe }
}
