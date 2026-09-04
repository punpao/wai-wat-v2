import { useNavigate } from 'react-router-dom'
import { storage } from '../lib/storage.js'
import { useIsElder } from '../lib/role.js'
import Icon from './Icon.jsx'

/**
 * สลับบทบาท — the demo's identity switch, which used to live in the header
 * until the theme toggle took that slot.
 *
 * An account screen is where it belonged anyway: there is no auth in this
 * prototype, so this is a presenter's control rather than something an
 * explorer touches mid-walk, and persistent chrome overstated it. Each
 * register carries the card on its own home screen, so the trip back is
 * always one tap from where you land.
 */
export default function RoleSwitch({ tone = 'dark' }) {
  const navigate = useNavigate()
  const isElder = useIsElder()
  const paper = tone === 'paper'

  const go = (role) => {
    storage.setRole(role)
    navigate(role === 'elder' ? '/elder' : '/map')
  }

  const target = isElder
    ? { role: 'user', label: 'ไปฝั่งผู้สำรวจ', icon: 'compass', hint: 'เดินตามหาจุดตรวจและฟังเรื่องเล่า' }
    : { role: 'elder', label: 'ไปฝั่งผู้สูงอายุ', icon: 'user', hint: 'ดูคลิปของฉันและแลกแต้มเป็นสวัสดิการ' }

  return (
    <section
      className={`rounded-2xl border border-dashed p-4 ${
        paper ? 'border-maroon900/25' : 'border-white/20'
      }`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
          paper ? 'text-maroon900/60' : 'text-lavender300'
        }`}
      >
        สำหรับสาธิตเท่านั้น
      </p>
      <p className={`mt-1 text-sm ${paper ? 'text-maroon900/75' : 'text-lavender300'}`}>
        ต้นแบบนี้ไม่มีระบบล็อกอิน สลับดูอีกฝั่งได้ทันที
      </p>

      <button
        onClick={() => go(target.role)}
        className={`mt-3 flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
          paper
            ? 'bg-violet800 text-white hover:bg-violet600'
            : 'bg-white/10 ring-1 ring-white/15 hover:bg-white/18'
        }`}
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            paper ? 'bg-white/15' : 'bg-gold200/20 text-gold200'
          }`}
        >
          <Icon name={target.icon} size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{target.label}</span>
          <span className={`block truncate text-xs ${paper ? 'text-white/75' : 'text-lavender300'}`}>
            {target.hint}
          </span>
        </span>
        <Icon name="arrowRight" size={18} className="shrink-0" />
      </button>
    </section>
  )
}
