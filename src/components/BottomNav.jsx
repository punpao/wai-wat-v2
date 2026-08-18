import { NavLink } from 'react-router-dom'
import { useStore } from '../lib/useStore.js'
import Icon from './Icon.jsx'

const USER_TABS = [
  { to: '/map', label: 'แผนที่', icon: 'map' },
  { to: '/profile', label: 'โปรไฟล์', icon: 'user' },
]

/* Elder register: never more than three tabs, always with a written label. */
const ELDER_TABS = [
  { to: '/elder', label: 'หน้าหลัก', icon: 'home' },
  { to: '/elder/clips', label: 'คลิปของฉัน', icon: 'clips' },
  { to: '/elder/redeem', label: 'แลกแต้ม', icon: 'gift' },
]

export default function BottomNav() {
  const state = useStore()
  const isElder = state.role === 'elder'
  const tabs = isElder ? ELDER_TABS : USER_TABS

  return (
    <nav
      aria-label="เมนูหลัก"
      className={`fixed inset-x-0 bottom-0 z-[950] backdrop-blur-lg ${
        isElder ? 'border-t border-maroon900/12 bg-paper/95' : 'border-t border-white/10 bg-[#3E1249]/88'
      }`}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.to === '/elder'}
              className={({ isActive }) =>
                `flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-colors duration-200 ${
                  isActive
                    ? isElder
                      ? 'bg-violet800 text-white'
                      : 'text-gold200'
                    : isElder
                      ? 'text-maroon900/65 hover:text-maroon900'
                      : 'text-lavender300 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={t.icon} size={isElder ? 26 : 23} stroke={isActive ? 2.1 : 1.7} />
                  <span className={`${isElder ? 'text-[15px]' : 'text-[11.5px]'} font-semibold leading-none`}>
                    {t.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
