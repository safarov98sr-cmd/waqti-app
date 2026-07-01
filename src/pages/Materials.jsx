import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useProfile } from '../hooks/useProfile'
import IslamicPattern from '../components/IslamicPattern'

const API_KEY  = import.meta.env.VITE_ANTHROPIC_API_KEY
const CACHE_PFX = 'waqti_materials_'
const todayKey  = () => CACHE_PFX + new Date().toISOString().split('T')[0]

function buildPrompt(topics, language) {
  const lang = language === 'ru' ? 'русский' : 'английский'
  return `Ты помощник по саморазвитию. Пользователь изучает: ${topics.join(', ')}.
Язык материалов: ${lang}.
Составь подборку на сегодня:
1. Один практический совет по каждой теме (2-3 предложения)
2. Одно конкретное упражнение которое можно сделать сегодня
3. Один ресурс для изучения (книга, сайт или инструмент) с кратким описанием
Отвечай структурированно, без лишних слов.`
}

async function fetchMaterials(topics, language) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: buildPrompt(topics, language) }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

/* ── Skeleton cards ── */
function Skeleton() {
  return (
    <div className="space-y-3">
      {[120, 90, 80].map((h, i) => (
        <div key={i} className="rounded-2xl animate-pulse"
          style={{ height: h, background: 'var(--bg-s1)' }} />
      ))}
    </div>
  )
}

export default function Materials() {
  const { topics, language, loading: profileLoading } = useProfile()
  const [content,  setContent]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const hasTopics = topics.length > 0

  // Load from cache or fetch on mount
  useEffect(() => {
    if (profileLoading || !hasTopics) return
    const cached = localStorage.getItem(todayKey())
    if (cached) { setContent(cached); return }
    generate()
  }, [profileLoading, hasTopics, topics.join(',')])  // eslint-disable-line

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const text = await fetchMaterials(topics, language)
      setContent(text)
      localStorage.setItem(todayKey(), text)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const refresh = () => {
    localStorage.removeItem(todayKey())
    generate()
  }

  return (
    <div className="page-enter min-h-full" style={{ background: 'var(--bg-page)' }}>

      {/* Header */}
      <div className="relative overflow-hidden pt-12 pb-6 px-5"
        style={{ background: 'linear-gradient(160deg, var(--header-from) 0%, var(--header-to) 100%)' }}>
        <IslamicPattern />
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Материалы</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Подборка на сегодня · ИИ
            </p>
          </div>
          {hasTopics && content && !loading && (
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
              </svg>
              Обновить
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-5 pb-28">

        {/* No topics state */}
        {!profileLoading && !hasTopics && (
          <div className="flex flex-col items-center pt-12 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-s1)', fontSize: 28 }}>
              📚
            </div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-h)' }}>
              Темы не заполнены
            </p>
            <p className="text-sm" style={{ color: 'var(--text-xmuted)' }}>
              Добавь темы в настройках профиля — ИИ составит персональную подборку
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('waqti:navigate', { detail: 'settings' }))}
              className="mt-5 px-5 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', boxShadow: '0 4px 16px rgba(16,185,129,0.3)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
              Открыть настройки
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {(profileLoading || loading) && <Skeleton />}

        {/* Error */}
        {error && (
          <div className="rounded-2xl px-4 py-3 mb-4"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: '#EF4444' }}>Ошибка загрузки</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{error}</p>
            <button onClick={generate}
              className="text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
              Попробовать снова
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && content && (
          <div className="materials-md space-y-3">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <div className="rounded-3xl px-4 pt-4 pb-3 mb-1"
                    style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)' }}>
                    <p className="text-base font-black" style={{ color: 'var(--text-h)' }}>{children}</p>
                  </div>
                ),
                h2: ({ children }) => (
                  <p className="text-[10px] font-bold uppercase tracking-wider pt-2 pb-1 px-1"
                    style={{ color: '#10B981' }}>{children}</p>
                ),
                h3: ({ children }) => (
                  <p className="text-xs font-bold uppercase tracking-wider pt-2 pb-1 px-1"
                    style={{ color: 'var(--text-xmuted)' }}>{children}</p>
                ),
                p: ({ children }) => (
                  <div className="rounded-2xl px-4 py-3"
                    style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{children}</p>
                  </div>
                ),
                ul: ({ children }) => (
                  <div className="rounded-2xl px-4 py-3 space-y-1.5"
                    style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)' }}>
                    <ul className="space-y-1.5">{children}</ul>
                  </div>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#10B981' }} />
                    <span className="leading-relaxed">{children}</span>
                  </li>
                ),
                ol: ({ children }) => (
                  <div className="rounded-2xl px-4 py-3"
                    style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)' }}>
                    <ol className="space-y-2 list-none">{children}</ol>
                  </div>
                ),
                strong: ({ children }) => (
                  <strong style={{ color: 'var(--text-h)', fontWeight: 700 }}>{children}</strong>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

      </div>
    </div>
  )
}
