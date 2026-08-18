import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Icon from './Icon.jsx'

/* ── Buttons ─────────────────────────────────────────────── */
const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,opacity] duration-200 active:scale-[.97] disabled:opacity-45 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed'

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-[15px] min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  }
  const variants = {
    primary: 'bg-coral500 text-white hover:bg-[#e35c39]',
    gold: 'bg-gold200 text-maroon900 hover:bg-gold100',
    ghost: 'bg-white/10 text-white hover:bg-white/18 border border-white/15',
    quiet: 'bg-transparent text-lavender300 hover:text-white',
    paper: 'bg-violet800 text-white hover:bg-violet600',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

/* ── Surfaces ────────────────────────────────────────────── */
export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`glass rounded-card ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function Eyebrow({ children, className = '' }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender300 ${className}`}>
      {children}
    </p>
  )
}

/** Stat pill — glass fill, one oversized gold number. */
export function StatPill({ value, label, suffix, className = '' }) {
  return (
    <div className={`glass flex flex-col items-center rounded-2xl px-4 py-3 ${className}`}>
      <span className="gold-number font-display text-[26px] leading-none">
        {value}
        {suffix && <span className="text-base"> {suffix}</span>}
      </span>
      <span className="mt-1.5 text-[11px] tracking-wide text-lavender300">{label}</span>
    </div>
  )
}

/* ── Decorative motif: dotted orbits + plus marks ────────── */
export function OrbitDecor({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="orbit-ring absolute -right-24 -top-28 h-72 w-72 opacity-45" />
      <div className="orbit-ring absolute -right-6 -top-10 h-36 w-36 opacity-30" />
      <svg className="absolute right-10 top-24 opacity-40" width="46" height="46" viewBox="0 0 46 46">
        <g stroke="#FFD3A2" strokeWidth="1.6" strokeLinecap="round">
          <path d="M8 8v8M4 12h8M34 26v10M29 31h10" />
        </g>
      </svg>
      <div className="stripe-edge absolute -left-4 top-0 h-full w-28 opacity-60" />
    </div>
  )
}

/* ── Toast ───────────────────────────────────────────────── */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastHost({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((text, tone = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setItems((v) => [...v, { id, text, tone }])
    setTimeout(() => setItems((v) => v.filter((i) => i.id !== id)), 3600)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[3000] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`anim-toast pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full px-4 py-3 text-sm font-medium shadow-lg shadow-black/30 ${
              t.tone === 'good'
                ? 'bg-gold200 text-maroon900'
                : t.tone === 'warn'
                  ? 'bg-coral500 text-white'
                  : 'bg-violet800/95 text-white ring-1 ring-white/15 backdrop-blur'
            }`}
          >
            <Icon name={t.tone === 'good' ? 'check' : 'spark'} size={18} />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* ── Bottom sheet / modal ────────────────────────────────── */
export function Sheet({ open, onClose, title, children, tone = 'dark', labelledBy }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const paper = tone === 'paper'
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`anim-risein relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl ${
          paper
            ? 'bg-paper text-maroon900 ring-1 ring-maroon900/10'
            : 'bg-[#43164C] text-white ring-1 ring-white/12'
        } p-5 pb-8 shadow-2xl shadow-black/50 sm:p-6`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={labelledBy} className={`text-xl font-semibold ${paper ? '' : 'text-white'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className={`grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full transition-colors ${
              paper ? 'bg-maroon900/8 hover:bg-maroon900/15' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── misc ────────────────────────────────────────────────── */
export const thaiDate = (ts) =>
  new Date(ts).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })

export const mmss = (sec) =>
  `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`
