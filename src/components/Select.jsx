import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon.jsx'

/**
 * A dropdown we can actually style.
 *
 * A native <select> hands its popup to the OS, so the list never matched the
 * rest of the app — dark on one machine, grey on another. This is a listbox
 * on a white card instead, with the keyboard and screen-reader contract the
 * native element gave us for free: roving highlight, Home/End, type-free
 * arrow navigation, Escape to close, and aria-activedescendant so the option
 * under the highlight is announced.
 *
 * options: [{ value, label, hint, badge, leading }]
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = 'เลือก',
  labelledBy,
  size = 'md',
  tone = 'onDark',
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [dropUp, setDropUp] = useState(false)
  const wrap = useRef(null)
  const listRef = useRef(null)
  const btnRef = useRef(null)
  const id = useId()

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  useEffect(() => {
    if (!open) return
    setActive(selectedIndex >= 0 ? selectedIndex : 0)
    // Near the bottom of the page there is nowhere to drop to; open upward
    // instead of letting the list run off the screen.
    const r = btnRef.current?.getBoundingClientRect()
    if (r) {
      const below = window.innerHeight - r.bottom
      setDropUp(below < 280 && r.top > below)
    }
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, selectedIndex])

  // keep the highlighted row in view when arrowing through a long list
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const commit = (i) => {
    onChange(options[i].value)
    setOpen(false)
    btnRef.current?.focus()
  }

  const onKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      btnRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActive(options.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      commit(active)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  const big = size === 'lg'

  return (
    <div ref={wrap} className="relative">
      <button
        ref={btnRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={labelledBy}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 text-left shadow-lg shadow-black/15 transition-shadow ${
          big ? 'min-h-[60px] py-3' : 'min-h-[56px] py-3'
        } ${
          tone === 'onDark'
            ? 'ring-1 ring-white/25 hover:shadow-black/25'
            : 'ring-2 ring-maroon900/15 hover:ring-maroon900/35'
        }`}
      >
        {selected?.leading ?? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet800/10 text-violet800">
            <Icon name={selected?.icon ?? 'pin'} size={19} />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span
            className={`block truncate font-semibold text-maroon900 ${
              big ? 'text-[18px]' : 'text-[15px]'
            } ${selected ? '' : 'font-medium text-maroon900/45'}`}
          >
            {selected ? selected.label : placeholder}
          </span>
          {selected?.hint && (
            <span className={`block truncate text-maroon900/55 ${big ? 'text-[15px]' : 'text-[12px]'}`}>
              {selected.hint}
            </span>
          )}
        </span>

        <Icon
          name="chevronDown"
          size={20}
          className={`shrink-0 text-violet800 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={`anim-risein absolute inset-x-0 z-[1000] max-h-[19rem] overflow-y-auto rounded-2xl bg-white p-1.5 shadow-2xl shadow-black/45 ring-1 ring-maroon900/10 ${
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {options.map((o, i) => {
            const isSel = o.value === value
            const isActive = i === active
            return (
              <li key={o.value} id={`${id}-opt-${i}`} data-i={i} role="option" aria-selected={isSel}>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => commit(i)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors ${
                    big ? 'min-h-[64px] py-2.5' : 'min-h-[56px] py-2'
                  } ${isActive ? 'bg-violet800/10' : 'bg-transparent'}`}
                >
                  {o.leading ?? (
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        isSel ? 'bg-coral500 text-white' : 'bg-violet800/10 text-violet800'
                      }`}
                    >
                      <Icon name={isSel ? 'check' : (o.icon ?? 'pin')} size={18} />
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate font-semibold text-maroon900 ${
                        big ? 'text-[18px]' : 'text-[15px]'
                      }`}
                    >
                      {o.label}
                    </span>
                    {o.hint && (
                      <span
                        className={`block truncate text-maroon900/55 ${big ? 'text-[15px]' : 'text-[12px]'}`}
                      >
                        {o.hint}
                      </span>
                    )}
                  </span>

                  {o.badge && (
                    <span className="shrink-0 rounded-full bg-gold200/45 px-2.5 py-1 text-[11px] font-semibold text-maroon900">
                      {o.badge}
                    </span>
                  )}
                  {isSel && !o.badge && (
                    <Icon name="check" size={18} className="shrink-0 text-coral500" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
