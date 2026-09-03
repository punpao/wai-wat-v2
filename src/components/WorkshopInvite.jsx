import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { elderById } from '../data/elders.js'
import { useStore } from '../lib/useStore.js'
import RegisterSheet from './RegisterSheet.jsx'
import { ElderAvatar } from './ElderSprite.jsx'
import { Button } from './ui.jsx'
import Icon from './Icon.jsx'

/**
 * WorkshopInvite — the offer that follows a finished clip.
 *
 * It lives at the end of the hunt on purpose. The explorer has just heard
 * someone describe a craft in their own voice and is holding the points
 * they earned getting here, which is the one moment "ไปลองทำจริงไหม" is a
 * question rather than an advert. `reason` carries why this particular
 * workshop is being raised, so the card can say it out loud — see
 * workshopSuggestionFor() for how the two tiers are chosen.
 *
 * Costs are shown against the live balance, because the points just
 * awarded a few lines up the screen are the same points being spent here.
 */
export default function WorkshopInvite({ workshop, reason, elder }) {
  const state = useStore()
  const navigate = useNavigate()
  const [registering, setRegistering] = useState(false)

  if (!workshop) return null

  const registered = state.workshopStats[workshop.id]?.registered ?? 0
  const left = Math.max(0, workshop.capacity - registered)
  const full = left <= 0
  const mine = state.workshopRegistrations.some((r) => r.workshopId === workshop.id)
  const hosts = workshop.elderIds.map(elderById).filter(Boolean)
  const points = state.user.points
  const short = elder?.short ?? 'ท่าน'

  const lead =
    reason === 'here'
      ? { label: 'มีเวิร์คช็อปที่จุดนี้', line: `ลองลงมือทำที่ตรงนี้เลยไหม` }
      : { label: 'ท่านเปิดสอนเอง', line: `อยากลองทำจริงกับ${short}ไหม` }

  return (
    <div className="w-full max-w-sm rounded-3xl bg-gold200/10 p-4 text-left ring-1 ring-gold200/35">
      <div className="flex items-center gap-2 text-gold200">
        <Icon name="workshop" size={16} className="shrink-0" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">{lead.label}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-lavender300">{lead.line}</p>

      <h3 className="mt-2 text-[17px] font-semibold leading-snug">{workshop.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-lavender300">{workshop.summary}</p>

      <dl className="mt-3 space-y-1.5 text-xs text-lavender300">
        <div className="flex items-center gap-1.5">
          <Icon name="calendar" size={14} className="shrink-0" />
          <dd>
            {workshop.schedule.day} · {workshop.schedule.time}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="pin" size={14} className="shrink-0" />
          <dd className="truncate">{workshop.venue}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="users" size={14} className="shrink-0" />
          <dd className={full ? 'font-semibold text-coral500' : ''}>
            {full ? 'ที่นั่งเต็มแล้ว' : `เหลือ ${left} ที่จาก ${workshop.capacity} ที่`}
          </dd>
        </div>
      </dl>

      {/* Hosts are named even for a `here` match: the workshop at this pin
          is not always run by the elder whose clip just played. */}
      {hosts.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {hosts.map((e) => (
              <span key={e.id} className="rounded-full ring-2 ring-[#42154B]">
                <ElderAvatar elder={e} size={28} />
              </span>
            ))}
          </div>
          <p className="min-w-0 flex-1 truncate text-xs text-lavender300">
            สอนโดย {hosts.map((e) => e.short).join(' และ ')}
          </p>
        </div>
      )}

      <div className="mt-3 rounded-xl bg-black/25 px-3 py-2">
        <p className="flex items-baseline gap-1.5">
          <span className="gold-number font-display text-lg">{workshop.cost.points}</span>
          <span className="text-xs text-lavender300">แต้ม</span>
          <span className="text-xs text-lavender300">หรือ</span>
          <span className="gold-number font-display text-lg">{workshop.cost.cash}</span>
          <span className="text-xs text-lavender300">บาท</span>
        </p>
        <p className="mt-1 text-[11px] text-lavender300">
          {points >= workshop.cost.points
            ? `แต้มที่คุณมีตอนนี้ ${points} แต้ม · พอจ่ายด้วยแต้มแล้ว`
            : `แต้มที่คุณมีตอนนี้ ${points} แต้ม · เดินอีก ${workshop.cost.points - points} แต้มก็จ่ายด้วยแต้มได้`}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {mine ? (
          <span className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-gold200 px-4 text-sm font-semibold text-maroon900">
            <Icon name="check" size={16} />
            ลงทะเบียนแล้ว
          </span>
        ) : (
          <Button size="sm" disabled={full} onClick={() => setRegistering(true)}>
            <Icon name="workshop" size={16} />
            ลงทะเบียน
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => navigate(`/workshop/${workshop.id}`)}>
          ดูรายละเอียด
          <Icon name="chevron" size={16} />
        </Button>
      </div>

      <RegisterSheet
        workshop={workshop}
        open={registering}
        onClose={() => setRegistering(false)}
      />
    </div>
  )
}
