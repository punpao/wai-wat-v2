import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOCATIONS } from '../data/locations.js'
import { storage } from '../lib/storage.js'
import { useStore } from '../lib/useStore.js'
import { usePosition } from '../lib/position.jsx'
import { useToast } from './ui.jsx'
import Icon from './Icon.jsx'

/**
 * DEMO MODE — the presenter's remote control.
 *
 * Judges will not walk to a real checkpoint during judging, so this panel
 * teleports the explorer next to any checkpoint and opens the AR scan.
 * Deliberately one tap away, deliberately out of the main visual flow.
 */
export default function DemoPanel() {
  const [open, setOpen] = useState(false)
  const state = useStore()
  const pos = usePosition()
  const navigate = useNavigate()
  const toast = useToast()

  const jump = (cp) => {
    pos.simulateNear(cp)
    setOpen(false)
    navigate(`/scan/${cp.id}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="เปิดแผงโหมดสาธิต"
        className="fixed bottom-24 right-4 z-[1100] flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border border-gold200/30 bg-[#2E0F35]/85 px-3.5 py-2.5 text-[12px] font-semibold text-gold200/90 shadow-lg shadow-black/35 backdrop-blur transition-colors hover:bg-[#3B1444] hover:text-gold200"
        style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
      >
        <Icon name="sliders" size={16} />
        เลือกจุด
      </button>

      {open && (
        <div className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/55" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="โหมดสาธิต"
            className="anim-risein relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-gold200/25 bg-[#2E0F35] p-5 pb-8 sm:rounded-3xl"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold200">
                  Demo Mode
                </p>
                <h2 className="mt-1 text-xl font-semibold">แผงสาธิตสำหรับผู้นำเสนอ</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-lavender300">
              กดจุดใดก็ได้เพื่อจำลองว่ากำลังยืนอยู่ใกล้จุดนั้น ระบบจะเปิดหน้าสแกน AR ทันที
              โดยไม่ต้องเดินไปยังพิกัดจริง
            </p>

            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3 ring-1 ring-white/10">
              <div className="text-sm">
                <p className="font-semibold">ตำแหน่งที่ใช้อยู่</p>
                <p className="text-xs text-lavender300">
                  {pos.isSimulated
                    ? `จำลอง · ${pos.position[0].toFixed(4)}, ${pos.position[1].toFixed(4)}`
                    : pos.position
                      ? `GPS จริง · ${pos.position[0].toFixed(4)}, ${pos.position[1].toFixed(4)}`
                      : 'ยังไม่ได้ระบุตำแหน่ง'}
                </p>
              </div>
              {pos.isSimulated ? (
                <button
                  onClick={pos.clearSim}
                  className="cursor-pointer rounded-full bg-white/12 px-3 py-2 text-xs font-semibold hover:bg-white/20"
                >
                  ล้างตำแหน่งจำลอง
                </button>
              ) : (
                <button
                  onClick={pos.startWatching}
                  className="cursor-pointer rounded-full bg-white/12 px-3 py-2 text-xs font-semibold hover:bg-white/20"
                >
                  ใช้ GPS จริง
                </button>
              )}
            </div>

            <div className="space-y-4">
              {LOCATIONS.map((loc) => (
                <section key={loc.id}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-lavender300">
                    {loc.name}
                  </p>
                  <div className="grid gap-2">
                    {loc.checkpoints.map((cp) => {
                      const found = state.discoveries.some((d) => d.checkpointId === cp.id)
                      return (
                        <button
                          key={cp.id}
                          onClick={() => jump(cp)}
                          className="flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3 text-left ring-1 ring-white/10 transition-colors hover:bg-white/14"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                              ฉันอยู่ใกล้ {cp.name}
                            </span>
                            <span className="block truncate text-xs text-lavender300">
                              {found ? 'ค้นพบแล้ว · เล่นซ้ำได้' : 'ยังไม่ค้นพบ'}
                            </span>
                          </span>
                          <Icon name="scan" size={20} className="shrink-0 text-gold200" />
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>

            <button
              onClick={() => {
                storage.resetAll()
                toast('ล้างข้อมูลสาธิตเรียบร้อย', 'good')
                setOpen(false)
              }}
              className="mt-5 flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 text-sm font-semibold text-lavender300 hover:text-white"
            >
              <Icon name="refresh" size={17} />
              รีเซ็ตข้อมูลทั้งหมด (เริ่มสาธิตใหม่)
            </button>
          </div>
        </div>
      )}
    </>
  )
}
