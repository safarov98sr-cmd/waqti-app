import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import IslamicPattern from '../components/IslamicPattern'

function InputField({ type, value, onChange, placeholder, onKeyDown }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'new-password'}
      className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'white',
      }}
      onFocus={e => { e.target.style.border = '1px solid rgba(16,185,129,0.5)' }}
      onBlur={e =>  { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
    />
  )
}

function translateError(msg = '') {
  if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) return 'Неверный email или пароль'
  if (msg.includes('already registered') || msg.includes('already been registered')) return 'Этот email уже зарегистрирован'
  if (msg.includes('Password should')) return 'Пароль минимум 6 символов'
  if (msg.includes('valid email')) return 'Введи корректный email'
  if (msg.includes('rate limit')) return 'Слишком много попыток. Подожди немного'
  return msg
}

export default function Auth({ onSkip }) {
  const { signIn, signUp } = useAuth()
  const [mode,     setMode]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const switchMode = (m) => { setMode(m); setError(''); setSuccess(false) }

  const handleSubmit = async () => {
    setError('')
    if (!email.trim() || !password) { setError('Заполни все поля'); return }
    if (mode === 'register' && password !== confirm) { setError('Пароли не совпадают'); return }
    if (password.length < 6) { setError('Пароль минимум 6 символов'); return }

    setLoading(true)
    const { error: err } = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password)
    setLoading(false)

    if (err) {
      setError(translateError(err.message))
    } else if (mode === 'register') {
      setSuccess(true)
    }
    // login success → onAuthStateChange in AuthContext updates user → App hides Auth
  }

  const onEnter = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-5 py-10"
      style={{ background: 'linear-gradient(160deg,#060E1A 0%,#0A1628 55%,#064E3B 100%)' }}>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <IslamicPattern />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{
              background: 'rgba(16,185,129,0.18)',
              border: '1.5px solid rgba(16,185,129,0.35)',
              boxShadow: '0 0 32px rgba(16,185,129,0.2)',
            }}>
            ✦
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">Waqti</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            ИИ-планировщик для мусульман
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-3xl p-6"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}>

          {success ? (
            /* Email confirmation state */
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-lg font-black text-white mb-2">Проверь почту</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Мы отправили письмо на <span className="text-white font-semibold">{email}</span>.
                Подтверди email и войди.
              </p>
              <button onClick={() => switchMode('login')}
                className="text-sm font-bold px-6 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                Войти
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex gap-1 p-1 rounded-2xl mb-5"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                {[
                  { id: 'login',    label: 'Войти'        },
                  { id: 'register', label: 'Регистрация'  },
                ].map(m => (
                  <button key={m.id} onClick={() => switchMode(m.id)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                    style={mode === m.id
                      ? { background: '#10B981', color: 'white', boxShadow: '0 2px 12px rgba(16,185,129,0.35)' }
                      : { color: 'rgba(255,255,255,0.4)' }
                    }>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Form fields */}
              <div className="space-y-3 mb-4">
                <InputField type="email"    value={email}    onChange={setEmail}    placeholder="Email"           onKeyDown={onEnter} />
                <InputField type="password" value={password} onChange={setPassword} placeholder="Пароль"          onKeyDown={mode === 'login' ? onEnter : undefined} />
                {mode === 'register' && (
                  <InputField type="password" value={confirm} onChange={setConfirm} placeholder="Повтори пароль" onKeyDown={onEnter} />
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 px-4 py-2.5 rounded-2xl text-xs text-center"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>
                {loading
                  ? '...'
                  : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>
            </>
          )}
        </div>

        {/* Skip */}
        {!success && (
          <button onClick={onSkip}
            className="w-full mt-5 py-3 text-sm font-medium text-center transition-opacity"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
            Продолжить без регистрации →
          </button>
        )}
      </div>
    </div>
  )
}
