import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

/**
 * Header — the app's name, and the register it is painted in.
 *
 * Nothing else lives here. Each screen carries its own back affordance
 * because the journey pages hide this bar entirely, and a control that
 * disappears halfway through a tour is worse than one that was never there.
 */
export default function AppHeader() {
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-[900] flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 backdrop-blur-md"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        background: 'var(--app-chrome)',
      }}
    >
      <button
        onClick={() => navigate('/')}
        className="flex min-w-0 cursor-pointer items-center gap-2.5 text-left"
        aria-label="ไปหน้าแรก"
      >
        <img src="/logo.svg" alt="" className="h-9 w-9 shrink-0" />
        <span className="min-w-0">
          <span className="block truncate text-[17px] font-semibold leading-tight text-white max-[380px]:text-[15px]">
            กาลวัฒ
          </span>
          <span className="block truncate text-[11px] leading-tight text-lavender300 max-[360px]:hidden">
            เที่ยวของจริง ให้คนที่นั่นเล่าเอง
          </span>
        </span>
      </button>

      <ThemeToggle />
    </header>
  )
}
