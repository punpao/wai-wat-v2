import Icon from './Icon.jsx'

/**
 * Elder register primitives.
 *
 * Same brand, different rules: light paper surface instead of the dark
 * explorer theme, 18px+ base type, ≥60px tap targets, and nothing that
 * relies on colour alone to carry meaning.
 */
export function PaperCard({ className = '', children, ...rest }) {
  return (
    <div
      className={`rounded-3xl border border-maroon900/10 bg-white shadow-[0_2px_14px_rgba(92,20,50,0.07)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function BigButton({ variant = 'primary', className = '', children, ...rest }) {
  const styles = {
    primary: 'bg-coral500 text-white hover:bg-[#c1462a]',
    violet: 'bg-violet800 text-white hover:bg-violet600',
    outline: 'bg-white text-maroon900 border-2 border-maroon900/25 hover:border-maroon900/50',
  }
  return (
    <button
      className={`inline-flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl px-6 text-[19px] font-semibold transition-colors duration-200 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function SectionTitle({ icon, children, hint }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      {icon && (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet800/10 text-violet800">
          <Icon name={icon} size={22} />
        </span>
      )}
      <div>
        <h2 className="text-[21px] font-semibold leading-tight">{children}</h2>
        {hint && <p className="text-[15px] leading-tight text-maroon900/60">{hint}</p>}
      </div>
    </div>
  )
}
