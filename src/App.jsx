import { useState }    from 'react'
import { ThemeProvider } from './ThemeContext'
import Home     from './pages/Home'
import Tasks    from './pages/Tasks'
import Progress from './pages/Progress'
import BottomNav from './components/BottomNav'

function CoachPlaceholder() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg-page)' }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.2)' }}>
        ✦
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-h)' }}>
        ИИ-коуч
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Персональный помощник скоро появится здесь. Он будет понимать твой ритм жизни и помогать расти.
      </p>
      <span className="mt-5 text-xs font-bold px-4 py-2 rounded-full"
        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
        Скоро · Q3 2026
      </span>
    </div>
  )
}

const PAGES = {
  home:     Home,
  tasks:    Tasks,
  progress: Progress,
  coach:    CoachPlaceholder,
}

function AppInner() {
  const [page, setPage] = useState('home')
  const Page = PAGES[page] ?? Home

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--outer-bg)' }}>
      <div className="relative w-full max-w-[430px] h-screen overflow-hidden flex flex-col">
        {/* Scrollable page area */}
        <div className="flex-1 overflow-y-auto scroll-hidden pb-nav" style={{ background: 'var(--bg-page)' }}>
          <Page key={page} />
        </div>

        {/* Fixed bottom nav */}
        <BottomNav active={page} onChange={setPage} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
