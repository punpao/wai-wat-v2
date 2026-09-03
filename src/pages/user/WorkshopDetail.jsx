import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { workshopById } from '../../data/workshops.js'
import { allCheckpoints, checkpointById } from '../../data/locations.js'
import { elderById } from '../../data/elders.js'
import { storage } from '../../lib/storage.js'
import { useStore } from '../../lib/useStore.js'
import RegisterSheet from '../../components/RegisterSheet.jsx'
import ElderSprite from '../../components/ElderSprite.jsx'
import { Button, Card, Eyebrow, OrbitDecor, thaiDate, useToast } from '../../components/ui.jsx'
import Icon from '../../components/Icon.jsx'

const TABS = [
  { id: 'detail', label: 'รายละเอียด', icon: 'quote' },
  { id: 'hosts', label: 'ผู้สอน', icon: 'users' },
]

export default function WorkshopDetail() {
  const { workshopId } = useParams()
  const navigate = useNavigate()
  const state = useStore()
  const toast = useToast()
  const [tab, setTab] = useState('detail')
  const [registering, setRegistering] = useState(false)

  const w = workshopById(workshopId)
  if (!w) {
    return (
      <div className="grid min-h-[60vh] place-items-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">ไม่พบเวิร์คช็อปนี้</p>
          <Button className="mt-4" onClick={() => navigate('/workshops')}>
            กลับไปหน้าเวิร์คช็อป
          </Button>
        </div>
      </div>
    )
  }

  const hosts = w.elderIds.map(elderById).filter(Boolean)
  const checkpoint = checkpointById(w.checkpointId)
  const registered = state.workshopStats[w.id]?.registered ?? 0
  const left = Math.max(0, w.capacity - registered)
  const mine = state.workshopRegistrations.find((r) => r.workshopId === w.id)

  return (
    <div className="mx-auto max-w-2xl pb-4">
      {/* ── Hero ── */}
      <section className="relative px-4 pb-4 pt-4">
        <OrbitDecor />
        <div className="relative">
          <button
            onClick={() => navigate('/workshops')}
            className="mb-3 inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-semibold text-lavender300 transition-colors hover:text-white"
          >
            <Icon name="chevron" size={15} className="rotate-180" />
            เวิร์คช็อปทั้งหมด
          </button>

          <Eyebrow>{w.craft}</Eyebrow>
          <h1 className="mt-1.5 text-[24px] font-semibold leading-snug">{w.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-lavender300">{w.summary}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: 'calendar', value: w.schedule.day.split('ที่ ')[1] ?? w.schedule.day, label: w.schedule.time },
              { icon: 'clock', value: w.duration, label: 'ระยะเวลา' },
              {
                icon: 'users',
                value: left > 0 ? `${left} ที่` : 'เต็ม',
                label: `จาก ${w.capacity} ที่`,
              },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl px-3 py-3 text-center">
                <Icon name={s.icon} size={18} className="mx-auto text-gold200" />
                <p className="mt-1.5 text-[13px] font-semibold leading-tight">{s.value}</p>
                <p className="mt-1 text-[11px] leading-tight text-lavender300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="px-4">
        <div
          role="tablist"
          aria-label="ข้อมูลเวิร์คช็อป"
          className="flex gap-1 rounded-full bg-black/25 p-1 ring-1 ring-white/10"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`ws-panel-${t.id}`}
              id={`ws-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors ${
                tab === t.id ? 'bg-gold200 text-maroon900' : 'text-lavender300 hover:text-white'
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
              {t.id === 'hosts' && ` (${hosts.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel: รายละเอียด ── */}
      {tab === 'detail' && (
        <section
          role="tabpanel"
          id="ws-panel-detail"
          aria-labelledby="ws-tab-detail"
          className="anim-risein space-y-3 px-4 pt-4"
        >
          <Card className="p-4">
            <p className="text-[15px] leading-relaxed text-white/90">{w.description}</p>
          </Card>

          <Card className="p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold200">
              สิ่งที่จะได้ลงมือทำ
            </p>
            <ul className="space-y-2">
              {w.learn.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-white/85">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold200">
              สถานที่จัด
            </p>
            <p className="flex gap-2.5 text-sm leading-relaxed text-white/85">
              <Icon name="pin" size={16} className="mt-0.5 shrink-0 text-lavender300" />
              <span>{w.venue}</span>
            </p>

            {checkpoint && (
              <button
                onClick={() => navigate(`/map?checkpoint=${checkpoint.id}`)}
                className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white/7 p-3 text-left ring-1 ring-white/10 transition-colors hover:bg-white/14"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral500/25 text-coral500">
                  <Icon name="map" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{checkpoint.name}</span>
                  <span className="block text-xs text-lavender300">
                    ดูจุดนี้บนแผนที่ · สแกน AR ฟังเรื่องเล่าได้ด้วย
                  </span>
                </span>
                <Icon name="chevron" size={18} className="shrink-0 text-lavender300" />
              </button>
            )}
          </Card>
        </section>
      )}

      {/* ── Panel: ผู้สอน ── */}
      {tab === 'hosts' && (
        <section
          role="tabpanel"
          id="ws-panel-hosts"
          aria-labelledby="ws-tab-hosts"
          className="anim-risein space-y-3 px-4 pt-4"
        >
          {hosts.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start gap-3">
                <ElderSprite elder={e} size={72} />
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold">{e.name}</p>
                  <p className="mt-0.5 text-xs text-lavender300">
                    อายุ {e.age} ปี · {e.area}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{e.craft}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-black/25 px-3 py-2 text-center">
                  <p className="gold-number font-display text-lg">
                    {allCheckpoints().filter((c) => c.elderId === e.id).length}
                  </p>
                  <p className="text-[11px] text-lavender300">เรื่องเล่าบนเส้นทาง</p>
                </div>
                <div className="rounded-xl bg-black/25 px-3 py-2 text-center">
                  <p className="gold-number font-display text-lg">{w.capacity}</p>
                  <p className="text-[11px] text-lavender300">รับได้ต่อรอบ</p>
                </div>
              </div>
            </Card>
          ))}

          <p className="px-1 text-center text-xs leading-relaxed text-lavender300">
            ทุกท่านเป็นผู้ถ่ายทอดในย่านนี้จริง และเป็นเจ้าของเรื่องเล่าที่คุณฟังได้ในโหมด AR
          </p>
        </section>
      )}

      {/* ── Register ── */}
      <section className="px-4 pt-5">
        <Card className="p-4">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="gold-number font-display text-2xl">{w.cost.points}</span>
            <span className="text-sm text-lavender300">แต้ม</span>
            <span className="mx-1 text-sm text-lavender300">หรือ</span>
            <span className="gold-number font-display text-2xl">{w.cost.cash}</span>
            <span className="text-sm text-lavender300">บาท</span>
          </div>

          {mine ? (
            <div className="mt-3 space-y-2">
              <p className="flex items-center justify-center gap-2 rounded-2xl bg-gold200 py-3 text-sm font-semibold text-maroon900">
                <Icon name="check" size={18} />
                ลงทะเบียนแล้วเมื่อ {thaiDate(mine.at)} · {mine.ref}
              </p>
              <Button
                variant="quiet"
                className="w-full"
                onClick={() => {
                  storage.cancelWorkshopRegistration(mine.id)
                  toast(
                    mine.method === 'points'
                      ? `ยกเลิกแล้ว คืน ${mine.amount} แต้มให้เรียบร้อย`
                      : 'ยกเลิกการลงทะเบียนแล้ว',
                    'good',
                  )
                }}
              >
                ยกเลิกการลงทะเบียน
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="mt-3 w-full"
              disabled={left <= 0}
              onClick={() => setRegistering(true)}
            >
              <Icon name="workshop" size={20} />
              {left > 0 ? 'ลงทะเบียนเข้าร่วม' : 'ที่นั่งเต็มแล้ว'}
            </Button>
          )}
        </Card>
      </section>

      <RegisterSheet workshop={w} open={registering} onClose={() => setRegistering(false)} />
    </div>
  )
}
