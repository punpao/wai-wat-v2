import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/useStore.js'
import { useIsElder } from '../lib/role.js'
import { elderById } from '../data/elders.js'
import { ElderAvatar } from './ElderSprite.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import Icon from './Icon.jsx'

/**
 * Header — who you are on the left, how it is painted on the right.
 *
 * The profile lives here rather than in the tab bar, which frees the bar
 * to be three slots wide and put AR scanning in its true centre. The role
 * switcher that used to sit on the right moved into each register's own
 * account screen (Profile / ElderHome), since it is an account action and
 * not a piece of persistent chrome.
 */
export default function AppHeader() {
  const state = useStore()
  const navigate = useNavigate()
  const isElder = useIsElder()
  const elder = elderById(state.elderId)

  return (
    <header
      className={`sticky top-0 z-[900] flex items-center justify-between gap-3 px-4 py-3 backdrop-blur-md ${
        isElder ? 'border-b border-maroon900/10 bg-paper/92' : 'border-b border-white/10'
      }`}
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        background: isElder ? undefined : 'var(--app-chrome)',
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          onClick={() => navigate(isElder ? '/elder' : '/profile')}
          aria-label={isElder ? 'ไปหน้าหลักของฉัน' : 'ไปหน้าโปรไฟล์ของฉัน'}
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full ring-2 ring-gold200/45 transition-transform duration-200 active:scale-95"
          style={{ background: 'var(--app-raised)' }}
        >
          {isElder ? (
            <ElderAvatar elder={elder} size={40} />
          ) : (
            <Icon name="user" size={21} className="text-gold200" />
          )}
        </button>

        <div className="min-w-0">
          <p
            className={`truncate text-[17px] font-semibold leading-tight max-[380px]:text-[15px] ${
              isElder ? 'text-maroon900' : 'text-white'
            }`}
          >
            วัยวัฒน์
          </p>
          <p
            className={`truncate text-[11px] leading-tight max-[360px]:hidden ${
              isElder ? 'text-maroon900/60' : 'text-lavender300'
            }`}
          >
            {isElder ? elder?.name : 'เส้นทางภูมิปัญญา'}
          </p>
        </div>
      </div>

      <ThemeToggle />
    </header>
  )
}
