import { useState, useEffect, useRef } from 'react'

const ADVANCE_MINS = 15

function getPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function usePrayerNotifications(prayers) {
  const [permission, setPermission] = useState(getPermission)
  const timerIds = useRef([])

  const requestPermission = async () => {
    if (!('Notification' in window)) return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  useEffect(() => {
    if (permission !== 'granted' || !prayers.length) return

    // Clear any previously scheduled timers
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []

    const now   = new Date()
    const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000

    prayers.forEach(prayer => {
      const notifyMs = (prayer.mins - ADVANCE_MINS) * 60000
      // If time already passed today — schedule for tomorrow
      const delayMs = notifyMs > nowMs
        ? notifyMs - nowMs
        : notifyMs + 24 * 3600000 - nowMs

      const id = setTimeout(() => {
        if (Notification.permission !== 'granted') return
        try {
          new Notification(`${prayer.icon} ${prayer.ru} через ${ADVANCE_MINS} минут`, {
            body: `Время намаза: ${prayer.time}`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `prayer-${prayer.key}`,
            renotify: true,
          })
        } catch (e) {
          console.warn('[notifications] failed:', e)
        }
      }, delayMs)

      timerIds.current.push(id)
    })

    return () => {
      timerIds.current.forEach(clearTimeout)
      timerIds.current = []
    }
  }, [prayers, permission])

  return { permission, requestPermission }
}
