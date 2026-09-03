import { useMemo, useState } from 'react'
import { LOCATIONS, locationById } from '../../data/locations.js'
import {
  trendingWorkshops,
  workshopsByLocation,
  WORKSHOPS,
} from '../../data/workshops.js'
import { useStore } from '../../lib/useStore.js'
import RegisterSheet from '../../components/RegisterSheet.jsx'
import WorkshopCard from '../../components/WorkshopCard.jsx'
import { Card, Eyebrow, OrbitDecor } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'
import Select from '../../components/Select.jsx'

/**
 * เวิร์คช็อป — what the elders are teaching, and where.
 *
 * Before an area is picked this is a discovery surface, so it opens on what
 * is filling up across the country. Pick an area and it narrows to that
 * trail, matching the same picker the map uses.
 */
export default function Workshops() {
  const state = useStore()
  const [locId, setLocId] = useState('')
  const [registering, setRegistering] = useState(null)

  const area = locId ? locationById(locId) : null
  const list = useMemo(
    () => (locId ? workshopsByLocation(locId) : trendingWorkshops()),
    [locId],
  )
  const mineCount = state.workshopRegistrations.length

  // Areas with nothing to teach yet would be dead ends in the picker.
  const options = LOCATIONS.filter((l) => workshopsByLocation(l.id).length).map((l) => ({
    value: l.id,
    label: l.name,
    hint: l.tagline,
    badge: `${workshopsByLocation(l.id).length} คลาส`,
    icon: 'workshop',
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <section className="relative px-4 pb-3 pt-4">
        <OrbitDecor />
        <div className="relative">
          <Eyebrow>เวิร์คช็อปภูมิปัญญา</Eyebrow>
          <h1 className="mt-1.5 text-[22px] font-semibold leading-snug sm:text-[28px]">
            ไปลงมือทำ <span className="text-gold200">กับคนที่ทำเป็นจริง ๆ</span>
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-lavender300">
            คลาสที่ผู้สูงอายุในแต่ละย่านเปิดสอนเอง ลงทะเบียนล่วงหน้าได้ที่นี่
          </p>

          <span id="ws-area-label" className="sr-only">
            เลือกบริเวณที่จะไป
          </span>
          <div className="mt-3">
            <Select
              labelledBy="ws-area-label"
              placeholder="ทุกบริเวณ · กำลังมาแรง"
              value={locId}
              onChange={setLocId}
              options={options}
            />
          </div>

          {area && (
            <button
              onClick={() => setLocId('')}
              className="anim-risein mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs text-lavender300 transition-colors hover:text-white"
            >
              <Icon name="close" size={14} />
              ล้างตัวกรอง · ดูที่กำลังมาแรงทั้งหมด
            </button>
          )}
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <Eyebrow>{area ? `เวิร์คช็อปใน${area.name}` : 'กำลังมาแรงตอนนี้'}</Eyebrow>
          <span className="shrink-0 text-xs text-lavender300">
            {list.length} คลาส
            {mineCount > 0 && ` · ลงทะเบียนไว้ ${mineCount}`}
          </span>
        </div>

        {list.length === 0 ? (
          <Card className="p-6 text-center">
            <Icon name="workshop" size={30} className="mx-auto text-gold200" />
            <p className="mt-3 font-semibold">ย่านนี้ยังไม่มีคลาสเปิด</p>
            <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-lavender300">
              ลองเลือกบริเวณอื่น หรือดูคลาสที่กำลังมาแรงจากทั่วประเทศ
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {list.map((w) => (
              <li key={w.id}>
                <WorkshopCard workshop={w} onRegister={setRegistering} showArea={!area} />
              </li>
            ))}
          </ul>
        )}

        {!area && list.length < WORKSHOPS.length && (
          <p className="mt-4 text-center text-xs text-lavender300">
            เลือกบริเวณด้านบนเพื่อดูคลาสทั้งหมดของย่านนั้น
          </p>
        )}
      </section>

      <RegisterSheet
        workshop={registering}
        open={!!registering}
        onClose={() => setRegistering(null)}
      />
    </div>
  )
}
