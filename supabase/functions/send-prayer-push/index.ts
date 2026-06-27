import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @deno-types="npm:@types/web-push"
import webpush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

webpush.setVapidDetails('mailto:safarov98sr@gmail.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const PRAYER_LABELS: Record<string, string> = {
  fajr_utc:    '🌙 Фаджр',
  dhuhr_utc:   '☀️ Зухр',
  asr_utc:     '🌤️ Аср',
  maghrib_utc: '🌅 Магриб',
  isha_utc:    '⭐ Иша',
}

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const now      = Date.now()
  const today    = new Date().toISOString().split('T')[0]

  // Load all prayer times for today
  const { data: rows, error } = await supabase
    .from('user_prayer_times')
    .select('*')
    .eq('prayer_date', today)

  if (error) return new Response(error.message, { status: 500 })
  if (!rows?.length) return new Response('no prayer data today')

  let sent = 0

  for (const row of rows) {
    for (const [col, label] of Object.entries(PRAYER_LABELS)) {
      const utcStr: string | null = row[col]
      if (!utcStr) continue

      const diff = new Date(utcStr).getTime() - now
      // Window: 14min 30s — 15min 30s from now
      if (diff < 14.5 * 60_000 || diff > 15.5 * 60_000) continue

      const prayerTime = utcStr.slice(11, 16) // HH:MM (UTC, approximate)

      // Find push subscription for this device or user
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .or(
          row.user_id
            ? `device_id.eq.${row.device_id},user_id.eq.${row.user_id}`
            : `device_id.eq.${row.device_id}`
        )

      for (const s of subs ?? []) {
        try {
          await webpush.sendNotification(
            JSON.parse(s.subscription),
            JSON.stringify({
              title: `${label} через 15 минут`,
              body:  `Время намаза: ${row[col.replace('_utc', '')!] ?? prayerTime}`,
              tag:   col,
            })
          )
          sent++
        } catch (e) {
          console.error('[push] send failed:', e)
        }
      }
    }
  }

  return new Response(JSON.stringify({ sent, rows: rows.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
