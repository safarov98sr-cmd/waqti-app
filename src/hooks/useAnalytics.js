import { useMemo } from 'react'

const WEEKDAY_SHORT = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
const WEEKDAY_FULL  = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота']

function lsJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? null) ?? fallback }
  catch { return fallback }
}

function plural(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if ([2,3,4].includes(mod10) && ![12,13,14].includes(mod100)) return few
  return many
}

export function useAnalytics() {
  return useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const days = []

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]

      const tasks   = lsJSON(`tasks_${dateStr}`, [])
      const prayers = lsJSON(`pd_${dateStr}`, {})

      const prayersDone = Object.values(prayers).filter(Boolean).length
      const taskTotal   = tasks.length
      const taskDone    = tasks.filter(t => t.done).length
      const taskPct     = taskTotal > 0 ? Math.round(taskDone / taskTotal * 100) : null

      // Tasks that were moved to this day carry a moved_at timestamp
      const movedTasks = tasks.filter(t => t.moved_at)
      const pmMoves    = movedTasks.filter(t => new Date(t.moved_at).getHours() >= 12).length
      const amMoves    = movedTasks.length - pmMoves

      days.push({
        date: dateStr,
        isToday: dateStr === todayStr,
        weekday: d.getDay(),
        hasData: taskTotal > 0 || prayersDone > 0,
        taskTotal, taskDone, taskPct,
        prayersDone, pmMoves, amMoves,
      })
    }

    const daysWithData = days.filter(d => d.hasData).length

    // 7-day chart bars
    const weekBars = days.slice(-7).map(d => ({
      label:   WEEKDAY_SHORT[d.weekday],
      pct:     d.taskPct ?? 0,
      isToday: d.isToday,
      hasData: d.hasData,
    }))

    // Week-over-week trend
    const last7  = days.slice(-7).filter(d => d.taskPct !== null)
    const prev7  = days.slice(-14, -7).filter(d => d.taskPct !== null)
    const avg7   = last7.length ? Math.round(last7.reduce((s,d) => s + d.taskPct, 0) / last7.length) : 0
    const avgP7  = prev7.length ? Math.round(prev7.reduce((s,d) => s + d.taskPct, 0) / prev7.length) : 0
    const trendDelta = avg7 - avgP7

    // Best weekday (needs >= 2 data points)
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

    // Move-time pattern
    const totalPm    = days.reduce((s,d) => s + d.pmMoves, 0)
    const totalAm    = days.reduce((s,d) => s + d.amMoves, 0)
    const totalMoves = totalPm + totalAm

    // Build insights array
    const insights = []

    if (bestDay >= 0) {
      insights.push({
        icon: '📅',
        text: `Твой самый продуктивный день — ${WEEKDAY_FULL[bestDay]} (${bestDayPct}%)`,
        type: 'positive',
      })
    }

    if (totalMoves >= 3 && totalPm > totalAm) {
      insights.push({
        icon: '🌙',
        text: 'Ты чаще переносишь задачи во второй половине дня',
        type: 'warning',
      })
    }

    if (prayerStreak >= 2) {
      insights.push({
        icon: '🕌',
        text: `${prayerStreak} ${plural(prayerStreak,'день','дня','дней')} подряд с намазами — Маша Аллах!`,
        type: 'positive',
      })
    }

    if (prev7.length > 0 && Math.abs(trendDelta) > 5) {
      if (trendDelta > 0) {
        insights.push({
          icon: '📈',
          text: `Продуктивность выросла на ${trendDelta}% за неделю`,
          type: 'positive',
        })
      } else {
        insights.push({
          icon: '📉',
          text: `Продуктивность снизилась на ${Math.abs(trendDelta)}% — попробуй ставить меньше задач`,
          type: 'warning',
        })
      }
    }

    if (insights.length === 0) {
      insights.push({
        icon: '✨',
        text: 'Продолжай отмечать задачи — инсайты появятся через пару дней',
        type: 'neutral',
      })
    }

    return {
      daysWithData,
      weekBars,
      avg7,
      trendDelta,
      bestDay,
      bestDayPct,
      prayerStreak,
      insights,
      showUpgradeBanner: daysWithData >= 7,
    }
  }, [])
}
