import { useEffect, useState } from 'react'
import { storage } from '../lib/storage.js'
import { useStore } from '../lib/useStore.js'
import { Button, Sheet, useToast } from './ui.jsx'
import Icon from './Icon.jsx'

/**
 * ลงทะเบียนเวิร์คช็อป — one flow, two ways to pay.
 *
 * Points come straight out of the balance the explorer earned by finding
 * checkpoints. Cash runs through a screen that is clearly labelled จำลอง:
 * this prototype has no backend and no payment provider, so the QR is a
 * drawing and the confirm button only writes a local record.
 */
export default function RegisterSheet({ workshop, open, onClose }) {
  const state = useStore()
  const toast = useToast()
  const [step, setStep] = useState('choose')
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    if (open) {
      setStep('choose')
      setReceipt(null)
    }
  }, [open, workshop?.id])

  if (!workshop) return null

  const points = state.user.points
  const registered = state.workshopStats[workshop.id]?.registered ?? 0
  const left = Math.max(0, workshop.capacity - registered)
  const enoughPoints = points >= workshop.cost.points
  const full = left <= 0

  const commit = (method) => {
    const next = storage.registerWorkshop(workshop, method)
    const reg = next.workshopRegistrations.find((r) => r.workshopId === workshop.id)
    if (!reg) {
      toast('ลงทะเบียนไม่สำเร็จ ที่นั่งอาจเต็มแล้ว', 'warn')
      onClose()
      return
    }
    setReceipt(reg)
    setStep('done')
  }

  const titles = {
    choose: 'เลือกวิธีลงทะเบียน',
    pay: 'ชำระเงิน (จำลอง)',
    done: 'ลงทะเบียนสำเร็จ',
  }

  return (
    <Sheet open={open} onClose={onClose} title={titles[step]} labelledBy="ws-register">
      <div className="space-y-4">
        <div className="rounded-2xl bg-white/7 p-4 ring-1 ring-white/10">
          <p className="text-[15px] font-semibold">{workshop.title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-lavender300">
            <Icon name="calendar" size={14} />
            {workshop.schedule.day} · {workshop.schedule.time}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-lavender300">
            <Icon name="users" size={14} />
            เหลือ {left} ที่จาก {workshop.capacity} ที่
          </p>
        </div>

        {step === 'choose' && (
          <>
            <p className="text-sm leading-relaxed text-lavender300">
              เลือกจ่ายด้วยแต้มภูมิปัญญาที่สะสมจากการเดินหาจุดตรวจ หรือจ่ายเป็นเงินก็ได้
            </p>

            <button
              onClick={() => commit('points')}
              disabled={!enoughPoints || full}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-gold200 p-4 text-left text-maroon900 transition-colors hover:bg-gold100 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-maroon900/10">
                <Icon name="spark" size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  จ่ายด้วยแต้ม · {workshop.cost.points} แต้ม
                </span>
                <span className="block text-xs opacity-80">
                  {enoughPoints
                    ? `คุณมี ${points} แต้ม · เหลือ ${points - workshop.cost.points} แต้มหลังจ่าย`
                    : `คุณมี ${points} แต้ม · ยังขาดอีก ${workshop.cost.points - points} แต้ม`}
                </span>
              </span>
              <Icon name="chevron" size={18} />
            </button>

            <button
              onClick={() => setStep('pay')}
              disabled={full}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white/10 p-4 text-left ring-1 ring-white/15 transition-colors hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral500/25 text-coral500">
                <Icon name="cash" size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  จ่ายเป็นเงิน · {workshop.cost.cash} บาท
                </span>
                <span className="block text-xs text-lavender300">
                  เก็บแต้มไว้ใช้ครั้งหน้า
                </span>
              </span>
              <Icon name="chevron" size={18} />
            </button>

            {full && (
              <p className="rounded-xl bg-coral500/20 px-3 py-2 text-center text-xs text-white">
                ที่นั่งเต็มแล้ว
              </p>
            )}
          </>
        )}

        {step === 'pay' && (
          <>
            <div className="rounded-2xl border border-dashed border-gold200/45 bg-black/25 p-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold200">
                หน้าจอจำลอง · ไม่มีการตัดเงินจริง
              </p>
              <div className="mx-auto mt-4 grid h-36 w-36 place-items-center rounded-2xl bg-white/95">
                <svg viewBox="0 0 100 100" width="112" height="112" aria-label="คิวอาร์โค้ดจำลอง">
                  <rect width="100" height="100" fill="#fff" />
                  <g fill="#2B0F30">
                    {[
                      [8, 8], [8, 68], [68, 8],
                    ].map(([x, y]) => (
                      <g key={`${x}-${y}`}>
                        <rect x={x} y={y} width="24" height="24" />
                        <rect x={x + 5} y={y + 5} width="14" height="14" fill="#fff" />
                        <rect x={x + 9} y={y + 9} width="6" height="6" />
                      </g>
                    ))}
                    {[
                      [40, 12], [52, 12], [40, 24], [64, 30], [40, 40], [52, 44],
                      [12, 40], [24, 52], [40, 56], [64, 56], [76, 44], [40, 68],
                      [52, 76], [64, 68], [76, 76], [88, 60], [28, 40], [76, 12],
                    ].map(([x, y]) => (
                      <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" />
                    ))}
                  </g>
                </svg>
              </div>
              <p className="mt-4 font-display text-3xl text-white">
                {workshop.cost.cash.toLocaleString('th-TH')} บาท
              </p>
              <p className="mt-1 text-xs text-lavender300">
                ในระบบจริงจุดนี้จะเชื่อมกับผู้ให้บริการชำระเงิน
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={() => commit('cash')}>
              <Icon name="check" size={20} />
              ยืนยันการชำระเงิน (จำลอง)
            </Button>
            <Button variant="quiet" className="w-full" onClick={() => setStep('choose')}>
              ย้อนกลับ
            </Button>
          </>
        )}

        {step === 'done' && receipt && (
          <div className="space-y-4 text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold200 text-maroon900">
              <Icon name="check" size={40} stroke={2.6} />
            </span>
            <p className="text-[15px] leading-relaxed">
              จองที่นั่งเรียบร้อยแล้ว
              <br />
              <span className="text-lavender300">
                ทีมงานจะส่งรายละเอียดการเดินทางให้ก่อนวันจัดงาน
              </span>
            </p>
            <div className="rounded-2xl bg-black/25 p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-lavender300">หมายเลขการจอง</span>
                <strong>{receipt.ref}</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-lavender300">ชำระด้วย</span>
                <strong>
                  {receipt.method === 'points'
                    ? `${receipt.amount} แต้ม`
                    : `${receipt.amount} บาท (จำลอง)`}
                </strong>
              </div>
              {receipt.method === 'points' && (
                <div className="mt-2 flex justify-between">
                  <span className="text-lavender300">แต้มคงเหลือ</span>
                  <strong>{points}</strong>
                </div>
              )}
            </div>
            <Button size="lg" className="w-full" onClick={onClose}>
              เข้าใจแล้ว
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  )
}
