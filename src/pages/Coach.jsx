import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import IslamicPattern from '../components/IslamicPattern'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const SYSTEM_PROMPT =
  'Ты коуч по продуктивности в приложении Waqti. Помогай планировать день и достигать целей. Отвечай кратко, дружелюбно. Не более 3-4 предложений.'

const SUGGESTIONS = [
  'Как лучше планировать день?',
  'Помоги составить план дня',
  'Мотивируй меня',
]

export default function Coach() {
  const { user, signOut } = useAuth()
  const [messages, setMessages] = useState([])
  const [history,  setHistory]  = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const newHistory = [...history, { role: 'user', content: msg }]
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)
    setHistory(newHistory)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `HTTP ${response.status}`)
      }

      const data  = await response.json()
      const reply = data.content?.[0]?.text || 'Пустой ответ'

      setHistory(prev => [...prev, { role: 'assistant', content: reply }])
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch (e) {
      console.error('[Coach] Anthropic error:', e)
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: `Ошибка: ${e?.message || 'Неизвестная ошибка'}`, error: true },
      ])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-full flex flex-col page-enter" style={{ background: 'var(--bg-page)' }}>

      {/* Header */}
      <div className="relative overflow-hidden pt-12 pb-6 px-5 flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, var(--header-from) 0%, var(--header-to) 100%)' }}>
        <IslamicPattern />
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white">Коуч</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            ИИ-помощник по продуктивности
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 space-y-3">

        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-6 pb-4">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10a9.96 9.96 0 0 1-5.39-1.57L2 22l1.57-4.61A9.96 9.96 0 0 1 2 12 10 10 0 0 1 12 2z"/>
                <path d="M8 12h.01M12 12h.01M16 12h.01"/>
              </svg>
            </div>
            <p className="text-sm font-semibold mb-1 text-center" style={{ color: 'var(--text-h)' }}>
              Привет! Я твой коуч по продуктивности
            </p>
            <p className="text-xs text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              Помогу спланировать день и достичь целей
            </p>
            <div className="w-full space-y-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
                  style={{
                    background: 'var(--bg-s1)',
                    border: '1.5px solid var(--card-border)',
                    color: 'var(--text-body)',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={m.role === 'user'
                ? { background: '#10B981', color: 'white', borderBottomRightRadius: 6 }
                : {
                    background: m.error ? 'rgba(239,68,68,0.1)' : 'var(--card-bg)',
                    border: `1px solid ${m.error ? 'rgba(239,68,68,0.2)' : 'var(--card-border)'}`,
                    color: m.error ? '#EF4444' : 'var(--text-body)',
                    borderBottomLeftRadius: 6,
                  }
              }>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderBottomLeftRadius: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: '#10B981', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Account section */}
      <div className="px-4 pb-2 space-y-2">
        {user ? (
          <>
            <div className="rounded-2xl px-4 py-3"
              style={{ background: 'var(--bg-s1)', border: '1px solid var(--card-border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                style={{ color: 'var(--text-xmuted)' }}>Аккаунт</p>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-h)' }}>
                {user.email}
              </p>
            </div>
            <button onClick={signOut}
              className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.18)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
              Выйти из аккаунта
            </button>
          </>
        ) : (
          <button onClick={() => window.dispatchEvent(new CustomEvent('waqti:show-auth'))}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
            Войти / Зарегистрироваться
          </button>
        )}
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 flex-shrink-0 px-4 pt-2 pb-[76px]"
        style={{ background: 'var(--bg-page)', borderTop: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Написать коучу..."
            disabled={loading}
            className="flex-1 text-sm outline-none coach-input"
            style={{
              color: 'var(--text-h)',
              padding: '12px 16px',
              borderRadius: '16px',
              border: '1.5px solid var(--card-border)',
              background: 'var(--bg-s1)',
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,#10B981,#059669)',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}
