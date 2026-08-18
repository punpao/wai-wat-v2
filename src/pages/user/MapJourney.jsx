import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOCATIONS, locationById } from '../../data/locations.js'
import { elderById } from '../../data/elders.js'
import { useStore } from '../../lib/useStore.js'
import { usePosition } from '../../lib/position.jsx'
import { distanceM, fmtDistance, NEAR_RADIUS_M } from '../../lib/geo.js'
import LeafletMap from '../../components/LeafletMap.jsx'
import ExplorerMap from '../../components/ExplorerMap.jsx'
import { ElderAvatar } from '../../components/ElderSprite.jsx'
import { Button, Eyebrow, OrbitDecor, Sheet, StatPill } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

export default function MapJourney() {
  const state = useStore()
  const pos = usePosition()
  const navigate = useNavigate()
  const [locId, setLocId] = useState('')
  const [layer, setLayer] = useState('standard')
  const [active, setActive] = useState(null)

  const location = locId ? locationById(locId) : null
  const checkpoints = location?.checkpoints ?? []
  const discoveredIds = useMemo(
    () => state.discoveries.map((d) => d.checkpointId),
    [state.discoveries],
  )

  // ask for real GPS once the explorer commits to a trail; Demo Mode overrides it anyway
  useEffect(() => {
    if (location && pos.geoState === 'idle') pos.startWatching()
  }, [location, pos])

  const distTo = (cp) => (pos.position ? distanceM(pos.position, [cp.lat, cp.lng]) : null)
  const activeDist = active ? distTo(active) : null
  const nearEnough = activeDist != null && activeDist <= NEAR_RADIUS_M

  const MapLayer = layer === 'standard' ? LeafletMap : ExplorerMap

  // DOM order stays mobile-first (picker → map → list); on desktop the grid
  // places the map into its own full-height column on the right.
  return (
    <div className="relative mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-6 lg:px-6 lg:pt-4">
      {/* ── Trail picker ── */}
      <section className="relative overflow-hidden px-4 pb-3 pt-4 lg:col-start-1 lg:row-start-1 lg:px-0">
        <OrbitDecor />
        <div className="relative mx-auto max-w-2xl lg:max-w-none">
          <Eyebrow>เลือกเส้นทาง</Eyebrow>
          <h1 className="mt-1.5 text-[22px] font-semibold leading-snug sm:text-[28px]">
            เดินตามรอย <span className="text-gold200">คนที่ยังจำเรื่องนั้นได้</span>
          </h1>
          <p className="mt-1.5 hidden max-w-md text-sm leading-relaxed text-lavender300 sm:block">
            เลือกย่านที่อยากไป แล้วออกเดินหาจุดตรวจ เมื่อถึงจุด ผู้เฒ่าในย่านนั้นจะมาเล่าให้ฟังเอง
          </p>

          <label htmlFor="trail-select" className="sr-only">
            เลือกย่านหรือเส้นทาง
          </label>
          <div className="relative mt-3">
            <select
              id="trail-select"
              value={locId}
              onChange={(e) => {
                setLocId(e.target.value)
                setActive(null)
              }}
              className="w-full cursor-pointer appearance-none rounded-2xl border border-white/18 bg-[#3A1244]/85 px-4 py-3.5 pr-12 text-[15px] font-medium text-white outline-none transition-colors hover:border-gold200/50"
            >
              <option value="">— ยังไม่ได้เลือกเส้นทาง —</option>
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.checkpoints.length} จุด
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              size={20}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold200"
            />
          </div>

          {location && (
            <div className="anim-risein mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-lavender300">
                {location.region}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-lavender300">
                {location.tagline}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Map ── */}
      <section className="relative mx-auto max-w-2xl px-4 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mx-0 lg:max-w-none lg:px-0">
        <div className="relative h-[64vh] min-h-[440px] overflow-hidden rounded-card ring-1 ring-white/12 lg:sticky lg:top-20 lg:h-[calc(100dvh-9rem)]">
          {location ? (
            <MapLayer
              location={location}
              checkpoints={checkpoints}
              discoveredIds={discoveredIds}
              activeId={active?.id}
              onSelect={setActive}
              userPos={pos.position}
            />
          ) : (
            <EmptyMap />
          )}

          {/* layer toggle — always visible, both layers labelled */}
          <div className="absolute left-3 top-3 z-[500] flex items-center gap-1 rounded-full bg-[#2E0F35]/90 p-1 ring-1 ring-white/15 backdrop-blur">
            {[
              { id: 'standard', label: 'แผนที่จริง', icon: 'pin' },
              { id: 'explorer', label: 'นักสำรวจ', icon: 'compass' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setLayer(l.id)}
                aria-pressed={layer === l.id}
                className={`flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  layer === l.id ? 'bg-gold200 text-maroon900' : 'text-lavender300 hover:text-white'
                }`}
              >
                <Icon name={l.icon} size={15} />
                {l.label}
              </button>
            ))}
          </div>

          {location && (
            <>
              <span className="pointer-events-none absolute left-3 top-16 z-[500] rounded-full bg-[#2E0F35]/88 px-3 py-2 text-[11px] font-semibold text-gold200 ring-1 ring-white/12 backdrop-blur">
                ค้นพบแล้ว {discoveredIds.filter((id) => checkpoints.some((c) => c.id === id)).length}/
                {checkpoints.length} จุด
              </span>
              <span className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-full bg-[#2E0F35]/88 px-3 py-2 text-[11px] text-lavender300 ring-1 ring-white/12 backdrop-blur">
                แตะบ้านเพื่อดูคำแนะนำของจุดนั้น
              </span>
            </>
          )}
        </div>
      </section>

      {/* ── Trail summary strip (poster's 3-column info bar) ── */}
      {location && (
        <section className="mx-auto mt-4 grid max-w-2xl grid-cols-3 gap-2 px-4 lg:col-start-1 lg:row-start-2 lg:mx-0 lg:max-w-none lg:px-0">
          <StatPill value={checkpoints.length} label="จุดในเส้นทาง" />
          <StatPill
            value={discoveredIds.filter((id) => checkpoints.some((c) => c.id === id)).length}
            label="ค้นพบแล้ว"
          />
          <StatPill
            value={checkpoints.reduce((s, c) => s + c.clip.points, 0)}
            label="แต้มที่เก็บได้"
          />
        </section>
      )}

      {location && (
        <section className="mx-auto mt-5 max-w-2xl px-4 lg:col-start-1 lg:row-start-3 lg:mx-0 lg:max-w-none lg:px-0">
          <Eyebrow>จุดตรวจในเส้นทางนี้</Eyebrow>
          <ul className="mt-3 space-y-2">
            {checkpoints.map((cp, i) => {
              const found = discoveredIds.includes(cp.id)
              const d = distTo(cp)
              return (
                <li key={cp.id}>
                  <button
                    onClick={() => setActive(cp)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white/6 px-4 py-3 text-left ring-1 ring-white/10 transition-colors hover:bg-white/12"
                  >
                    <span className="font-display text-lg text-lavender300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{cp.name}</span>
                      <span className="block truncate text-xs text-lavender300">
                        {found ? 'ค้นพบแล้ว' : 'ยังไม่ค้นพบ'}
                        {d != null && ` · ห่าง ${fmtDistance(d)}`}
                      </span>
                    </span>
                    <Icon
                      name={found ? 'check' : 'chevron'}
                      size={18}
                      className={found ? 'text-gold200' : 'text-lavender300'}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* ── Checkpoint info card ── */}
      <Sheet
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.name ?? ''}
        labelledBy="cp-title"
      >
        {active && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gold200/15 px-3 py-1.5 text-xs font-semibold text-gold200">
                {active.era}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-lavender300">
                {active.clip.topic}
              </span>
              {discoveredIds.includes(active.id) && (
                <span className="rounded-full bg-coral500 px-3 py-1.5 text-xs font-semibold">
                  ค้นพบแล้ว
                </span>
              )}
            </div>

            <p className="text-[15px] leading-relaxed text-white/90">{active.blurb}</p>

            <div className="rounded-2xl bg-white/7 p-4 ring-1 ring-white/10">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold200">
                คำแนะนำก่อนไปถึง
              </p>
              <p className="text-sm leading-relaxed text-white/85">{active.tip}</p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/7 p-3 ring-1 ring-white/10">
              <ElderAvatar elder={elderById(active.elderId)} size={46} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {elderById(active.elderId)?.name}
                </p>
                <p className="truncate text-xs text-lavender300">
                  {elderById(active.elderId)?.craft}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-black/20 p-3 text-center text-sm">
              {activeDist == null ? (
                <span className="text-lavender300">ยังไม่ทราบตำแหน่งของคุณ</span>
              ) : nearEnough ? (
                <span className="font-semibold text-gold200">
                  คุณอยู่ในระยะแล้ว · ห่าง {fmtDistance(activeDist)}
                </span>
              ) : (
                <span className="text-lavender300">
                  ห่างจากจุดนี้ {fmtDistance(activeDist)} · ต้องเข้าใกล้กว่า {NEAR_RADIUS_M} ม.
                  จึงจะสแกนได้
                </span>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!nearEnough}
              onClick={() => navigate(`/scan/${active.id}`)}
            >
              <Icon name="scan" size={20} />
              เริ่มสแกนหาผู้เฒ่า
            </Button>

            {!nearEnough && (
              <button
                onClick={() => {
                  pos.simulateNear(active)
                  navigate(`/scan/${active.id}`)
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gold200/35 py-3 text-sm font-semibold text-gold200 transition-colors hover:bg-gold200/10"
              >
                <Icon name="sliders" size={16} />
                โหมดสาธิต · จำลองว่ายืนอยู่ตรงนี้
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}

function EmptyMap() {
  return (
    <div className="relative grid h-full place-items-center bg-[#33113B] px-6 text-center">
      <OrbitDecor />
      <div className="relative">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border border-dashed border-gold200/45">
          <Icon name="map" size={34} className="text-gold200" />
        </div>
        <p className="text-lg font-semibold">แผนที่ยังว่างอยู่</p>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-lavender300">
          เลือกเส้นทางจากรายการด้านบน จุดตรวจทั้งหมดของย่านนั้นจะปรากฏขึ้นบนแผนที่
        </p>
      </div>
    </div>
  )
}
