import { useState, useEffect, useCallback } from 'react'

const PRAYERS = [
  { key: 'Fajr',    ru: 'Фаджр',  icon: '🌙' },
  { key: 'Dhuhr',   ru: 'Зухр',   icon: '☀️'  },
  { key: 'Asr',     ru: 'Аср',    icon: '🌤️' },
  { key: 'Maghrib', ru: 'Магриб', icon: '🌅' },
  { key: 'Isha',    ru: 'Иша',    icon: '⭐'  },
]

const toMins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const todayKey = () => new Date().toISOString().split('T')[0]
const cacheKey = (lat, lon) => `pt_${lat.toFixed(2)}_${lon.toFixed(2)}_${todayKey()}`
const MOSCOW = { lat: 55.7558, lon: 37.6173 }

function nowSecs() {
  const d = new Date()
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
}

function formatCountdown(totalSecs) {
  if (totalSecs <= 0) return '00:00:00'
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function usePrayerTimes() {
  const [prayers,     setPrayers]    = useState([])
  const [loading,     setLoading]    = useState(true)
  const [locError,    setLocError]   = useState(null)
  const [nextPrayer,  setNextPrayer] = useState(null)
  const [prevPrayer,  setPrevPrayer] = useState(null)
  const [countdown,   setCountdown]  = useState('--:--:--')
  const [ringPct,     setRingPct]    = useState(0)
  const [tick,        setTick]       = useState(0)
  const [cityName,    setCityName]   = useState('')

  // 1-second tick for real-time countdown
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1_000)
    return () => clearInterval(id)
  }, [])

  // Fetch prayer times from Aladhan API with localStorage cache
  useEffect(() => {
    const fetchTimes = async (loc) => {
      const ck = cacheKey(loc.lat, loc.lon)
      const cached = localStorage.getItem(ck)
      if (cached) {
        setPrayers(JSON.parse(cached))
        setLoading(false)
        return
      }
      try {
        const ts = Math.floor(Date.now() / 1000)
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${ts}?latitude=${loc.lat}&longitude=${loc.lon}&method=3`
        )
        const json = await res.json()
        const timings = json.data.timings
        const meta    = json.data.meta
        const parsed  = PRAYERS.map(p => ({
          ...p,
          time: timings[p.key],
          mins: toMins(timings[p.key]),
        }))
        setCityName(meta?.timezone?.split('/')[1]?.replace('_', ' ') ?? '')
        setPrayers(parsed)
        localStorage.setItem(ck, JSON.stringify(parsed))
        setLoading(false)
      } catch {
        setLocError('Ошибка загрузки. Показываем Москву.')
        setLoading(false)
      }
    }

    if (!navigator.geolocation) {
      setLocError('Геолокация недоступна — показываем Москву.')
      fetchTimes(MOSCOW)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => fetchTimes({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        setLocError('Нет доступа к геолокации — показываем Москву.')
        fetchTimes(MOSCOW)
      },
      { timeout: 7000, maximumAge: 3_600_000 }
    )
  }, [])

  // Recompute next prayer + countdown + ring every second
  useEffect(() => {
    if (!prayers.length) return
    const ns = nowSecs()
    const nmins = Math.floor(ns / 60)

    const nextIdx  = prayers.findIndex(p => p.mins > nmins)
    const next     = nextIdx >= 0 ? prayers[nextIdx] : prayers[0]
    const prevIdx  = nextIdx > 0 ? nextIdx - 1 : prayers.length - 1
    const prev     = prayers[prevIdx]

    setNextPrayer(next)
    setPrevPrayer(prev)

    // Countdown in seconds
    let diffSecs = next.mins * 60 - ns
    if (diffSecs < 0) diffSecs += 24 * 3600
    setCountdown(formatCountdown(diffSecs))

    // Ring progress: how far between prev and next prayer
    const prevSecs = prev.mins * 60
    const nextSecs = next.mins > prev.mins ? next.mins * 60 : next.mins * 60 + 24 * 3600
    const totalSecs = nextSecs - prevSecs
    const elapsed = ns - prevSecs
    setRingPct(Math.min(1, Math.max(0, elapsed / totalSecs)))
  }, [prayers, tick])

  // Prayer done state (per-day localStorage)
  const doneKey = () => `pd_${todayKey()}`
  const [donePrayers, setDonePrayers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(doneKey()) ?? '{}') } catch { return {} }
  })

  const togglePrayer = useCallback((key) => {
    setDonePrayers(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(doneKey(), JSON.stringify(next))
      window.dispatchEvent(new CustomEvent('waqti:updated'))
      return next
    })
  }, [])

  // Time blocks between prayers
  const timeBlocks = prayers.length
    ? prayers.map((p, i) => {
        const nxt = prayers[i + 1]
        if (!nxt) return null
        const diff = nxt.mins - p.mins
        const h = Math.floor(diff / 60), m = diff % 60
        return { from: p, to: nxt, dur: h > 0 ? `${h}ч ${m}м` : `${m}м`, diffMins: diff }
      }).filter(Boolean)
    : []

  return {
    prayers, loading, locError, nextPrayer, prevPrayer,
    countdown, ringPct, donePrayers, togglePrayer,
    timeBlocks, cityName,
  }
}
