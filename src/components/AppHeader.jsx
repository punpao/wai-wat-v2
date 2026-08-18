import { useNavigate } from 'react-router-dom'
import { storage } from '../lib/storage.js'
import { useStore } from '../lib/useStore.js'
import { useIsElder } from '../lib/role.js'
import { elderById } from '../data/elders.js'
import Icon from './Icon.jsx'

/**
 * Header + role switcher. The switcher is a demo convenience only —
 * there is no auth in this prototype and none is implied.
 */
export default function AppHeader() {
  const state = useStore()
  const navigate = useNavigate()
  const isElder = useIsElder()
  const elder = elderById(state.elderId)

  const swap = (role) => {
    storage.setRole(role)
    navigate(role === 'elder' ? '/elder' : '/map')
  }

  return (
    <header
      className={`sticky top-0 z-[900] flex items-center justify-between gap-3 px-4 py-3 backdrop-blur-md ${
        isElder
          ? 'border-b border-maroon900/10 bg-paper/92'
          : 'border-b border-white/10 bg-[#4A1A58]/78'
      }`}
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <img
          src="/logo.svg"
          alt=""
          width="40"
          height="40"
          className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-gold200/30"
        />
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

      <div
        role="group"
        aria-label="สลับบทบาท (สำหรับสาธิตเท่านั้น)"
        className={`flex shrink-0 items-center rounded-full p-1 ${
          isElder ? 'bg-maroon900/8' : 'bg-black/25 ring-1 ring-white/12'
        }`}
      >
        {[
          { id: 'user', label: 'ผู้สำรวจ', icon: 'compass' },
          { id: 'elder', label: 'ผู้สูงอายุ', icon: 'user' },
        ].map((r) => {
          const on = (r.id === 'elder') === isElder
          return (
            <button
              key={r.id}
              onClick={() => swap(r.id)}
              aria-pressed={on}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors duration-200 max-[380px]:gap-1 max-[380px]:px-2.5 max-[380px]:text-[12px] ${
                on
                  ? 'bg-coral500 text-white'
                  : isElder
                    ? 'text-maroon900/65 hover:text-maroon900'
                    : 'text-lavender300 hover:text-white'
              }`}
            >
              <Icon name={r.icon} size={16} />
              {r.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
