import { useTheme } from '../lib/theme.js'
import Icon from './Icon.jsx'

/**
 * ธีมสว่าง / ธีมมืด — a two-state switch, shaped like the role switcher it
 * replaced so the header keeps its silhouette.
 *
 * Both options stay on screen rather than collapsing into one icon that
 * flips: a lone sun is ambiguous about whether it shows the current state
 * or the one a tap would bring, and this control sits where a presenter
 * has to be right the first time.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, set } = useTheme()

  const options = [
    { id: 'dark', label: 'มืด', icon: 'moon' },
    { id: 'light', label: 'สว่าง', icon: 'sun' },
  ]

  return (
    <div
      role="group"
      aria-label="สลับธีมสว่างและธีมมืด"
      className={`flex shrink-0 items-center rounded-full bg-black/25 p-1 ring-1 ring-white/12 ${className}`}
    >
      {options.map((o) => {
        const on = o.id === theme
        return (
          <button
            key={o.id}
            onClick={() => set(o.id)}
            aria-pressed={on}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors duration-200 max-[380px]:gap-1 max-[380px]:px-2.5 max-[380px]:text-[12px] ${
              on ? 'bg-coral500 text-white' : 'text-lavender300 hover:text-white'
            }`}
          >
            <Icon name={o.icon} size={16} />
            <span className="max-[330px]:hidden">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
