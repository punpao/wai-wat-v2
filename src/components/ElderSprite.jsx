/**
 * ElderSprite — the 2D "AR character" that appears over the camera feed
 * and doubles as the avatar everywhere else. Illustration only: there is
 * no computer vision behind it, by design.
 */
export default function ElderSprite({ elder, size = 200, talking = false, className = '' }) {
  const s = elder?.sprite ?? { skin: '#E7B48A', shirt: '#D9502F', hair: '#EEE', accessory: 'hat' }
  return (
    <svg
      viewBox="0 0 120 150"
      width={size}
      height={size * 1.25}
      className={className}
      role="img"
      aria-label={`ภาพประกอบของ${elder?.name ?? 'ผู้เฒ่า'}`}
    >
      <defs>
        <radialGradient id="ws-glow" cx="50%" cy="62%" r="52%">
          <stop offset="0%" stopColor="#FFD3A2" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFD3A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="60" cy="96" rx="56" ry="52" fill="url(#ws-glow)" />
      <ellipse cx="60" cy="143" rx="30" ry="5" fill="#2B0F30" opacity="0.35" />

      {/* body */}
      <path d="M60 74c-17 0-29 11-31 26l-3 34h68l-3-34c-2-15-14-26-31-26Z" fill={s.shirt} />
      <path d="M60 74c-6 0-11 1-15 3l15 20 15-20c-4-2-9-3-15-3Z" fill="#FFF" opacity="0.16" />
      {/* sash — a small Thai detail, kept quiet */}
      <path d="M39 82 79 112" stroke="#FFD3A2" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
      {/* hands resting */}
      <circle cx="30" cy="122" r="7" fill={s.skin} />
      <circle cx="90" cy="122" r="7" fill={s.skin} />

      {/* neck + head */}
      <rect x="53" y="60" width="14" height="14" rx="6" fill={s.skin} />
      <ellipse cx="60" cy="42" rx="25" ry="26" fill={s.skin} />

      {/* hair */}
      {s.accessory === 'bun' ? (
        <>
          <path d="M35 40c0-16 11-25 25-25s25 9 25 25c-6-6-14-9-25-9s-19 3-25 9Z" fill={s.hair} />
          <circle cx="60" cy="12" r="8" fill={s.hair} />
        </>
      ) : (
        <path d="M35 40c0-16 11-25 25-25s25 9 25 25c-6-7-14-10-25-10s-19 3-25 10Z" fill={s.hair} />
      )}

      {s.accessory === 'hat' && (
        <>
          <ellipse cx="60" cy="20" rx="42" ry="9" fill="#C9A87C" />
          <path d="M38 20c0-13 10-20 22-20s22 7 22 20c-7 4-14 6-22 6s-15-2-22-6Z" fill="#E0C39A" />
          <ellipse cx="60" cy="20" rx="42" ry="9" fill="none" stroke="#A88A5F" strokeWidth="1.5" />
        </>
      )}
      {s.accessory === 'flower' && <circle cx="84" cy="30" r="7" fill="#F16C95" />}
      {s.accessory === 'flower' && <circle cx="84" cy="30" r="2.6" fill="#FFD3A2" />}

      {/* face */}
      <g fill="#3B2417">
        <ellipse cx="50" cy="42" rx="2.6" ry={talking ? 2.2 : 2.8} />
        <ellipse cx="70" cy="42" rx="2.6" ry={talking ? 2.2 : 2.8} />
      </g>
      {/* smile lines — the age is the point, not something to hide */}
      <path d="M43 34c3-2 7-2.5 10-1.5M67 32.5c3-1 7-.5 10 1.5" stroke="#8A6A55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M44 52c1.5 2 3 3 5 3.5M76 52c-1.5 2-3 3-5 3.5" stroke="#C89579" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {s.accessory === 'glasses' && (
        <g stroke="#3B2417" strokeWidth="1.8" fill="none">
          <circle cx="50" cy="42" r="8.5" />
          <circle cx="70" cy="42" r="8.5" />
          <path d="M58.5 42h3M41.5 40l-6-2M78.5 40l6-2" />
        </g>
      )}

      {/* mouth */}
      {talking ? (
        <ellipse cx="60" cy="53" rx="6" ry="4.5" fill="#7A3B3B">
          <animate attributeName="ry" values="4.5;1.6;4;2;4.5" dur="0.7s" repeatCount="indefinite" />
        </ellipse>
      ) : (
        <path d="M53 52c3 3.5 11 3.5 14 0" stroke="#7A3B3B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}

/** Compact circular avatar used in lists. */
export function ElderAvatar({ elder, size = 48 }) {
  const s = elder?.sprite ?? {}
  return (
    <span
      className="inline-flex shrink-0 items-end justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size, background: `${s.shirt ?? '#653877'}33` }}
    >
      <svg viewBox="30 5 60 62" width={size} height={size} aria-hidden="true">
        <ellipse cx="60" cy="42" rx="25" ry="26" fill={s.skin ?? '#E7B48A'} />
        <path d="M35 40c0-16 11-25 25-25s25 9 25 25c-6-7-14-10-25-10s-19 3-25 10Z" fill={s.hair ?? '#eee'} />
        <g fill="#3B2417">
          <ellipse cx="50" cy="42" rx="2.6" ry="2.8" />
          <ellipse cx="70" cy="42" rx="2.6" ry="2.8" />
        </g>
        <path d="M53 52c3 3.5 11 3.5 14 0" stroke="#7A3B3B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  )
}
