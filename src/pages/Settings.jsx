import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import IslamicPattern from '../components/IslamicPattern'

export default function Settings({ onBack }) {
  const { topics, setTopics, language, setLanguage, loading, saving, save } = useProfile()
  const [input, setInput] = useState('')
  const [saved, setSaved] = useState(false)

  const addTopic = () => {
    const t = input.trim()
    if (!t || topics.includes(t)) return
    setTopics(prev => [...prev, t])
    setInput('')
    setSaved(false)
  }

  const removeTopic = (t) => {
    setTopics(prev => prev.filter(x => x !== t))
    setSaved(false)
  }

  const handleSave = async () => {
    await save(topics, language)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-enter min-h-full" style={{ background: 'var(--bg-page)' }}>

      {/* Header */}
      <div className="relative overflow-hidden pt-12 pb-6 px-5"
        style={{ background: 'linear-gradient(160deg, var(--header-from) 0%, var(--header-to) 100%)' }}>
        <IslamicPattern />
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.15)', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-white">Настройки</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Профиль и предпочтения</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-28">

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-28 rounded-3xl animate-pulse" style={{ background: 'var(--bg-s1)' }} />)}
          </div>
        ) : (
          <>
            {/* ── Topics ── */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-xmuted)' }}>
                Темы для изучения
              </h2>
              <div className="rounded-3xl p-4 space-y-3"
                style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)' }}>
                {/* Input */}
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTopic()}
                    placeholder="Например: ИИ, история ислама..."
                    className="flex-1 text-sm outline-none bg-transparent task-input"
                    style={{ color: 'var(--text-h)', padding: '10px 14px', borderRadius: 14, border: '1.5px solid var(--card-border)', background: 'var(--bg-s1)' }}
                  />
                  <button
                    onClick={addTopic}
                    disabled={!input.trim()}
                    className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
                    style={{ background: '#10B981', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Tags */}
                {topics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {topics.map(t => (
                      <span key={t}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
                        {t}
                        <button
                          onClick={() => removeTopic(t)}
                          className="w-4 h-4 rounded-full flex items-center justify-center transition-all hover:bg-emerald-500/20"
                          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--text-xmuted)' }}>
                    Добавь темы которые тебе интересны
                  </p>
                )}
              </div>
            </section>

            {/* ── Language ── */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-xmuted)' }}>
                Язык материалов
              </h2>
              <div className="rounded-3xl p-4"
                style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)' }}>
                <div className="flex gap-2">
                  {[
                    { id: 'ru', label: '🇷🇺 Русский' },
                    { id: 'en', label: '🇬🇧 English' },
                  ].map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => { setLanguage(lang.id); setSaved(false) }}
                      className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                      style={language === lang.id
                        ? { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1.5px solid rgba(16,185,129,0.3)' }
                        : { background: 'var(--bg-s1)', color: 'var(--text-muted)', border: '1.5px solid transparent', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }
                      }>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Save button ── */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
              style={{
                background: saved ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#10B981,#059669)',
                color: saved ? '#10B981' : 'white',
                border: saved ? '1.5px solid rgba(16,185,129,0.3)' : 'none',
                boxShadow: saved ? 'none' : '0 4px 16px rgba(16,185,129,0.3)',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}>
              {saving ? 'Сохраняем...' : saved ? '✓ Сохранено' : 'Сохранить'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
