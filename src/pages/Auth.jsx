import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import IslamicPattern from '../components/IslamicPattern'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Auth({ onSkip }) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    const { error: err } = await signInWithGoogle()
    if (err) {
      setError('Не удалось войти через Google. Попробуй ещё раз.')
      setLoading(false)
    }
    // On success: browser redirects to Google → back to app.waqtiai.app
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-5 py-10"
      style={{ background: 'linear-gradient(160deg,#060E1A 0%,#0A1628 55%,#064E3B 100%)' }}>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <IslamicPattern />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5"
            style={{
              background: 'rgba(16,185,129,0.18)',
              border: '1.5px solid rgba(16,185,129,0.35)',
              boxShadow: '0 0 40px rgba(16,185,129,0.2)',
            }}>
            ✦
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Waqti</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            ИИ-планировщик для мусульман
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-7"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}>

          <p className="text-center text-sm font-medium mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Войди чтобы синхронизировать данные между устройствами
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
            style={{
              background: 'white',
              color: '#1F2937',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}>
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Перенаправление...' : 'Войти через Google'}
          </button>

          {/* Error */}
          {error && (
            <p className="mt-4 text-xs text-center px-3 py-2.5 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          {/* Features list */}
          <div className="mt-6 space-y-2">
            {[
              'Данные не потеряются при переустановке',
              'Доступ с любого устройства',
              'Месячная аналитика',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l1.5 1.5 3.5-3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skip */}
        <button onClick={onSkip}
          className="w-full mt-5 py-3 text-sm font-medium text-center transition-all"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
          Продолжить без регистрации →
        </button>
      </div>
    </div>
  )
}
