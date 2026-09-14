import { useState } from 'react'
import { KANON_WORKSHOP } from '../data/places.js'
import { storage } from '../lib/storage.js'
import { useStore } from '../lib/useStore.js'
import { Button, Sheet, useToast } from './ui.jsx'
import Icon from './Icon.jsx'

/**
 * จองรอบเวิร์กช็อป — the offer that lands when the tour ends.
 *
 * Nothing is charged and no payment provider is contacted; the price is
 * shown because a real booking would carry one, and the confirmation is a
 * local record the visitor can check or cancel afterwards.
 */
export default function BookingSheet({ open, onClose }) {
  const state = useStore()
  const toast = useToast()
  const [picked, setPicked] = useState(null)
  const [done, setDone] = useState(null)

  const w = KANON_WORKSHOP
  const mine = state.bookings.find((b) => b.workshopId === w.id)

  const confirm = () => {
    const next = storage.book(w, picked)
    const rec = next.bookings.find((b) => b.slotId === picked.id)
    setDone(rec ?? null)
    setPicked(null)
    if (rec) toast('จองรอบเรียบร้อยแล้ว', 'good')
  }

  const close = () => {
    setPicked(null)
    setDone(null)
    onClose?.()
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title={done ? 'จองสำเร็จแล้ว' : mine ? 'รอบที่จองไว้' : 'มาลองเชิดเองไหม'}
      labelledBy="booking-title"
    >
      {done || mine ? (
        <Confirmed rec={done ?? mine} onClose={close} />
      ) : picked ? (
        <div className="space-y-4">
          <p className="text-[15px] leading-relaxed">
            ยืนยันจอง <strong>{w.title}</strong>
          </p>
          <div className="rounded-2xl bg-black/25 p-4 text-sm">
            <Row label="วันที่" value={picked.day} />
            <Row label="เวลา" value={picked.time} />
            <Row label="สถานที่" value={w.venue} />
            <Row label="ค่าเข้าร่วม" value={`${w.price} บาท`} />
          </div>
          <p className="rounded-xl bg-gold200/12 px-3 py-2 text-xs leading-relaxed text-gold200 ring-1 ring-gold200/30">
            เป็นการจองจำลองสำหรับต้นแบบ ไม่มีการตัดเงินจริง ชำระหน้างานในระบบจริง
          </p>
          <Button size="lg" className="w-full" onClick={confirm}>
            <Icon name="check" size={20} />
            ยืนยันการจอง
          </Button>
          <Button variant="quiet" className="w-full" onClick={() => setPicked(null)}>
            เลือกรอบอื่น
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-[17px] font-semibold">{w.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-lavender300">{w.summary}</p>
          </div>

          <ul className="space-y-2">
            {w.learn.map((l) => (
              <li key={l} className="flex gap-2.5 text-sm leading-relaxed text-white/85">
                <Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold200" />
                <span>{l}</span>
              </li>
            ))}
          </ul>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold200">
              เลือกรอบที่สะดวก
            </p>
            <ul className="space-y-2">
              {w.slots.map((s) => {
                const left = s.seats - s.taken
                const full = left <= 0
                return (
                  <li key={s.id}>
                    <button
                      disabled={full}
                      onClick={() => setPicked(s)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white/7 p-3 text-left ring-1 ring-white/10 transition-colors hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold200/15 text-gold200">
                        <Icon name="calendar" size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{s.day}</span>
                        <span className="block text-xs text-lavender300">
                          {s.time} · {full ? 'เต็มแล้ว' : `เหลือ ${left} ที่`}
                        </span>
                      </span>
                      {!full && <Icon name="chevron" size={18} className="shrink-0 text-lavender300" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="text-center text-xs text-lavender300">
            ค่าเข้าร่วม {w.price} บาท · สอนโดย {w.teacher}
          </p>
        </div>
      )}
    </Sheet>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="shrink-0 text-lavender300">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  )
}

function Confirmed({ rec, onClose }) {
  const toast = useToast()
  if (!rec) return null
  return (
    <div className="space-y-4 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold200 text-maroon900">
        <Icon name="check" size={40} stroke={2.6} />
      </span>
      <p className="text-[15px] leading-relaxed">
        จองรอบเรียบร้อยแล้ว
        <br />
        <span className="text-lavender300">แสดงหมายเลขนี้ที่หน้างานได้เลย</span>
      </p>
      <div className="rounded-2xl bg-black/25 p-4 text-left text-sm">
        <Row label="หมายเลข" value={rec.ref} />
        <Row label="วันที่" value={rec.day} />
        <Row label="เวลา" value={rec.time} />
        <Row label="ค่าเข้าร่วม" value={`${rec.price} บาท`} />
      </div>
      <Button size="lg" className="w-full" onClick={onClose}>
        เข้าใจแล้ว
      </Button>
      <Button
        variant="quiet"
        className="w-full"
        onClick={() => {
          storage.cancelBooking(rec.id)
          toast('ยกเลิกการจองแล้ว', 'good')
          onClose?.()
        }}
      >
        ยกเลิกการจอง
      </Button>
    </div>
  )
}
