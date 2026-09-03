import { elderById } from '../data/elders.js'
import { locationById } from '../data/locations.js'
import { useStore } from '../lib/useStore.js'
import { ElderAvatar } from './ElderSprite.jsx'
import { Button } from './ui.jsx'
import Icon from './Icon.jsx'

/**
 * “อยากลองทำเองไหม” — one workshop, offered at the moment it makes sense.
 *
 * This is the compact sibling of <WorkshopCard />: it sits on top of the AR
 * camera right after a clip ends, while the elder's voice is still in the ear,
 * so it has to stay short and read on a dark, busy background. The full card
 * with the whole schedule lives on the เวิร์คช็อป tab.
 */
const REASONS = {
  here: () => 'ที่จุดนี้เปิดสอนของจริง',
  elder: (host) => `${host ?? 'ผู้สูงอายุท่านนี้'}เปิดสอนคลาสนี้เอง`,
  nearby: () => 'บนเส้นทางเดียวกันนี้',
  trending: () => 'ย่านนี้ยังไม่มีคลาส · ที่กำลังมาแรงจากย่านอื่น',
}

export default function WorkshopTeaser({ workshop, reason = 'here', onRegister, onOpen }) {
  const state = useStore()
  if (!workshop) return null

  const hosts = workshop.elderIds.map(elderById).filter(Boolean)
  const registered = state.workshopStats[workshop.id]?.registered ?? 0
  const left = Math.max(0, workshop.capacity - registered)
  const full = left <= 0
  const mine = state.workshopRegistrations.some((r) => r.workshopId === workshop.id)
  const why = (REASONS[reason] ?? REASONS.here)(hosts[0]?.short)

  return (
    <div className="w-full rounded-3xl bg-black/45 p-4 text-left ring-1 ring-gold200/30 backdrop-blur">
      <div className="flex items-center gap-2 text-gold200">
        <Icon name="workshop" size={16} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          อยากลองทำเองไหม
        </p>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold200/15 text-gold200">
          <Icon name={workshop.icon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-semibold leading-snug text-white">{workshop.title}</h3>
          <p className="mt-0.5 text-xs text-lavender300">{why}</p>
        </div>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-lavender300">{workshop.summary}</p>

      <dl className="mt-3 space-y-1.5 text-xs text-lavender300">
        <div className="flex items-center gap-1.5">
          <Icon name="calendar" size={14} className="shrink-0" />
          <dd>
            {workshop.schedule.day} · {workshop.schedule.time}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="pin" size={14} className="shrink-0" />
          <dd className="truncate">
            {reason === 'trending'
              ? `${locationById(workshop.locationId)?.name} · ${workshop.venue}`
              : workshop.venue}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="users" size={14} className="shrink-0" />
          <dd className={full ? 'font-semibold text-coral500' : ''}>
            {full ? 'ที่นั่งเต็มแล้ว' : `เหลือ ${left} ที่จาก ${workshop.capacity} ที่`}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-2">
          {hosts.map((e) => (
            <span key={e.id} className="rounded-full ring-2 ring-[#2B0F30]">
              <ElderAvatar elder={e} size={28} />
            </span>
          ))}
        </div>
        <p className="min-w-0 flex-1 truncate text-xs text-lavender300">
          สอนโดย {hosts.map((e) => e.short).join(' และ ')}
        </p>
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="gold-number font-display text-lg">{workshop.cost.points}</span>
          <span className="text-[11px] text-lavender300">แต้ม</span>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2">
        {mine ? (
          <span className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full bg-gold200 px-4 text-sm font-semibold text-maroon900">
            <Icon name="check" size={16} />
            ลงทะเบียนแล้ว
          </span>
        ) : (
          <Button
            size="sm"
            className="min-h-[44px] flex-1"
            disabled={full}
            onClick={() => onRegister?.(workshop)}
          >
            <Icon name="workshop" size={16} />
            {full ? 'ที่นั่งเต็ม' : `ลงทะเบียน · ${workshop.cost.points} แต้ม`}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="min-h-[44px]"
          onClick={() => onOpen?.(workshop)}
        >
          รายละเอียด
        </Button>
      </div>
    </div>
  )
}
