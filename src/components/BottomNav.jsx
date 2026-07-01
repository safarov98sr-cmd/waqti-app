import { useTheme } from '../ThemeContext'

const TABS = [
  {
    id: 'home',
    label: 'Главная',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1v-9.5z"
          stroke={active ? '#10B981' : 'var(--text-xmuted)'}
          strokeWidth="1.9"
          fill={active ? 'rgba(16,185,129,0.12)' : 'none'}
          strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'Планировщик',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3"
          stroke={active ? '#10B981' : 'var(--text-xmuted)'} strokeWidth="1.9"
          fill={active ? 'rgba(16,185,129,0.12)' : 'none'} />
        <path d="M7 4V2M17 4V2M3 9h18"
          stroke={active ? '#10B981' : 'var(--text-xmuted)'} strokeWidth="1.9" strokeLinecap="round" />
        <path d="M8 14l2 2 4-4"
          stroke={active ? '#10B981' : 'var(--text-xmuted)'} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Аналитика',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3"  y="13" width="4" height="8" rx="1.5" fill={active ? '#10B981' : 'var(--text-xmuted)'} />
        <rect x="10" y="9"  width="4" height="12" rx="1.5" fill={active ? '#10B981' : 'var(--text-xmuted)'} />
        <rect x="17" y="4"  width="4" height="17" rx="1.5" fill={active ? '#F59E0B' : 'var(--text-xmuted)'} />
      </svg>
    ),
  },
  {
    id: 'coach',
    label: 'Коуч',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke={active ? '#10B981' : 'var(--text-xmuted)'}
          strokeWidth="1.9"
          fill={active ? 'rgba(16,185,129,0.12)' : 'none'}
          strokeLinejoin="round" />
        <circle cx="9"  cy="10" r="1" fill={active ? '#10B981' : 'var(--text-xmuted)'} />
        <circle cx="12" cy="10" r="1" fill={active ? '#10B981' : 'var(--text-xmuted)'} />
        <circle cx="15" cy="10" r="1" fill={active ? '#10B981' : 'var(--text-xmuted)'} />
      </svg>
    ),
  },
  {
    id: 'materials',
    label: 'Материалы',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"
          stroke={active ? '#10B981' : 'var(--text-xmuted)'} strokeWidth="1.9" strokeLinecap="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
          stroke={active ? '#10B981' : 'var(--text-xmuted)'} strokeWidth="1.9"
          fill={active ? 'rgba(16,185,129,0.12)' : 'none'} strokeLinejoin="round"/>
        <path d="M8 7h8M8 11h6"
          stroke={active ? '#10B981' : 'var(--text-xmuted)'} strokeWidth="1.9" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--nav-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90"
            >
              {tab.icon(isActive)}
              <span className="text-[9px] font-semibold transition-colors"
                style={{ color: isActive ? '#10B981' : 'var(--text-xmuted)' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
