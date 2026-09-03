import { useNavigate } from 'react-router-dom'
import { elderById } from '../data/elders.js'
import { locationById } from '../data/locations.js'
import { useStore } from '../lib/useStore.js'
import { ElderAvatar } from './ElderSprite.jsx'
import { Button, Card } from './ui.jsx'
import Icon from './Icon.jsx'

/** One workshop in a list: enough to decide from, without opening it. */
export default function WorkshopCard({ workshop, onRegister, showArea = false }) {
  const state = useStore()
  const navigate = useNavigate()

  const registered = state.workshopStats[workshop.id]?.registered ?? 0
  const left = Math.max(0, workshop.capacity - registered)
  const full = left <= 0
  const mine = state.workshopRegistrations.some((r) => r.workshopId === workshop.id)
  const hosts = workshop.elderIds.map(elderById).filter(Boolean)
  const area = locationById(workshop.locationId)

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold200/15 text-gold200">
          <Icon name={workshop.icon} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold200">
            {workshop.craft}
          </p>
          <h3 className="mt-0.5 text-[17px] font-semibold leading-snug">{workshop.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-lavender300">{workshop.summary}</p>
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 text-xs text-lavender300">
        <div className="flex items-center gap-1.5">
          <Icon name="calendar" size={14} className="shrink-0" />
          <dd>
            {workshop.schedule.day} · {workshop.schedule.time}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="pin" size={14} className="shrink-0" />
          <dd className="truncate">{showArea ? area?.name : workshop.venue}</dd>
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
            <span key={e.id} className="rounded-full ring-2 ring-[#4A1A58]">
              <ElderAvatar elder={e} size={30} />
            </span>
          ))}
        </div>
        <p className="min-w-0 flex-1 truncate text-xs text-lavender300">
          สอนโดย {hosts.map((e) => e.short).join(' และ ')}
        </p>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5 rounded-xl bg-black/25 px-3 py-2">
        <span className="gold-number font-display text-lg">{workshop.cost.points}</span>
        <span className="text-xs text-lavender300">แต้ม</span>
        <span className="text-xs text-lavender300">หรือ</span>
        <span className="gold-number font-display text-lg">{workshop.cost.cash}</span>
        <span className="text-xs text-lavender300">บาท</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => navigate(`/workshop/${workshop.id}`)}>
          <Icon name="quote" size={16} />
          ดูรายละเอียด
        </Button>
        {mine ? (
          <span className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-gold200 px-4 text-sm font-semibold text-maroon900">
            <Icon name="check" size={16} />
            ลงทะเบียนแล้ว
          </span>
        ) : (
          <Button size="sm" disabled={full} onClick={() => onRegister(workshop)}>
            <Icon name="workshop" size={16} />
            ลงทะเบียน
          </Button>
        )}
      </div>
    </Card>
  )
}
