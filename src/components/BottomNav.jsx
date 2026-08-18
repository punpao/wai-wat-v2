import { NavLink, useNavigate } from 'react-router-dom'
import { allCheckpoints } from '../data/locations.js'
import { distanceM, NEAR_RADIUS_M } from '../lib/geo.js'
import { usePosition } from '../lib/position.jsx'
import { useStore } from '../lib/useStore.js'
import { useIsElder } from '../lib/role.js'
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
  const isElder = useIsElder()
  return isElder ? <ElderNav /> : <UserNav />
}

function Bar({ children }) {
  const isElder = useIsElder()
  return (
    <nav
      aria-label="เมนูหลัก"
      className={`fixed inset-x-0 bottom-0 z-[950] backdrop-blur-lg ${
        isElder ? 'border-t border-maroon900/12 bg-paper/95' : 'border-t border-white/10 bg-[#3E1249]/88'
      }`}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {children}
    </nav>
  )
}

function Tab({ to, label, icon, isElder }) {
  return (
    <NavLink
      to={to}
      end={to === '/elder'}
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
          <Icon name={icon} size={isElder ? 26 : 23} stroke={isActive ? 2.1 : 1.7} />
          <span className={`${isElder ? 'text-[15px]' : 'text-[11.5px]'} font-semibold leading-none`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

function ElderNav() {
  return (
    <Bar>
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5">
        {ELDER_TABS.map((t) => (
          <li key={t.to} className="flex-1">
            <Tab {...t} isElder />
          </li>
        ))}
      </ul>
    </Bar>
  )
}

/**
 * The explorer's bar puts AR scanning in the middle, raised out of the bar.
 * It is the thing the app is actually for, and during a demo it is the one
 * control the presenter should never have to hunt for.
 */
function UserNav() {
  const navigate = useNavigate()
  const pos = usePosition()
  const state = useStore()

  const startScan = () => {
    const cps = allCheckpoints()
    const found = state.discoveries.map((d) => d.checkpointId)

    // Standing at a real checkpoint? Go straight in, no simulation.
    if (pos.position && !pos.isSimulated) {
      const near = cps
        .map((c) => ({ c, d: distanceM(pos.position, [c.lat, c.lng]) }))
        .sort((a, b) => a.d - b.d)[0]
      if (near && near.d <= NEAR_RADIUS_M) return navigate(`/scan/${near.c.id}`)
    }

    // Otherwise this is the demo path: stand the explorer at the next
    // undiscovered checkpoint (nearest one, if the device knows where it is).
    const pool = cps.filter((c) => !found.includes(c.id))
    const list = pool.length ? pool : cps
    const target = pos.position
      ? list
          .map((c) => ({ c, d: distanceM(pos.position, [c.lat, c.lng]) }))
          .sort((a, b) => a.d - b.d)[0].c
      : list[0]
    pos.simulateNear(target)
    navigate(`/scan/${target.id}`)
  }

  return (
    <Bar>
      <ul className="mx-auto grid max-w-lg grid-cols-3 items-end px-2 pt-1.5">
        <li>
          <Tab {...USER_TABS[0]} />
        </li>

        <li className="relative flex justify-center">
          <button
            onClick={startScan}
            className="absolute -top-9 grid h-16 w-16 cursor-pointer place-items-center rounded-full bg-coral500 text-white shadow-lg shadow-black/45 ring-4 ring-[#3E1249] transition-transform duration-200 hover:bg-[#e35c39] active:scale-95"
            aria-label="เปิดหน้าสาธิต AR Scan"
          >
            <Icon name="scan" size={28} stroke={2.1} />
          </button>
          <span className="pointer-events-none mb-2 mt-8 text-[11.5px] font-semibold leading-none text-gold200">
            สาธิต AR
          </span>
        </li>

        <li>
          <Tab {...USER_TABS[1]} />
        </li>
      </ul>
    </Bar>
  )
}
