import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

/** Layer 1 — the "Google Maps style" view: real OSM tiles, real coordinates. */
const houseIcon = (found, active) =>
  L.divIcon({
    className: '',
    iconSize: [44, 52],
    iconAnchor: [22, 48],
    html: `
      <div style="position:relative;width:44px;height:52px;display:grid;place-items:start center;">
        <svg width="44" height="52" viewBox="0 0 44 52">
          <ellipse cx="22" cy="48" rx="7" ry="2.6" fill="rgba(0,0,0,.35)"/>
          <path d="M22 3c8.8 0 16 7 16 15.6C38 29 22 45 22 45S6 29 6 18.6C6 10 13.2 3 22 3Z"
                fill="${found ? '#FFD3A2' : '#501D65'}" stroke="${found ? '#D9502F' : '#FFD3A2'}"
                stroke-width="${active ? 3 : 2}"/>
          <path d="M22 11l8 7h-2.2v7h-11.6v-7H14l8-7Z" fill="${found ? '#5C1432' : '#FFD3A2'}"/>
          ${found ? '<circle cx="34" cy="9" r="6" fill="#D9502F"/><path d="M31.4 9l1.9 2 3.3-3.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
        </svg>
      </div>`,
  })

export default function LeafletMap({ location, checkpoints, discoveredIds, activeId, onSelect, userPos }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const meMarker = useRef(null)
  const [tilesFailed, setTilesFailed] = useState(false)

  useEffect(() => {
    if (map.current) return
    map.current = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(
      [13.7563, 100.5018],
      6,
    )
    L.control.zoom({ position: 'topright' }).addTo(map.current)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    })
      .on('tileerror', () => setTilesFailed(true))
      .addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // recentre when a trail is chosen
  useEffect(() => {
    if (!map.current || !location) return
    map.current.flyTo(location.center, location.zoom, { duration: 1.1 })
  }, [location])

  // markers + the dotted trail between them
  useEffect(() => {
    const g = layer.current
    if (!g) return
    g.clearLayers()
    if (!checkpoints?.length) return

    L.polyline(
      checkpoints.map((c) => [c.lat, c.lng]),
      { color: '#FFD3A2', weight: 2, opacity: 0.6, dashArray: '2 9', lineCap: 'round' },
    ).addTo(g)

    checkpoints.forEach((cp) => {
      L.marker([cp.lat, cp.lng], {
        icon: houseIcon(discoveredIds.includes(cp.id), activeId === cp.id),
        keyboard: true,
        alt: cp.name,
        riseOnHover: true,
      })
        .on('click', () => onSelect(cp))
        .addTo(g)
    })
  }, [checkpoints, discoveredIds, activeId, onSelect])

  // the explorer's own dot
  useEffect(() => {
    if (!map.current) return
    meMarker.current?.remove()
    if (!userPos) return
    meMarker.current = L.circleMarker(userPos, {
      radius: 8,
      color: '#fff',
      weight: 3,
      fillColor: '#F16C95',
      fillOpacity: 1,
    }).addTo(map.current)
  }, [userPos])

  return (
    <>
      <div ref={el} className="h-full w-full" aria-label="แผนที่มาตรฐาน" role="application" />
      {tilesFailed && (
        <p className="pointer-events-none absolute inset-x-0 top-16 z-[600] mx-auto max-w-[17rem] rounded-2xl bg-[#2E0F35]/92 px-4 py-2.5 text-center text-xs leading-relaxed text-lavender300 ring-1 ring-white/15">
          โหลดแผ่นแผนที่จาก OpenStreetMap ไม่ได้ (อินเทอร์เน็ตอาจถูกจำกัด) —
          จุดตรวจยังใช้งานได้ หรือสลับไปโหมด “นักสำรวจ” ซึ่งไม่ต้องต่อเน็ต
        </p>
      )}
    </>
  )
}
