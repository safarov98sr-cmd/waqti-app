import { useState, useEffect } from 'react'

const WEEKDAY_SHORT = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
const WEEKDAY_FULL  = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота']

const PRAYER_BLOCKS = [
  { id: 'fajr_dhuhr',   label: 'Фаджр — Зухр',  icon: '🌙' },
  { id: 'dhuhr_asr',    label: 'Зухр — Аср',     icon: '☀️' },
  { id: 'asr_maghrib',  label: 'Аср — Магриб',   icon: '🌤️' },
  { id: 'maghrib_isha', label: 'Магриб — Иша',   icon: '🌅' },
]

function lsJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? null) ?? fallback }
  catch { return fallback }
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if ([2,3,4].includes(m10) && ![12,13,14].includes(m100)) return few
  return many
}

function compute() {
  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const days     = []

  for (let i = 29; i >= 0; i--) {
    const d       = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    const tasks   = lsJSON(`tasks_${dateStr}`, [])
    const prayers = lsJSON(`pd_${dateStr}`, {})

    const prayersDone = Object.values(prayers).filter(Boolean).length
    const taskTotal   = tasks.length
    const taskDone    = tasks.filter(t => t.done).length
    const taskPct     = taskTotal > 0 ? Math.round(taskDone / taskTotal * 100) : null

    const movedTasks = tasks.filter(t => t.moved_at)
    const pmMoves    = movedTasks.filter(t => new Date(t.moved_at).getHours() >= 12).length

    days.push({
      date: dateStr, isToday: dateStr === todayStr,
      weekday: d.getDay(),
      hasData: taskTotal > 0 || prayersDone > 0,
      taskTotal, taskDone, taskPct,
      prayersDone,
      pmMoves, amMoves: movedTasks.length - pmMoves,
      tasks,
    })
  }

  const todayDay     = days[days.length - 1]
  const daysWithData = days.filter(d => d.hasData).length
  const isEmpty      = daysWithData === 0

  // ── Today ──
  const todayPrayers = todayDay.prayersDone
  const todayTasks   = { done: todayDay.taskDone, total: todayDay.taskTotal }

  // ── 7-day window ──
  const week7 = days.slice(-7)

  // Prayer calendar (7-day bars)
  const prayerCalendar = week7.map(d => ({
    label:   WEEKDAY_SHORT[d.weekday],
    done:    d.prayersDone,
    isToday: d.isToday,
    hasData: d.hasData,
  }))

  // Task completion bars (pct per day)
  const taskWeekBars = week7.map(d => ({
    label:   WEEKDAY_SHORT[d.weekday],
    pct:     d.taskPct ?? 0,
    isToday: d.isToday,
    hasData: d.hasData,
  }))

  // Week-over-week task trend
  const last7      = week7.filter(d => d.taskPct !== null)
  const prev7      = days.slice(-14, -7).filter(d => d.taskPct !== null)
  const avg7       = last7.length ? Math.round(last7.reduce((s,d) => s + d.taskPct, 0) / last7.length) : 0
  const avgP7      = prev7.length ? Math.round(prev7.reduce((s,d) => s + d.taskPct, 0) / prev7.length) : 0
  const trendDelta = avg7 - avgP7

  // Best weekday by task completion
  const wdData = Array.from({length:7}, () => ({sum:0, cnt:0}))
  days.forEach(d => {
    if (d.taskPct !== null) { wdData[d.weekday].sum += d.taskPct; wdData[d.weekday].cnt++ }
  })
  let bestDay = -1, bestDayPct = 0
  wdData.forEach((w, i) => {
    if (w.cnt >= 2) {
      const avg = Math.round(w.sum / w.cnt)
      if (avg > bestDayPct) { bestDayPct = avg; bestDay = i }
    }
  })

  // Prayer streak: consecutive days ending today with >= 3 prayers
  let prayerStreak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].prayersDone >= 3) prayerStreak++
    else break
  }

  // Most productive prayer block
  const blockCounts = {}
  days.forEach(d => {
    d.tasks.forEach(t => {
      if (t.done && t.prayerBlock) {
        blockCounts[t.prayerBlock] = (blockCounts[t.prayerBlock] ?? 0) + 1
      }
    })
  })
  let bestBlock = null, bestBlockCount = 0
  PRAYER_BLOCKS.forEach(b => {
    if ((blockCounts[b.id] ?? 0) > bestBlockCount) {
      bestBlockCount = blockCounts[b.id]
      bestBlock = b
    }
  })

  // Move-time pattern
  const totalPm    = days.reduce((s,d) => s + d.pmMoves, 0)
  const totalAm    = days.reduce((s,d) => s + d.amMoves, 0)
  const totalMoves = totalPm + totalAm

  // ── Insights ──
  const insights = []
  if (bestDay >= 0) {
    insights.push({ icon: '📅', text: `Твой самый продуктивный день — ${WEEKDAY_FULL[bestDay]} (${bestDayPct}%)`, type: 'positive' })
  }
  if (totalMoves >= 3 && totalPm > totalAm) {
    insights.push({ icon: '🌙', text: 'Ты чаще переносишь задачи во второй половине дня', type: 'warning' })
  }
  if (prayerStreak >= 2) {
    insights.push({
      icon: '🕌',
      text: `${prayerStreak} ${plural(prayerStreak,'день','дня','дней')} подряд с намазами — Маша Аллах!`,
      type: 'positive',
    })
  }
  if (prev7.length > 0 && Math.abs(trendDelta) > 5) {
    insights.push(trendDelta > 0
      ? { icon: '📈', text: `Продуктивность выросла на ${trendDelta}% за неделю`, type: 'positive' }
      : { icon: '📉', text: `Продуктивность снизилась на ${Math.abs(trendDelta)}% — попробуй меньше задач`, type: 'warning' }
    )
  }
  if (insights.length === 0 && !isEmpty) {
    insights.push({ icon: '✨', text: 'Продолжай отмечать задачи — инсайты появятся скоро', type: 'neutral' })
  }

  return {
    isEmpty,
    todayPrayers, todayTasks,
    prayerCalendar, taskWeekBars,
    trendDelta, avg7,
    bestDay, bestDayPct,
    bestBlock, bestBlockCount,
    prayerStreak, insights,
    daysWithData,
    showUpgradeBanner: daysWithData >= 7,
  }
}

export function useAnalytics() {
  const [data, setData] = useState(compute)

  useEffect(() => {
    const refresh = () => setData(compute())
    window.addEventListener('waqti:updated', refresh)
    // Fallback poll — reduced from 3s to 15s; waqti:updated handles real-time
    const id = setInterval(refresh, 15_000)
    return () => {
      window.removeEventListener('waqti:updated', refresh)
      clearInterval(id)
    }
  }, [])

  return data
}
