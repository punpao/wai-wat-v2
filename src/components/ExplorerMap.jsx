import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Layer 2 — "Explorer style".
 *
 * The exact same checkpoint lat/lng as the Leaflet layer, projected into an
 * illustrated top-down board instead of onto tiles. It is a skin, not a 3D
 * engine: no terrain data, no camera, just SVG.
 */
/**
 * The board is drawn in CSS-pixel units — the viewBox matches the element's
 * own size — so houses and labels keep their intended size on every screen
 * instead of scaling with the aspect ratio.
 */
function useBoardSize(ref) {
  const [size, setSize] = useState({ w: 900, h: 620 })
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      if (width > 0 && height > 0) setSize({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

/** stable per-id pseudo-random so scenery never reshuffles between renders */
const hash = (str) => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    return ((h >>> 0) % 1000) / 1000
  }
}

export default function ExplorerMap({ location, checkpoints, discoveredIds, activeId, onSelect, userPos }) {
  const wrap = useRef(null)
  const { w: W, h: H } = useBoardSize(wrap)
  const padX = Math.min(W * 0.2, 96)
  const padY = Math.min(H * 0.16, 110)

  const { points, project, scenery } = useMemo(() => {
    if (!checkpoints?.length) return { points: [], project: null, scenery: [] }
    const lats = checkpoints.map((c) => c.lat)
    const lngs = checkpoints.map((c) => c.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const spanLat = Math.max(maxLat - minLat, 0.004)
    const spanLng = Math.max(maxLng - minLng, 0.004)

    const proj = (lat, lng) => ({
      // north stays up; longitude runs left→right, same as the real map
      x: padX + ((lng - minLng) / spanLng) * (W - padX * 2),
      y: padY + ((maxLat - lat) / spanLat) * (H - padY * 2),
    })

    const rnd = hash(location?.id ?? 'x')
    const bits = Array.from({ length: 26 }, (_, i) => ({
      id: i,
      x: rnd() * W,
      y: 50 + rnd() * (H - 80),
      kind: rnd() > 0.62 ? 'tree' : rnd() > 0.4 ? 'rock' : 'grass',
      s: 0.7 + rnd() * 0.8,
    }))
    return { points: checkpoints.map((c) => ({ ...c, ...proj(c.lat, c.lng) })), project: proj, scenery: bits }
  }, [checkpoints, location, W, H, padX, padY])

  const me = userPos && project ? project(userPos[0], userPos[1]) : null
  const trail = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div
      ref={wrap}
      className="h-full w-full overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#5C1432 0%,#501D65 55%,#653877 100%)' }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="application"
        aria-label="แผนที่สไตล์นักสำรวจ"
      >
        <defs>
          <linearGradient id="ex-ground" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5C1432" />
            <stop offset="55%" stopColor="#501D65" />
            <stop offset="100%" stopColor="#653877" />
          </linearGradient>
          <radialGradient id="ex-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD3A2" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFD3A2" stopOpacity="0" />
          </radialGradient>
          <pattern id="ex-grid" width="52" height="52" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <path d="M0 0h52M0 0v52" stroke="#FFD3A2" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill="url(#ex-ground)" />
        <rect width={W} height={H} fill="url(#ex-grid)" />

        {/* soft landmasses so the board reads as terrain, not a blank plane */}
        <g opacity="0.5">
          <ellipse cx={W * 0.18} cy={H * 0.21} rx={W * 0.26} ry={H * 0.19} fill="#6E3F80" opacity="0.5" />
          <ellipse cx={W * 0.82} cy={H * 0.8} rx={W * 0.3} ry={H * 0.21} fill="#7A4A8C" opacity="0.4" />
          <path
            d={`M0 ${H * 0.67} q${W * 0.18} ${-H * 0.09} ${W * 0.36} ${H * 0.015} t${W * 0.4} ${-H * 0.043} T${W} ${H * 0.71} V${H} H0 Z`}
            fill="#3E1547"
            opacity="0.75"
          />
        </g>

        {/* scenery */}
        <g>
          {scenery.map((b) => (
            <g key={b.id} transform={`translate(${b.x} ${b.y}) scale(${b.s})`} opacity="0.65">
              {b.kind === 'tree' && (
                <>
                  <rect x="-2" y="4" width="4" height="10" rx="2" fill="#3A1A45" />
                  <circle cx="0" cy="0" r="11" fill="#7A4A8C" />
                  <circle cx="-4" cy="-4" r="7" fill="#8E5B9E" />
                </>
              )}
              {b.kind === 'rock' && <ellipse cx="0" cy="0" rx="10" ry="6" fill="#432050" />}
              {b.kind === 'grass' && (
                <path d="M-6 4c2-6 3-8 3-10 1 3 2 6 3 10" stroke="#B38CC0" strokeWidth="1.6" fill="none" opacity="0.55" />
              )}
            </g>
          ))}
        </g>

        {/* ── the wisdom trail: same dotted orbit motif as the hero ── */}
        {points.length > 1 && (
          <>
            <polyline points={trail} fill="none" stroke="#2B0F30" strokeWidth="16" strokeLinejoin="round" strokeLinecap="round" opacity="0.5" />
            <polyline
              points={trail}
              fill="none"
              stroke="#FFD3A2"
              strokeWidth="3.5"
              strokeDasharray="2 14"
              strokeLinecap="round"
              opacity="0.85"
              className="anim-dash"
            />
          </>
        )}

        {/* checkpoints */}
        {points.map((p, i) => {
          const found = discoveredIds.includes(p.id)
          const active = activeId === p.id
          return (
            <g
              key={p.id}
              transform={`translate(${p.x} ${p.y})`}
              onClick={() => onSelect(p)}
              tabIndex={0}
              role="button"
              aria-label={`จุดตรวจ ${p.name}${found ? ' (ค้นพบแล้ว)' : ''}`}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(p))}
              style={{ cursor: 'pointer' }}
            >
              <circle r="46" fill="transparent" />
              {found && <circle r="52" fill="url(#ex-glow)" />}
              <ellipse cy="26" rx="34" ry="12" fill="#2B0F30" opacity="0.45" />
              <ellipse cy="24" rx="30" ry="10" fill={found ? '#FFD3A2' : '#7A4A8C'} opacity={found ? 0.35 : 0.5} />

              {/* บ้าน — the house icon, isometric-ish */}
              <g transform="translate(0 -6)">
                <path d="M-20 4 L0 -16 L20 4 Z" fill={found ? '#FFD3A2' : '#B38CC0'} />
                <path d="M-14 4 h28 v20 h-28 Z" fill={found ? '#D9502F' : '#501D65'} stroke={found ? '#FFD3A2' : '#B38CC0'} strokeWidth="2" />
                <rect x="-4" y="12" width="8" height="12" fill={found ? '#FFD3A2' : '#B38CC0'} opacity="0.9" />
                <path d="M-23 5 L0 -18 L23 5" fill="none" stroke={found ? '#D9502F' : '#653877'} strokeWidth="3" strokeLinecap="round" />
              </g>

              {active && <circle r="44" fill="none" stroke="#F16C95" strokeWidth="2.5" strokeDasharray="5 7" />}
              {found && (
                <g transform="translate(20 -26)">
                  <circle r="11" fill="#D9502F" />
                  <path d="M-4.5 0.5 L-1 4 L5 -3" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}

              <g transform="translate(0 52)">
                <rect x={-Math.max(58, p.name.length * 7.4) / 2} y="-15" width={Math.max(58, p.name.length * 7.4)} height="26" rx="13" fill="#2B0F30" opacity="0.82" />
                <text textAnchor="middle" y="3" fontSize="14" fill={found ? '#FFD3A2' : '#EBDCF0'} fontFamily="Kanit, sans-serif" fontWeight="500">
                  {p.name}
                </text>
              </g>
              <text textAnchor="middle" y="-40" fontSize="13" fill="#B38CC0" fontFamily="Archivo Black, sans-serif">
                {String(i + 1).padStart(2, '0')}
              </text>
            </g>
          )
        })}

        {/* the explorer */}
        {me && me.x > -50 && me.x < W + 50 && (
          <g transform={`translate(${me.x} ${me.y})`} style={{ pointerEvents: 'none' }}>
            <circle r="26" fill="#F16C95" opacity="0.25" className="anim-ring" />
            <circle r="11" fill="#F16C95" stroke="#fff" strokeWidth="3.5" />
          </g>
        )}
      </svg>
    </div>
  )
}
