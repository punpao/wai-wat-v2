import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { placeById } from '../data/places.js'
import { useStore } from '../lib/useStore.js'
import { usePosition } from '../lib/position.jsx'
import { distanceM, fmtDistance } from '../lib/geo.js'
import { Button, useToast } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

/**
 * แผนที่ในวัด — the supplied map, with the trail's stops on it.
 *
 * The stops are walked in order: stop two stays locked until stop one has
 * been played, because the script at the theatre is written as the second
 * half of a conversation that starts in the museum.
 *
 * Arrival is decided by GPS, not by tapping. Demo Mode exists because a
 * judge in a conference room cannot stand in ราชบุรี, and it says so on the
 * button rather than pretending to be a real fix.
 */
const ARRIVE_M = 60

export default function PlaceMap() {
  const { placeId } = useParams()
  const navigate = useNavigate()
  const state = useStore()
  const toast = useToast()
  const place = placeById(placeId)
  const { position, isSimulated, geoState, startWatching, simulateNear, clearSim } = usePosition()

  // Ask once on arrival; the browser only shows its prompt if it needs to.
  useEffect(() => {
    startWatching()
  }, [startWatching])

  const done = useMemo(() => state.progress[placeId]?.done ?? [], [state.progress, placeId])

  if (!place || place.status !== 'live') {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-lavender300">ไม่พบเส้นทางนี้</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          กลับหน้าแรก
        </Button>
      </div>
    )
  }

  const target = place.checkpoints.find((c) => !done.includes(c.id)) ?? null
  const allDone = !target

  const metres =
    position && target ? distanceM(position, [target.lat, target.lng]) : null
  const arrived = metres != null && metres <= ARRIVE_M

  const status = () => {
    if (allDone) return { tone: 'good', text: 'เดินครบทุกจุดแล้ว' }
    if (!position) {
      if (geoState === 'denied') return { tone: 'warn', text: 'ยังไม่ได้อนุญาตให้ใช้ตำแหน่ง' }
      if (geoState === 'unsupported') return { tone: 'warn', text: 'เครื่องนี้ไม่รองรับการหาตำแหน่ง' }
      return { tone: 'idle', text: 'กำลังหาตำแหน่งของคุณ…' }
    }
    if (arrived) return { tone: 'good', text: 'ถึงจุดนี้แล้ว พร้อมสแกน' }
    return { tone: 'idle', text: `อยู่ห่างจากจุดนี้ ${fmtDistance(metres)}` }
  }
  const st = status()

  return (
    <div className="mx-auto max-w-xl pb-56">
      <div className="flex items-center gap-3 px-4 pt-4">
        <button
          onClick={() => navigate(`/place/${place.id}`)}
          aria-label="ย้อนกลับ"
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-white/10 text-white"
        >
          <Icon name="chevron" size={19} className="rotate-180" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold200">
            แผนที่เส้นทาง
          </p>
          <h1 className="truncate text-lg font-semibold leading-tight">{place.name}</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-black/25 ring-1 ring-white/12">
          <img src={place.map} alt={`แผนที่${place.name}`} className="block w-full" />

          {/* the trail between stops, in the app's dotted-orbit motif */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              d={`M ${place.checkpoints.map((c) => `${c.pin.x} ${c.pin.y}`).join(' L ')}`}
              fill="none"
              stroke="#FFD3A2"
              strokeWidth="0.7"
              strokeDasharray="2.4 2.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="anim-dash opacity-80"
            />
          </svg>

          {place.checkpoints.map((cp) => {
            const ok = done.includes(cp.id)
            const isTarget = target?.id === cp.id
            const locked = !ok && !isTarget
            return (
              <button
                key={cp.id}
                disabled={locked}
                onClick={() =>
                  ok
                    ? navigate(`/place/${place.id}/journey/${cp.id}`)
                    : document.getElementById('map-target')?.scrollIntoView({ behavior: 'smooth' })
                }
                aria-label={cp.name}
                className="absolute -translate-x-1/2 -translate-y-full cursor-pointer disabled:cursor-not-allowed"
                style={{ left: `${cp.pin.x}%`, top: `${cp.pin.y}%` }}
              >
                <span className="relative flex flex-col items-center">
                  {isTarget && (
                    <span className="anim-ring absolute bottom-1 h-12 w-12 rounded-full bg-gold200/45" />
                  )}
                  <span
                    className={`relative grid h-9 w-9 place-items-center rounded-full text-sm font-bold shadow-lg shadow-black/40 ring-2 ring-white/70 ${
                      ok
                        ? 'bg-gold200 text-maroon900'
                        : isTarget
                          ? 'bg-coral500 text-white'
                          : 'bg-[#2B0F30]/85 text-lavender300'
                    }`}
                  >
                    {ok ? <Icon name="check" size={18} stroke={2.6} /> : locked ? cp.order : cp.order}
                  </span>
                  <span className="relative mt-1 whitespace-nowrap rounded-full bg-[#2B0F30]/90 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/15">
                    {cp.short}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <ol className="mt-4 space-y-2 px-4">
        {place.checkpoints.map((cp) => {
          const ok = done.includes(cp.id)
          const isTarget = target?.id === cp.id
          return (
            <li
              key={cp.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ${
                isTarget ? 'bg-coral500/12 ring-coral500/40' : 'bg-white/5 ring-white/10'
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  ok ? 'bg-gold200 text-maroon900' : isTarget ? 'bg-coral500 text-white' : 'bg-white/10 text-lavender300'
                }`}
              >
                {ok ? <Icon name="check" size={16} stroke={2.6} /> : cp.order}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{cp.name}</span>
                <span className="block text-xs text-lavender300">
                  {ok ? 'เดินแล้ว' : isTarget ? 'จุดถัดไป' : 'ยังไม่ถึงคิว'}
                </span>
              </span>
              {ok && (
                <button
                  onClick={() => navigate(`/place/${place.id}/journey/${cp.id}`)}
                  className="shrink-0 cursor-pointer rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  ฟังซ้ำ
                </button>
              )}
              {!ok && !isTarget && (
                <span className="shrink-0 text-xs text-lavender300">ล็อกอยู่</span>
              )}
            </li>
          )
        })}
      </ol>

      {/* the action, pinned where a walking visitor can reach it */}
      <div
        id="map-target"
        className="fixed inset-x-0 bottom-0 z-[900] border-t border-white/10 px-4 pb-5 pt-4 backdrop-blur-md"
        style={{
          background: 'var(--app-chrome)',
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="mx-auto max-w-xl">
          {allDone ? (
            <>
              <p className="mb-3 text-center text-sm text-gold200">เดินครบทุกจุดแล้ว</p>
              <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate(`/place/${place.id}`)}>
                กลับไปหน้าสถานที่
              </Button>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-start gap-2.5">
                <span
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    st.tone === 'good'
                      ? 'bg-gold200 text-maroon900'
                      : st.tone === 'warn'
                        ? 'bg-coral500 text-white'
                        : 'bg-white/12 text-gold200'
                  }`}
                >
                  <Icon name={st.tone === 'good' ? 'check' : 'compass'} size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug">{target.name}</span>
                  <span className="block text-xs text-lavender300">
                    {st.text}
                    {isSimulated && ' · โหมดสาธิต'}
                  </span>
                </span>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!arrived}
                onClick={() => navigate(`/place/${place.id}/journey/${target.id}`)}
              >
                <Icon name="scan" size={22} />
                {arrived ? `เริ่มสแกนที่${target.short}` : 'เดินไปที่จุดนี้ก่อน'}
              </Button>

              <div className="mt-2 flex gap-2">
                {geoState !== 'live' && !isSimulated && (
                  <button
                    onClick={() => {
                      startWatching()
                      toast('กำลังขอตำแหน่งอีกครั้ง', 'info')
                    }}
                    className="flex-1 cursor-pointer rounded-full px-3 py-2 text-xs font-semibold text-lavender300 transition-colors hover:text-white"
                  >
                    ลองหาตำแหน่งอีกครั้ง
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isSimulated) {
                      clearSim()
                      toast('กลับไปใช้ตำแหน่งจริง', 'info')
                    } else {
                      simulateNear(target, 20)
                      toast('โหมดสาธิต: จำลองว่ายืนอยู่ที่จุดนี้', 'good')
                    }
                  }}
                  className="flex-1 cursor-pointer rounded-full px-3 py-2 text-xs font-semibold text-lavender300 transition-colors hover:text-white"
                >
                  {isSimulated ? 'ปิดโหมดสาธิต' : 'โหมดสาธิต: จำลองว่าถึงจุดนี้'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
